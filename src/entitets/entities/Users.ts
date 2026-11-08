import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TimeOfWorke } from "./TimeOfWorke";
import { RequestLogs } from "./RequestLogs";
import { JobInformations } from "./JobInformations";
import { Vacations } from "./Vacations";
import { Payments } from "./Payments";
import { Role } from "../../common/enums/role.enum";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id" })
  userId: number;

  @Column("varchar", { name: "name", length: 128 })
  name: string;

  @Column("varchar", { name: "lastname", length: 128})
  lastname: string;

  @Column("varchar", {name: "email",unique: true,length: 128})
  email: string;

   @Column("varchar", {name: "password",unique: false,length: 256})
  password: string;

  @Column("varchar", {name: "phonenumber",unique: true,length: 128, nullable: true})
  phonenumber?: string;

  @Column("enum", {name: "role", enum: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN], default: Role.USER})
  role: Role | null;

  @Column("int", {name: "manager_id", nullable: true})
  managerId: number | null;

  @Column("varchar", {name: "token",nullable: true,length: 256})
  token: string | null;

  @Column("int", {name: "visibility", default: 0})
  visibility: number;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => Users, (users) => users.employees, {nullable: true, onDelete: "SET NULL"})
  @JoinColumn({name: "manager_id", referencedColumnName: "userId"})
  manager: Users | null

  @OneToMany(() => Users, (users) => users.manager)
  employees: Users[];

  @OneToMany(() => TimeOfWorke, (timeOfWorke) => timeOfWorke.user)
  timeOfWorkes: TimeOfWorke[];

  @OneToMany(() => RequestLogs, (requestLogs: RequestLogs) => requestLogs.userId)
  @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
  requestLogs: RequestLogs[];

  @OneToMany(() => Vacations, (vacations) => vacations.user)
  vacations: Vacations[];

  @OneToMany(() => Payments, (payments) => payments.user)
  payments: Payments[];

  @OneToMany(() => JobInformations, (jobInformations) => jobInformations.userId)
  jobInformations: JobInformations[];

}
