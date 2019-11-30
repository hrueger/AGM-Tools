import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { File } from "./File";
import { User } from "./User";

@Entity()
  export class Project {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToMany(() => User, (user) => user.projects)
    @JoinTable()
    public users: User[];

    @Column()
    public name: string;

    @Column()
    public description: string;

    @OneToMany(() => File, (file) => file.project)
    public files: File[];
  }