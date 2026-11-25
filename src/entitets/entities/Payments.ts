import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";
import { Orders } from "./Orders";

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

    @ManyToOne(() => Orders, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "order_id", referencedColumnName: "orderId" })
    order: Orders | null;

    @Column("int", { name: "order_id", nullable: true, unique: true })
    orderId: number | null;

    @Column("decimal", { name: "amount", precision: 10, scale: 2 })
    amount: string;

    @Column("varchar", { name: "descriptions", nullable: true, length: 255 })
    descriptions: string;

    @Column("date", { name: "payment_date" })
    paymentDate: Date;

    @Column("enum", { name: "status", enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column("varchar", { name: "note", nullable: true, length: 255 })
    note: string | null;

    @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;
}
