import { Column, Entity, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Administrator } from "./Administrator";
import { Users } from "./Users";


@Entity("vacations", { schema: "inco81app" })                                                                               
export class Vacations {
    @PrimaryGeneratedColumn({ type: "int", name: "vacation_id" })
    vacationId: number;

    @Column({ type: "datetime", nullable: true  })
    vacation_start: Date;

    @Column({ type: "datetime", nullable: true  })
    vacation_end: Date;

    @Column({ type: "int", name: "user_id", default:() => "'0'" })
    userId: number;

    @Column({ type: "int", name: "admin_id", default: () => "'0'" })
    adminId: number;

    @Column({ type: "varchar", length: 256, default: () => "'0'" })
    reason: string;

    @Column({ type: "int", name: "status", default: () => "'0'" })
    status: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "text", nullable: true })
    admin_comment: string | null;

    @Column({ type: "text", nullable: true })
    user_comment: string | null;

    @ManyToMany(() => Administrator, (administrator) => administrator.adminId)
    administrators: Administrator[];

    @OneToOne(() => Users, (users) => users.userId)
    users: Users;
}