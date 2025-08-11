import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TimeOfWorke } from "./TimeOfWorke";

@Index("email", ["email"], { unique: true })
@Index("phonenumber", ["phonenumber"], { unique: true })
@Entity("administrator", { schema: "inco81app" })
export class Administrator {
  @PrimaryGeneratedColumn({ type: "int", name: "admin_id" })
  adminId: number;

  @Column("varchar", { name: "name", length: 128, default: () => "'0'" })
  name: string;

  @Column("varchar", { name: "lastname", length: 128, default: () => "'0'" })
  lastname: string;

  @Column("varchar", {
    name: "email",
    unique: true,
    length: 128,
    default: () => "'0'",
  })
  email: string;

  @Column("varchar", {
    name: "phonenumber",
    unique: true,
    length: 128,
    default: () => "'0'",
  })
  phonenumber: string;

  @Column("varchar", { name: "role", length: 128, default: () => "'0'" })
  role: string;

  @Column("varchar", { name: "token", length: 256, default: () => "'0'" })
  token: string;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @OneToMany(() => TimeOfWorke, (timeOfWorke) => timeOfWorke.admin)
  timeOfWorkes: TimeOfWorke[];
}
