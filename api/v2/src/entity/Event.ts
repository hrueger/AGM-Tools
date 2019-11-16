import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from "typeorm";
import { User } from "./User";
  
  @Entity()
  export class Event {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    headline: string;

    @Column()
    description: string;

    @Column()
    location: string;

    @Column()
    start: Date;

    @Column()
    end: Date;

    @ManyToOne((type) => User, (user) => user.events)
    creator: User;
  }