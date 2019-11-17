import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { TutorialStep } from "./TutorialStep";
import { User } from "./User";

@Entity()
  export class Tutorial {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column()
    public description: string;

    @OneToMany((type) => TutorialStep, (step) => step.tutorial)
    public steps: TutorialStep[];

    @ManyToOne((type) => User, (user) => user.tutorials)
    public creator: User;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;
  }
