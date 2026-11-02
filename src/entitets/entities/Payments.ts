import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Users } from "./Users";

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity("payments")
export class Payments {
    @PrimaryGeneratedColumn({type: "int", name: "id" })
    id: number;

    @ManyToOne(() => Users, user => user.payments)
    @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
    user: Users;

    @Column("int", { name: "user_id" })
    userId: number;

    @Column("decimal", { name: "amount", precision: 10, scale: 2 })
    amount: number;

    @Column("varchar", { name: "descriptions", nullable: true, length: 255 })
    descriptions: string;

    @Column("date", { name: "payment_date" })
    paymentDate: Date;


    @Column("enum", { name: "status", enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column("varchar", {name: "note", nullable: true, length: 255})
    note: string;

    @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;

} 