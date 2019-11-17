import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { User } from "./User";

@Entity()
  export class Notification {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public headline: string;

    @Column()
    public content: string;

    @ManyToMany((type) => User, (user) => user.receivedNotifications)
    public receivers: User[];

    @ManyToOne((type) => User, (user) => user.sentNotifications)
    public creator: User;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;
  }
