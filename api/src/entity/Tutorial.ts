import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { Project } from "./Project";
import { TutorialStep } from "./TutorialStep";
import { User } from "./User";

@Entity()
  export class Tutorial {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column({length: 10000})
    public description: string;

    @OneToMany((type) => TutorialStep, (step) => step.tutorial)
    public steps: TutorialStep[];

    @ManyToOne((type) => User, (user) => user.tutorials)
    public creator: User;

    @ManyToMany((type) => Project, (project) => project.tutorials)
    public projects: Project[];

    @Column()
    @CreateDateColumn()
    public createdAt: Date;

    public editable?: boolean;
  }
