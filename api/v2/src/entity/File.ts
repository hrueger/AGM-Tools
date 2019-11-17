import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { Folder } from "./Folder";
import { Project } from "./Project";
import { Tag } from "./Tag";

@Entity()
  export class File {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type) => Project, (project) => project.files)
    public project: Project;

    @ManyToOne((type) => Folder, (folder) => folder.files)
    public folder: Folder;

    @ManyToMany((type) => Tag, (tag) => tag.files)
    public tags: Tag[];

    @Column()
    public name: string;

    @Column()
    public shareLink: string;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;
  }
