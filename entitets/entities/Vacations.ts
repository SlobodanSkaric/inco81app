import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Administrator } from "./Administrator";
import { Users } from "./Users";


@Entity("vacations")                                                                               
export class Vacations {
    @PrimaryGeneratedColumn({ type: "int", name: "vacation_id" })
    vacationId: number;

    @Column({ type: "datetime", nullable: true  })
    vacation_start: Date;

    @Column({ type: "datetime", nullable: true  })
    vacation_end: Date;

    @Column({ type: "varchar", length: 256, default: 0 })
    reason: string;

    @Column({ type: "int", name: "status", default: 0 })
    status: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "text", nullable: true })
    admin_comment: string | null;

    @Column({ type: "text", nullable: true })
    user_comment: string | null;

    @ManyToOne(() => Administrator, (administrator) => administrator.vacations)
    @JoinColumn({ name: "admin_id", referencedColumnName: "adminId" })
    admin: Administrator;

    @ManyToOne(() => Users, (users) => users.vacations)
    @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
    user: Users;
}