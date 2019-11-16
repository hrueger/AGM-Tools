import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
  } from "typeorm";
import { Folder } from "./Folder";
import { Project } from "./Project";
import { Tag } from "./Tag";
  
  @Entity()
  export class File {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne((type) => Project, (project) => project.files)
    project: Project;

    @ManyToOne((type) => Folder, (folder) => folder.files)
    folder: Folder;

    @ManyToMany((type) => Tag, (tag) => tag.files)
    tags: Tag[];

    @Column()
    name: string;

    @Column()
    shareLink: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  }