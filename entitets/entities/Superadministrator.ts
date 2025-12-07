import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("superadministrator")
export class Superadministrator {
    @PrimaryGeneratedColumn({ type: "int", name: "superadministrator_id" })
    superAdmistratorId: number;

    @Column("varchar", { name: "username", length: 255 })
    username: string;

    @Column("varchar", { name: "password", length: 255 })
    password: string;

    @Column("varchar", { name: "email", length: 255 })
    email: string;

    @Column("varchar", { name:"phone_number", length: 20, nullable: true})
    phoneNumber?: string;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;
}