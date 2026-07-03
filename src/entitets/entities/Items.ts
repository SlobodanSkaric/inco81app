import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItems } from "./OrderItems";

@Entity("items")
export class Items {
    @PrimaryGeneratedColumn({ type: "int", name: "item_id" })
    itemId: number;

    @Column("varchar", { name: "item_name", length: 255 })
    itemName: string;

    @Column("decimal", { name: "price", precision: 10, scale: 2 })
    price: number;

    @Column("int", { name: "stock_quantity" })
    stockQuantity: number;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    @OneToMany(() => OrderItems, orderItems => orderItems.items)
    orderItems: OrderItems[];
}