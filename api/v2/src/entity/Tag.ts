import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
  } from "typeorm";
import { Folder } from "./Folder";
import { File } from "./File";
  
  @Entity()
  export class Tag {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column()
    color: string;

    @Column()
    textColor: string;

    @ManyToMany((type) => Folder, (folder) => folder.tags)
    folders: Folder[];

    @ManyToMany((type) => File, (file) => file.tags)
    files: File[];
  }