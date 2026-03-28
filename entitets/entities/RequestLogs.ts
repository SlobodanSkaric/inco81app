import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("request_log")
export class RequestLogs{

    @PrimaryGeneratedColumn({ type: "int", name: "request_log_id" })
    requestLogId:number;

    @Column("int", { name:"user_id", nullable:true })
    userId?:number;

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