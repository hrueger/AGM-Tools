import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Project } from "./Project";

@Entity()
export class ChatStatus {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, (user) => user.chatStatuses)
    public user: User;

    @ManyToOne(() => Project, (project) => project.chatStatuses)
    public project: Project;

    @ManyToOne(() => User, (user) => user.ownChatStatuses)
    public owner: User;

    @Column()
    public received: Date;

    @Column()
    public read: Date;
}
