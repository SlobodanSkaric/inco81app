import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("customers")
export class Customers {
    @PrimaryGeneratedColumn({ type: "int", name: "customer_id" })
    customerId: number;

    @Column("varchar", { name: "customer_name", length: 255 })
    customerName: string;

    @Column("boolean", { name: "is_active", default: true })
    isActive: boolean;

    @Column("varchar", { name: "contact_email", length: 255, unique: true })
    contactEmail: string;

    @Column("varchar", { name: "phone_number", length: 20, nullable: true })
    phoneNumber?: string;

    @Column("varchar", { name: "address", length: 500, nullable: true })
    address?: string;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;
}