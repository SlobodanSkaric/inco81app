import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entitets/entities/Users';
import { ApiResponse } from 'src/misc/api.response.dto';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { runInTransaction, txAbort } from 'src/misc/transaction.abort';
import { UserInfoDto } from './dto/user.info.dto';
import { UserAddDto } from './dto/user.add.dto';
import * as bcrypt from "bcrypt";
import { UserVisibilityDto } from './dto/user.visibility.dto';
import { UserEditDto } from './dto/user.edit.dto';
import {EventEmitter2} from '@nestjs/event-emitter';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';
import { Role } from '../../common/enums/role.enum';
import { SessionsRevokedEvent } from '../../common/events/auth.events';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import {
    restoreSoftDeleteEmail,
    restoreSoftDeletePhone,
    softDeleteEmail,
    softDeletePhone,
} from 'src/utils/soft.delete.identity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Users) private readonly userEntitets: Repository<Users>,
        private readonly eventEmmiter: EventEmitter2,
        private readonly dataSource: DataSource,
    ){}

    async getAllUsers(userId: number): Promise<UserInfoDto[] | ApiResponse>{
       const allUsers = await this.userEntitets.find({ where: { role: Role.USER, managerId: userId, visibility: 1} });

       if(allUsers.length === 0){
        return new ApiResponse("error", 404, "No users");
       }

       const userInfoDto: UserInfoDto[] = [];

       allUsers.forEach((data) => {
        userInfoDto.push(new UserInfoDto(data.userId, data.name, data.lastname, data.email, data.phonenumber ?? ""));
       });

       if(userInfoDto.length === 0){
        return new ApiResponse("error", 404, "No users");
       }

       return userInfoDto;
    }

    async getUserById(id: number): Promise<UserInfoDto | ApiResponse>{
        
        const user = await this.userEntitets.findOne({ where: { userId: id, visibility: 1 } });

        if(!user){
            return new ApiResponse("error", 404, "No user");
        }

        return new UserInfoDto(user.userId, user.name, user.lastname, user.email, user.phonenumber ?? "");
    }

    async findUserById(id: number): Promise<Users | null>{
        const user = await this.userEntitets.findOne({ where: { userId: id } });
        if(!user){
            return null;
        }
        return user;
    }

    async getByEmail(email: string): Promise<Users | null>{
            const user = await this.userEntitets.findOne({ where : { email: email.trim().toLowerCase() } });
    
            if(!user){
                return null;
            }
    
            return user;
        }

    async addUser(data: UserAddDto, userId: number): Promise<UserInfoDto | ApiResponse>{
        const user = new Users();

        const saltRound = 10;

        user.name = data.name;
        user.lastname = data.lastname;
        user.email = data.email.trim().toLowerCase();
        user.phonenumber = data.phonenumber;
        user.role = Role.USER;
        user.managerId = userId;
        user.manager = { userId } as Users;
        const passwordHash = await bcrypt.hash(data.password, saltRound);

        user.password = passwordHash;

        try{
            const saveUser = await this.userEntitets.save(user);
            this.eventEmmiter.emit("cache.invalidate",
                new CacheIvalidationEvent([`administrator:${userId}:/user/all`], [], "Users", "create")
            );
            return await this.getUserByIdLocal(saveUser.userId);
        }catch(error: any){
            if(error.errno === 1062 || error.code === "ER_DUP_ENTRY" || error.errno === 23505){
                throw new ConflictException("User that this email or phone number alredy existe");
            }
            throw error;
        }
    }


    async getUserByIdLocal(id: number): Promise<UserInfoDto | ApiResponse>{
        const user = await this.userEntitets.findOne({ where: { userId: id, visibility: 1 } });

        if(!user){
            return new ApiResponse("error", 404, "No user");
        }

        const userIfno = new UserInfoDto(user.userId, user.name, user.lastname, user.email, user.phonenumber ?? "");
        return userIfno;

    }

    

    async deleteUser(user_data: UserVisibilityDto, userId: number): Promise<ApiResponse>{
        try {
            const result = await runInTransaction(this.dataSource, async (manager) => {
                const user = await manager.findOne(Users, {
                    where: { userId: user_data.user_id, role: Role.USER, managerId: userId },
                    lock: { mode: "pessimistic_write" },
                });

                if (!user) {
                    txAbort("error", 404, "No user");
                }

                if (user_data.visible == user.visibility) {
                    txAbort("error", 409, "User already has this visibility");
                }

                if (user_data.visible === 0) {
                    user.visibility = 0;
                    user.email = softDeleteEmail(user.email, user.userId);
                    if (user.phonenumber) {
                        user.phonenumber = softDeletePhone(user.phonenumber, user.userId);
                    }

                    const openShifts = await manager.find(TimeOfWorke, {
                        where: {
                            user: { userId: user.userId },
                            status: 0,
                            checked_in: Not(IsNull()),
                            checked_out: IsNull(),
                        },
                    });
                    for (const shift of openShifts) {
                        shift.checked_out = shift.checked_in ?? new Date();
                        shift.status = 1;
                        await manager.save(shift);
                    }
                } else {
                    const restoredEmail = restoreSoftDeleteEmail(user.email, user.userId);
                    if (restoredEmail) {
                        const emailTaken = await manager.findOne(Users, {
                            where: { email: restoredEmail, userId: Not(user.userId) },
                        });
                        if (emailTaken) {
                            txAbort("error", 409, "Email already in use by another user");
                        }
                        user.email = restoredEmail;
                    }
                    if (user.phonenumber) {
                        const restoredPhone = restoreSoftDeletePhone(user.phonenumber, user.userId);
                        if (restoredPhone) {
                            const phoneTaken = await manager.findOne(Users, {
                                where: { phonenumber: restoredPhone, userId: Not(user.userId) },
                            });
                            if (phoneTaken) {
                                txAbort("error", 409, "Phone number already in use by another user");
                            }
                            user.phonenumber = restoredPhone;
                        }
                    }
                    user.visibility = 1;
                }

                await manager.save(user);
                return user;
            });

            if (result instanceof ApiResponse) {
                return result;
            }

            this.eventEmmiter.emit("cache.invalidate",
                new CacheIvalidationEvent(
                    [
                        `administrator:${userId}:/user/all`,
                    ],
                    [
                        "administrator:*:/user/all",
                    ],
                    "Users",
                    "update"
                )
            );
            if (result.visibility === 0) {
                await this.eventEmmiter.emitAsync(
                    "auth.sessions.revoked",
                    new SessionsRevokedEvent(result.userId.toString(), Role.USER),
                );
                return new ApiResponse("ok", 0, "User successfuly hidden");
            }
            return new ApiResponse("ok", 1, "User successfuly unhidden");
        } catch (e) {
            return new ApiResponse("error", 500, "Cant change user visibility");
        }
    }    
    
    
    
    async editUser(userData: UserEditDto, userId: number): Promise<UserInfoDto | ApiResponse>{
        const user = await this.userEntitets.findOne({ where: { userId: userId, visibility: 1} });
        if(!user){
            return new ApiResponse("error", 404, "No user");
        }

        const normalizedEmail = userData.email ? userData.email.trim().toLowerCase() : undefined;
        const checkedEmail = normalizedEmail ? await this.userEntitets.findOne({ where : { email: normalizedEmail, userId: Not(userId)}}) : null;

        if(checkedEmail){//This condition is checked
            return new ApiResponse("error", 409, "Email already in use");
        }

        const checkedPhonenumber = userData.phonenumber ? await this.userEntitets.findOne({ where : { phonenumber: userData.phonenumber, userId: Not(userId)}}) : null ;

        if(checkedPhonenumber){// This condition is checked
            return new ApiResponse("error", 409, "Phone number already in use");
        }

        user.name = userData.name ? userData.name : user.name;
        user.lastname = userData.lastname ? userData.lastname : user.lastname;
        user.email = normalizedEmail ? normalizedEmail : user.email;
        user.phonenumber = userData.phonenumber? userData.phonenumber : user.phonenumber;

        if(userData.password){
            const saltRound = 10;
            const passwordHash = await bcrypt.hash(userData.password, saltRound);
            user.password = passwordHash;
        }

        try{
            const saveUser = await this.userEntitets.save(user);

            this.eventEmmiter.emit("cache.invalidate",
                new CacheIvalidationEvent(
                    [
                        `user:${saveUser.userId}:/user`,
                        `user:${saveUser.userId}:/user/all`,
                        `user:${saveUser.userId}:/user`,
                    ],
                    [
                        "administrator:*:/user/all",
                    ],
                    "Users",
                    "update"
                )
            )
            

            if(userData.password){
                await this.eventEmmiter.emitAsync("auth.sessions.revoked", new SessionsRevokedEvent(saveUser.userId.toString(), Role.USER));
            }

            return await this.getUserByIdLocal(saveUser.userId);
        }catch(e){
            return new ApiResponse("error", 500, "Cant update user");
        }
    }

    //Thus refactor this function to get all users time of work and return the time of work for each user
    async getAllUsersTimeOfWork(adminId: number): Promise<UserInfoDto[] | ApiResponse>{
        const allUsers = await this.userEntitets.createQueryBuilder("users")
        .leftJoinAndSelect(
            "users.timeOfWorkes",
            "timeOfWorkes",
            "timeOfWorkes.status = :status",
            { status: 0 }
        )
        .where("users.managerId = :managerId", { managerId: adminId })
        .andWhere("users.visibility = :visibility", { visibility: 1 })
        .getMany();

        if(allUsers.length === 0){
            return new ApiResponse("error", 404, "No users");
        }

        const userInfoDto: UserInfoDto[] = [];
        let sumTimeOfWork = 0;  

        allUsers.forEach((data) => {
            const timeOfWorkSet = data.timeOfWorkes;
            timeOfWorkSet.forEach((dataSet) => {
                if (!dataSet.checked_in || !dataSet.checked_out) {
                    return;
                }
                sumTimeOfWork += dataSet.checked_out.getTime() - dataSet.checked_in.getTime();
            });
            let sumTimeOfWorkset = Number((sumTimeOfWork / (1000 * 60 * 60)).toFixed(2)); 
            let sufix = "H";

            if(sumTimeOfWorkset > 0 && sumTimeOfWorkset < 1){
                sufix = "min";
                sumTimeOfWorkset = Math.round(sumTimeOfWorkset * 60);
            }
            userInfoDto.push(new UserInfoDto(data.userId, data.name, data.lastname, data.email, data.phonenumber ?? "",data.timeOfWorkes,sumTimeOfWorkset.toString() + sufix));
            sumTimeOfWork = 0;
        });

        return userInfoDto;
    }

    async getUserTimeOfWorkById(userId: number): Promise<UserInfoDto | ApiResponse>{
        const user = await this.userEntitets.findOne({ where: { userId: userId, visibility: 1 } });
        if(!user){
            return new ApiResponse("error", 404, "No user");
        }
        return new UserInfoDto(user.userId, user.name, user.lastname, user.email, user.phonenumber ?? "");
    }
        
}
