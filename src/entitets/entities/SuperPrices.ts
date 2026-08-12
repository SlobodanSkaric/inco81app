import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("superprices")
export class SuperPrices {
    @PrimaryGeneratedColumn({ type: "int", name: "superprices_id" })
    superPricesId: number;

    @Column("varchar", { name: "price_name", length: 255 })
    priceName: string;

    @Column("decimal", { name: "price_value", precision: 10, scale: 2 })
    priceValue: number;

    @Column("datetime", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column("datetime", { name: "updated_at", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;
}