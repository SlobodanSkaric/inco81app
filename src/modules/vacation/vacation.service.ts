import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vacations } from 'src/entitets/entities/Vacations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AddVacationsDto } from './dto/add.vacations.dto';
import { dataUtils } from 'src/utils/data.utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VactionRequestCreatedEvent } from './events/vaction.events.def';
import { VacationStatus } from './dto/vacation.status.enum';
import { Users } from 'src/entitets/entities/Users';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';
import { runInTransaction, txAbort } from 'src/misc/transaction.abort';

@Injectable()
export class VacationService {
    constructor(
        @InjectRepository(Vacations) private readonly vacation: Repository<Vacations>,
        private readonly dataSource: DataSource,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findAllForUser(userId: number): Promise<Vacations[] | ApiResponse> {
        const alllVacations = await this.vacation.find({ where: { user: { userId: userId } } });

        if (alllVacations.length === 0) {
            return new ApiResponse("error", 404, "No vacations found!");
        }

        return alllVacations;
    }

    /** Vacations for employees managed by this administrator. */
    async findAllForManager(managerId: number): Promise<Vacations[] | ApiResponse> {
        const teamVacations = await this.vacation.find({
            where: { user: { managerId, visibility: 1 } },
            relations: { user: true },
            order: { created_at: "DESC" },
        });

        if (teamVacations.length === 0) {
            return new ApiResponse("error", 404, "No vacations found!");
        }

        return teamVacations;
    }

    /** All vacations (superadministrator). */
    async findAll(): Promise<Vacations[] | ApiResponse> {
        const all = await this.vacation.find({
            where: { user: { visibility: 1 } },
            relations: { user: true },
            order: { created_at: "DESC" },
        });
        if (all.length === 0) {
            return new ApiResponse("error", 404, "No vacations found!");
        }
        return all;
    }

    async findById(id: number, userId: number): Promise<Vacations | ApiResponse> {
        const vacations = await this.vacation.findOne({ where: { vacationId: id, user: { userId } } });

        if (!vacations) {
            return new ApiResponse("error", 404, "Vacation not found!");
        }

        return vacations;
    }

    async addVactions(vacationsData: AddVacationsDto, userId: number): Promise<Vacations | ApiResponse> {
        let start: Date;
        let end: Date;
        try {
            start = dataUtils(vacationsData.vacation_start);
            end = dataUtils(vacationsData.vacation_end);
        } catch {
            return new ApiResponse("error", 400, "Invalid date and time format. Use YYYY-MM-DD HH:mm:ss");
        }

        if (end.getTime() < start.getTime()) {
            return new ApiResponse("error", 400, "Vacation end must be on or after vacation start");
        }

        let managerEmail: string | null = null;
        let managerId: number | null = null;

        const result = await runInTransaction(this.dataSource, async (manager) => {
            const user = await manager.findOne(Users, {
                where: { userId, visibility: 1 },
                lock: { mode: "pessimistic_write" },
                relations: { manager: true },
            });
            if (!user) {
                txAbort("error", 404, "User not found");
            }
            if (user.managerId == null) {
                txAbort(
                    "error",
                    400,
                    "Cannot request vacation: no manager assigned. Contact a superadministrator.",
                );
            }

            managerId = user.managerId;

            if (user.manager?.email && user.manager.visibility === 1) {
                managerEmail = user.manager.email;
            } else {
                const managerUser = await manager.findOne(Users, {
                    where: { userId: user.managerId, visibility: 1 },
                });
                managerEmail = managerUser?.email ?? null;
            }

            const overlapping = await this.findOverlap(
                manager,
                userId,
                start,
                end,
                [VacationStatus.PENDING, VacationStatus.APPROVED],
            );
            if (overlapping) {
                txAbort(
                    "error",
                    409,
                    "Overlapping vacation request already exists for this period",
                );
            }

            const newVacations = manager.create(Vacations, {
                vacation_start: start,
                vacation_end: end,
                user: { userId } as Users,
                reason: vacationsData.reason,
                user_comment: vacationsData.user_comment ?? null,
                status: VacationStatus.PENDING,
            });
            const saved = await manager.save(newVacations);
            if (!saved) {
                txAbort("error", 500, "Cannot add vacation!");
            }
            return saved;
        });

        if (result instanceof ApiResponse) {
            return result;
        }

        this.invalidateVacationCache(userId, managerId);

        this.eventEmitter.emit(
            "vacation.request.created",
            new VactionRequestCreatedEvent(result.vacationId, userId, managerEmail),
        );

        return result;
    }

    /** Invalidates cached vacation / pending-request listings for the employee and their manager. */
    invalidateVacationCache(userId: number, managerId?: number | null): void {
        const keys = [
            `user:${userId}:/vacation/myvacations`,
        ];
        if (managerId != null) {
            keys.push(
                `administrator:${managerId}:/vacation/allvacations`,
                `administrator:${managerId}:/administrator/getallvactions`,
            );
        }
        this.eventEmitter.emit(
            "cache.invalidate",
            new CacheIvalidationEvent(
                keys,
                [
                    `user:${userId}:/vacation/*`,
                    "administrator:*:/vacation/*",
                    "superadministrator:*:/vacation/*",
                    "administrator:*:/administrator/getallvactions",
                    "superadministrator:*:/administrator/getallvactions",
                ],
                "Vacations",
                "update",
            ),
        );
    }

    /** Used by admin approve path to reject overlapping approved ranges. */
    async hasApprovedOverlap(
        manager: EntityManager,
        userId: number,
        start: Date,
        end: Date,
        excludeVacationId?: number,
    ): Promise<boolean> {
        return !!(await this.findOverlap(
            manager,
            userId,
            start,
            end,
            [VacationStatus.APPROVED],
            excludeVacationId,
        ));
    }

    private findOverlap(
        manager: EntityManager,
        userId: number,
        start: Date,
        end: Date,
        statuses: VacationStatus[],
        excludeVacationId?: number,
    ): Promise<Vacations | null> {
        const qb = manager
            .getRepository(Vacations)
            .createQueryBuilder("v")
            .innerJoin("v.user", "u")
            .where("u.userId = :userId", { userId })
            .andWhere("v.status IN (:...statuses)", { statuses })
            .andWhere("v.vacation_start <= :end", { end })
            .andWhere("v.vacation_end >= :start", { start })
            .setLock("pessimistic_write");

        if (excludeVacationId != null) {
            qb.andWhere("v.vacationId != :excludeId", { excludeId: excludeVacationId });
        }

        return qb.getOne();
    }
}
