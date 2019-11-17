import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { File } from "./File";
import { Folder } from "./Folder";

@Entity()
  export class Tag {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public color: string;

    @Column()
    public textColor: string;

    @ManyToMany((type) => Folder, (folder) => folder.tags)
    public folders: Folder[];

    @ManyToMany((type) => File, (file) => file.tags)
    public files: File[];
  }
