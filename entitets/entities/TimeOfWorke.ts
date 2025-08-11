import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Administrator } from "./Administrator";
import { Users } from "./Users";

@Index("fk_users_time_of_work", ["userId"], {})
@Index("fk_administrators_time_of_work", ["adminId"], {})
@Entity("time_of_worke", { schema: "inco81app" })
export class TimeOfWorke {
  @PrimaryGeneratedColumn({ type: "int", name: "time_of_worke_id" })
  timeOfWorkeId: number;

  @Column("timestamp", {
    name: "date_and_time",
    default: () => "CURRENT_TIMESTAMP",
  })
  dateAndTime: Date;

  @Column("int", { name: "user_id", nullable: true, default: () => "'0'" })
  userId: number | null;

  @Column("int", { name: "admin_id", nullable: true, default: () => "'0'" })
  adminId: number | null;

  @ManyToOne(
    () => Administrator,
    (administrator) => administrator.timeOfWorkes,
    { onDelete: "RESTRICT", onUpdate: "CASCADE" }
  )
  @JoinColumn([{ name: "admin_id", referencedColumnName: "adminId" }])
  admin: Administrator;

  @ManyToOne(() => Users, (users) => users.timeOfWorkes, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: Users;
}
