import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
    OneToMany,
  } from "typeorm";
import { User } from "./User";
import { TutorialStep } from "./TutorialStep";
  
  @Entity()
  export class Tutorial {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;

    @Column()
    description: string;

    @OneToMany((type) => TutorialStep, (step) => step.tutorial)
    steps: TutorialStep[];

    @ManyToOne((type) => User, (user) => user.tutorials)
    creator: User;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  }