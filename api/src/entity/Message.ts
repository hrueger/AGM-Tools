import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";

@Entity()
  export class Message {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({length: 10000})
    public content: string;

    @Column()
    public imgSrc: string;

    @Column()
    public contactName: string;

    @Column()
    public contactNumber: string;

    @Column()
    public fileSrc: string;

    @Column()
    public locationLat: string;

    @Column()
    public locationLong: string;

    @Column()
    @CreateDateColumn()
    public date: Date;

    @ManyToOne((type) => User, (user) => user.receivedMessages)
    public toUser: User;

    @ManyToOne((type) => Project, (project) => project.messages)
    public toProject: Project;

    @ManyToOne((type) => User, (user) => user.sentMessages)
    public sender: User;

    public fromMe?: boolean;
    public sent?: string;
  }
