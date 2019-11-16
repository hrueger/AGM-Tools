import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
  } from "typeorm";
  
  @Entity()
  @Unique(["name"])
  export class Cache {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column()
    value: string;
  }