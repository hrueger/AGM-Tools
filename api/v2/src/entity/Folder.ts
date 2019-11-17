import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    TableForeignKey,
  } from "typeorm";
import { File } from "./File";
import { Project } from "./Project";
import { Tag } from "./Tag";

@Entity()
  export class Folder {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type) => Project, (project) => project.files)
    public project: Project;

    @OneToMany((type) => File, (file) => file.folder)
    public files: File[];

    @ManyToMany((type) => Tag, (tag) => tag.folders)
    public tags: Tag[];

    @Column()
    public name: string;

    @Column()
    public shareLink: string;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;
  }
