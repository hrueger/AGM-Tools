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
  export class Template {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public description: string;

    @Column()
    public fileName: string;

    @Column()
    public group: string;

    @ManyToOne((type) => User, (user) => user.templates)
    public creator: User;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;
  }
