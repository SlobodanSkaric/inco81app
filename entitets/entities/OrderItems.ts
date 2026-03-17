import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Orders } from "./Orders";
import { Items } from "./Items";

@Entity("orders_items")
export class OrderItems {
    @PrimaryGeneratedColumn({ type: "int", name: "order_item_id" })
    orderItemId: number;

   /*  @Column("int", { name: "order_id" })
    orderId: number;

    @Column("int", { name: "item_id" })
    itemId: number; */

    @Column("int", { name: "quantity" })
    quantity: number;

    @Column("decimal", { name: "price", precision: 10, scale: 2 })
    price: number;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    @ManyToOne(() => Orders, orders => orders.orderItems, { cascade: true, onDelete: "RESTRICT", onUpdate: "CASCADE", nullable: false })
    @JoinColumn([{ name: "order_id", referencedColumnName: "orderId" }])
    orders: Orders[];

    @ManyToOne(() => Items, items => items.orderItems, { cascade: true, onDelete: "RESTRICT", onUpdate: "CASCADE", nullable: false })
    @JoinColumn([{ name: "item_id", referencedColumnName:"itemId" }])
    items: Items[];
}