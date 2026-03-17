import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItems } from "./OrderItems";

@Entity("orders")
export class Orders {
    @PrimaryGeneratedColumn({ type: "int", name: "order_id" })
    orderId: number;

    @Column("int", { name: "customer_id" })
    customerId: number;

    @Column("varchar", { name: "order_status", length: 50 })
    orderStatus: string;

    @Column("decimal", { name: "total_amount", precision: 10, scale: 2 })
    totalAmount: number;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    @OneToMany(() => OrderItems, orderItems => orderItems.orders)
    orderItems: OrderItems[];
}