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
import { Tutorial } from "./Tutorial";
  
  @Entity()
  export class TutorialStep {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    image1: string;

    @Column()
    image2: string;

    @Column()
    image3: string;

    @ManyToOne((type) => Tutorial, (tutorial) => tutorial.steps)
    tutorial: Tutorial;
  }