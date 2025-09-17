import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";

@Entity()
export class RequestLogs {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Users, (user) => user.requestLogs, {onDelete: 'CASCADE'})
    user: Users;

    @Column({type: 'varchar', length: 45, nullable: false})
    ip: string;

    @Column({type: 'varchar', length: 255, nullable: false})
    ua: string;

    @Column({type: 'int', default: 0})
    riskscore: number;
    
    @Column({type: 'varchar', length: 255, nullable: true})
    description: string;


    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;
}