import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { File } from "./File";
import { Folder } from "./Folder";
import { User } from "./User";

@Entity()
  export class Project {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToMany((type) => User, (user) => user.projects)
    public users: User[];

    @Column()
    public name: string;

    @Column()
    public description: string;

    @OneToMany((type) => File, (file) => file.project)
    public files: File[];

    @OneToMany((type) => Folder, (folder) => folder.project)
    public folders: Folder[];
  }
