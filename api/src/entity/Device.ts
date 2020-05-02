import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Device {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ length: 250 })
    public token: string;

    @Column()
    public os: string;

    @Column()
    public software: string;

    @Column()
    public device: string;

    @Column({ default: false })
    public isMail: boolean;

    @Column({ default: 90 })
    public mailDelayMinutes: number;

    @ManyToOne(() => User, (user) => user.devices, {onDelete: "CASCADE"})
    public user: User;

    /* Settings */

    @Column()
    public chatMessages: boolean;

    @Column()
    public notifications: boolean;

    @Column()
    public newEvents: boolean;

    @Column()
    public upcomingEvents: boolean;

    @Column()
    public fileComments: boolean;

    @Column()
    public fileCommentReplys: boolean;

    @Column()
    public newTutorials: boolean;

    @Column()
    public newProjects: boolean;

    @Column()
    public newTemplates: boolean;
}
