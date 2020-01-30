import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { File } from "./File";
import { User } from "./User";

@Entity()
  export class Setting {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public value: string;

    @ManyToOne((type) => User, (user) => user.settings)
    public user: User;
  }
