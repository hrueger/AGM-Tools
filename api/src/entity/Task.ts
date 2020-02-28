import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";

@Entity()
  export class Task {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column({length: 10000})
    public description: string;

    @Column()
    public due: Date;

    @ManyToOne((type) => User, (user) => user.createdTasks)
    public creator: User;

    @ManyToOne((type) => Project, (project) => project.tasks)
    public project: Project;

    @ManyToMany((type) => User, (user) => user.tasks)
    @JoinTable()
    public users: User[];

    @Column()
    @CreateDateColumn()
    public createdAt: Date;

  }
