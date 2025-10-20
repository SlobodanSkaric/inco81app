import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";


@Entity("job_information")
export class JobInformations {
    @PrimaryGeneratedColumn({ type: "int", name: "job_information_id" })
    id: number;

    @Column("int", { name: "administrator_id", nullable: true })
    administratorId?: number;

    @Column("varchar", { name: "job_title", length: 255 })
    jobTitle: string;

    @Column("varchar", { name: "company_name", length: 255 })
    companyName: string;

    @Column("varchar", { name: "location", length: 255, nullable: true })
    location?: string;

    @Column("date", { name: "start_date" })
    startDate: Date;

    @Column("date", { name: "end_date", nullable: true })
    endDate?: Date;

    @Column("text", { name: "job_description", nullable: true })
    jobDescription?: string;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;
}