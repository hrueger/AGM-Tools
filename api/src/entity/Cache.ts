import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
  } from "typeorm";

@Entity()
  @Unique(["name"])
  export class Cache {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public value: string;

    @Column()
    public random: number;

    @Column()
    @UpdateDateColumn({update: true})
    public updatedAt: Date;
  }
