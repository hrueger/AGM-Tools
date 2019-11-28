import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { File } from "./File";

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

    @ManyToMany((type) => File, (file) => file.tags)
    public files: File[];
  }
