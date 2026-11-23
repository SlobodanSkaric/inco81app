import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";

@Entity("vacations")
export class Vacations {
    @PrimaryGeneratedColumn({ type: "int", name: "vacation_id" })
    vacationId: number;

    @Column({ type: "datetime", nullable: false })
    vacation_start: Date;

    @Column({ type: "datetime", nullable: false })
    vacation_end: Date;

    @Column({ type: "varchar", length: 256, default: "" })
    reason: string;

    /** 1 = pending, 2 = approved, 3 = rejected */
    @Column({ type: "int", name: "status", default: 1 })
    status: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "text", nullable: true })
    admin_comment: string | null;

    @Column({ type: "text", nullable: true })
    user_comment: string | null;

    @ManyToOne(() => Users, (users) => users.vacations, { nullable: false })
    @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
    user: Users;
}
