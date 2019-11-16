import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
  } from "typeorm";
import { User } from "./User";
  
  @Entity()
  export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    headline: string;

    @Column()
    content: string;

    @ManyToMany((type) => User, (user) => user.receivedNotifications)
    receivers: User[];

    @ManyToOne((type) => User, (user) => user.sentNotifications)
    creator: User;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  }