import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Orders } from "./Orders";
import { Items } from "./Items";

@Entity("orders_items")
export class OrderItems {
    @PrimaryGeneratedColumn({ type: "int", name: "order_item_id" })
    orderItemId: number;

    @Column("int", { name: "quantity" })
    quantity: number;

    @Column("decimal", { name: "price", precision: 10, scale: 2 })
    price: string;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("datetime", {
        name: "updated_at",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    })
    updatedAt: Date;

    @Column("int", { name: "order_id" })
    orderId: number;

    @Column("int", { name: "item_id" })
    itemId: number;

    @ManyToOne(() => Orders, (orders) => orders.orderItems, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        nullable: false,
    })
    @JoinColumn([{ name: "order_id", referencedColumnName: "orderId" }])
    orders: Orders;

    @ManyToOne(() => Items, (items) => items.orderItems, {
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        nullable: false,
    })
    @JoinColumn([{ name: "item_id", referencedColumnName: "itemId" }])
    items: Items;
}
