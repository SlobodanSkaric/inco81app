import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TimeOfWorke } from "./TimeOfWorke";
import { RequestLogs } from "./RequestLogs";
import { JobInformations } from "./JobInformations";
import { Vacations } from "./Vacations";

@Index("email", ["email"], { unique: true })
@Index("phonenumber", ["phonenumber"], { unique: true })
@Entity("users", { schema: "inco81app" })
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id" })
  userId: number;

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
    name: "password",
    unique: false,
    length: 256,
    default: () => "'0'",
  })
  password: string;

  @Column("varchar", {
    name: "phonenumber",
    unique: true,
    length: 128,
    default: () => "'0'",
  })
  phonenumber: string;

  @Column("varchar", {
    name: "role",
    nullable: true,
    length: 128,
    default: () => "'0'",
  })
  role: string | null;

  @Column("varchar", {
    name: "token",
    nullable: true,
    length: 256,
    default: () => "'0'",
  })
  token: string | null;

  @Column("int", {name: "visibility", default: () => "'0'"})
  visibility: number;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @OneToMany(() => TimeOfWorke, (timeOfWorke) => timeOfWorke.user)
  timeOfWorkes: TimeOfWorke[];

  @OneToMany(() => RequestLogs, (requestLogs: RequestLogs) => requestLogs.userId)
  requestLogs: RequestLogs[];

  @OneToOne(() => Vacations, (vacations) => vacations.users)
  vacations: Vacations[];

}
