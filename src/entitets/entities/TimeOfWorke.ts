import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";

@Entity("time_of_worke")
export class TimeOfWorke {
  @PrimaryGeneratedColumn({ type: "int", name: "time_of_worke_id" })
  timeOfWorkeId: number;

  @Column("timestamp", { name: "date_and_time",default: () => "CURRENT_TIMESTAMP",})
  dateAndTime: Date;

  @Column({ type: "datetime", nullable:true })
  checked_in: Date;

  @Column({ type: "datetime", nullable:true })
  checked_out: Date;

   @Column("int", { name: "status", default: 0})
  status: number;

  /** Generated: user_id while shift is open; NULL when closed. Enforces one open shift per user. */
  @Column({
    type: "int",
    name: "open_user_id",
    generatedType: "STORED",
    asExpression: `CASE WHEN \`checked_out\` IS NULL AND \`status\` = 0 AND \`checked_in\` IS NOT NULL THEN \`user_id\` ELSE NULL END`,
    insert: false,
    update: false,
    nullable: true,
    select: false,
  })
  openUserId?: number | null;

  @ManyToOne(() => Users, (users) => users.timeOfWorkes)
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: Users;
}
