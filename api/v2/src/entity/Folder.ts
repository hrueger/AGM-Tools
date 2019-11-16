import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    TableForeignKey,
  } from "typeorm";
import { File } from "./File";
import { Project } from "./Project";
import { Tag } from "./Tag";
  
  @Entity()
  export class Folder {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne((type) => Project, (project) => project.files)
    project: Project;

    @OneToMany((type) => File, (file) => file.folder)
    files: File[];

    @ManyToMany((type) => Tag, (tag) => tag.folders)
    tags: Tag[];

    @Column()
    name: string;

    @Column()
    shareLink: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;
  }