import {
  Column,
  Entity,
  Index,
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

  @ManyToOne(() => Users, (users) => users.timeOfWorkes)
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: Users;
}
