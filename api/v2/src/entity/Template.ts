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
  export class Template {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    fileName: string;

    @Column()
    group: string;

    @ManyToOne((type) => User, (user) => user.templates)
    creator: User;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  }