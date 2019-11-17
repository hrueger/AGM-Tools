import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    UpdateDateColumn,
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

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
  }