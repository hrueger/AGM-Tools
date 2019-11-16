import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
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

    @Column()
    creator: User;
  }