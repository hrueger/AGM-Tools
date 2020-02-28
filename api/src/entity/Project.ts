import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { File } from "./File";
import { Message } from "./Message";
import { Task } from "./Task";
import { Tutorial } from "./Tutorial";
import { User } from "./User";

@Entity()
  export class Project {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToMany(() => User, (user) => user.projects)
    @JoinTable()
    public users: User[];

    @ManyToMany(() => Tutorial, (tutorial) => tutorial.projects)
    @JoinTable()
    public tutorials: Tutorial[];

    @ManyToMany(() => File, (file) => file.linkedProjects)
    @JoinTable()
    public linkedFiles: File[];

    @OneToMany(() => Task, (task) => task.project)
    public tasks: Task[];

    @Column()
    public name: string;

    @Column({length: 10000})
    public description: string;

    @OneToMany(() => File, (file) => file.project)
    public files: File[];

    @OneToMany(() => Message, (message) => message.toProject)
    public messages: Message[];
  }
