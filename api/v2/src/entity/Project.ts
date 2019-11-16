import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
  } from "typeorm";
import { File } from "./File";
import { User } from "./User";
import { Folder } from "./Folder";
  
  @Entity()
  export class Project {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToMany((type) => User, (user) => user.projects)
    users: User[];

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany((type) => File, (file) => file.project)
    files: File[];

    @OneToMany((type) => Folder, (folder) => folder.project)
    folders: Folder[];
  }