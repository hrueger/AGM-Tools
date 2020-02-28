import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { User } from "./User";

@Entity()
  export class Event {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public headline: string;

    @Column({length: 10000})
    public description: string;

    @Column()
    public location: string;

    @Column()
    public start: Date;

    @Column()
    public end: Date;

    @ManyToOne((type) => User, (user) => user.events)
    public creator: User;
  }
