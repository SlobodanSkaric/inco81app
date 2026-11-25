import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobInformations } from 'src/entitets/entities/JobInformations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';
import { runInTransaction, txAbort } from 'src/misc/transaction.abort';
import { AddJobinfoDto } from './dtos/add.jobinfo.dto';
import { Users } from 'src/entitets/entities/Users';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class JobinformationsService {
    constructor(
        @InjectRepository(JobInformations) private readonly jobinfo: Repository<JobInformations>,
        @InjectRepository(Users) private readonly usersRepository: Repository<Users>,
        private readonly dataSource: DataSource,
        private readonly eventEmitter: EventEmitter2,
    ){}

    async findAllJob(requesterId: number, role: Role): Promise<JobInformations[] | ApiResponse> {
        let jobinfos: JobInformations[];

        if (role === Role.SUPER_ADMIN) {
            jobinfos = await this.jobinfo.find();
        } else if (role === Role.ADMIN) {
            jobinfos = await this.jobinfo
                .createQueryBuilder("job")
                .innerJoin(Users, "u", "u.user_id = job.user_id")
                .where("(u.manager_id = :managerId OR job.user_id = :requesterId)", {
                    managerId: requesterId,
                    requesterId,
                })
                .getMany();
        } else {
            jobinfos = await this.jobinfo
                .createQueryBuilder("job")
                .where("job.user_id = :requesterId", { requesterId })
                .getMany();
        }
        
        if(jobinfos.length === 0){
            return new ApiResponse("error", 404, "No job informations found");
        }

        return jobinfos;
    }

    async getJobById(id: number, requesterId: number, role: Role): Promise<JobInformations | ApiResponse> {
        const jobinfo = await this.jobinfo.findOne({ where: { jobInfoId: id }});

        if(!jobinfo){
            return new ApiResponse("error", 404, "Job information not found");
        }

        const ownerId = Number(jobinfo.userId);
        if (role === Role.USER && ownerId !== requesterId) {
            return new ApiResponse("error", 403, "You are not authorized to view this job information");
        }

        if (role === Role.SUPER_ADMIN) {
            return jobinfo;
        }

        if (role === Role.ADMIN) {
            if (ownerId !== requesterId) {
                const employee = await this.usersRepository.findOne({
                    where: { userId: ownerId, managerId: requesterId, role: Role.USER },
                });
                if (!employee) {
                    return new ApiResponse("error", 403, "You are not authorized to view this job information");
                }
            }
        }

        return jobinfo;
    }

    async addJobs(
        jobinfos: AddJobinfoDto,
        adminId: number,
        role: Role = Role.ADMIN,
    ): Promise<JobInformations | ApiResponse> {
        const employee = await this.usersRepository.findOne({
            where:
                role === Role.SUPER_ADMIN
                    ? { userId: jobinfos.userId, role: Role.USER, visibility: 1 }
                    : { userId: jobinfos.userId, role: Role.USER, visibility: 1, managerId: adminId },
        });

        if (!employee) {
            return new ApiResponse(
                "error",
                404,
                role === Role.SUPER_ADMIN
                    ? "Employee not found"
                    : "Employee not found under this administrator",
            );
        }

        if (jobinfos.endDate && new Date(jobinfos.endDate).getTime() < new Date(jobinfos.startDate).getTime()) {
            return new ApiResponse("error", 400, "endDate must be on or after startDate");
        }

        const startDate = new Date(jobinfos.startDate);
        const endDate = jobinfos.endDate ? new Date(jobinfos.endDate) : undefined;

        const saved = await runInTransaction(this.dataSource, async (manager) => {
            // Serialise concurrent inserts for the same employee.
            await manager.findOne(Users, {
                where: { userId: jobinfos.userId },
                lock: { mode: "pessimistic_write" },
            });

            // Ranges overlap when existing.start <= new.end AND existing.end >= new.start
            // (a NULL end date means the position is still open-ended).
            const overlapQb = manager
                .getRepository(JobInformations)
                .createQueryBuilder("job")
                .where("job.user_id = :userId", { userId: jobinfos.userId })
                .andWhere("(job.end_date IS NULL OR job.end_date >= :start)", { start: startDate });

            if (endDate) {
                overlapQb.andWhere("job.start_date <= :end", { end: endDate });
            }

            const overlap = await overlapQb.getOne();
            if (overlap) {
                txAbort("error", 409, "Job information overlaps an existing date range for this employee");
            }

            const addJobs = new JobInformations();

            addJobs.userId = jobinfos.userId;
            addJobs.jobTitle = jobinfos.jobTitle;
            addJobs.companyName = jobinfos.companyName;
            addJobs.location = jobinfos.location;
            addJobs.startDate = startDate;
            addJobs.endDate = endDate;
            addJobs.jobDescription = jobinfos.jobDescription;

            const saveJobInfo = await manager.save(addJobs);

            if(!saveJobInfo){
                txAbort("error", 500, "Could not save job information");
            }

            return saveJobInfo;
        });

        if (saved instanceof ApiResponse) {
            return saved;
        }

        this.eventEmitter.emit(
            "cache.invalidate",
            new CacheIvalidationEvent(
                [
                    `user:${jobinfos.userId}:/jobinformations/all`,
                    `administrator:${adminId}:/jobinformations/all`,
                ],
                [
                    `user:${jobinfos.userId}:/jobinformations/*`,
                    "administrator:*:/jobinformations/*",
                    "superadministrator:*:/jobinformations/*",
                ],
                "JobInformations",
                "create",
            ),
        );

        return saved;
    }
}
