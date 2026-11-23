import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderItems } from "./OrderItems";
import { Customers } from "./Customers";

@Entity("orders")
export class Orders {
    @PrimaryGeneratedColumn({ type: "int", name: "order_id" })
    orderId: number;

    @Column("int", { name: "customer_id" })
    customerId: number;

    @Column("enum", { name: "order_status", enum: ["active", "pending","completed", "cancelled"], default: "pending" })
    orderStatus: string;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("enum", { name: "payment_method", enum: ["cards", "delivirs", "paypal"], default: "cards" })
    paymentmethod: "cards" | "delivirs" | "paypal";

    @Column("enum", {
        name: "payment_status",
        enum: ["unpaid", "paid", "failed", "refunded"],
        default: "unpaid",
    })
    paymentStatus: "unpaid" | "paid" | "failed" | "refunded";

    @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    @OneToMany(() => OrderItems, orderItems => orderItems.orders)
    orderItems: OrderItems[];

    @ManyToOne(() => Customers, customers => customers.orders)
    @JoinColumn([{ name: "customer_id", referencedColumnName: "customerId" }])
    customers: Customers;
}