import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";
import { Administrator } from "./Administrator";
import { Superadministrator } from "./Superadministrator";

@Entity("request_log")
export class RequestLogs{

    @PrimaryGeneratedColumn({ type: "int", name: "request_log_id" })
    requestLogId:number;

    @ManyToOne(() => Users, (user) => user.requestLogs, { nullable: true, onDelete: "RESTRICT", onUpdate: "CASCADE" })
    @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
    userId: Users[];

    @ManyToOne(() => Administrator, (admin) => admin.requestLogs, { nullable: true, onDelete: "RESTRICT", onUpdate: "CASCADE" })
    @JoinColumn({ name: "admin_id", referencedColumnName: "adminId" })
    adminId: Administrator[];

    @ManyToOne(() => Superadministrator, (superadmin) => superadmin.requestLogs, { nullable: true, onDelete: "RESTRICT", onUpdate: "CASCADE" })
    @JoinColumn({ name: "superadministrator_id", referencedColumnName: "superAdmistratorId" })
    superadminId: Superadministrator[];

    @Column("varchar", { name:"ip", nullable:true})
    ip:string;

    @Column("text", { name:"user_agent", nullable:true})
    userAgent?:string;

    @Column("varchar", { name:"accept_language", nullable:true})
    acceptLanguage?:string;

    @Column("text", { name:"device_fingerprint", nullable:true})
    deviceFingerprint?:string;

    @Column("varchar", { name:"route", nullable:true})
    route?:string;

    @Column("int", { name:"response_status", nullable:true})
    responseStatus?:number;

    @Column("int", { name:"response_time", nullable:true})
    responseTime?:number;

    @Column("varchar", { name: "request_method", nullable:true})
    requestMethod?:string;

    @Column("datetime", { name:"ts", default: () => "CURRENT_TIMESTAMP"})
    ts:Date;
}