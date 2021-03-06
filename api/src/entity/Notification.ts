import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public headline: string;

    @Column({ length: 10000 })
    public content: string;

    @Column()
    public theme: string;

    @ManyToMany(() => User, (user) => user.receivedNotifications)
    @JoinTable()
    public receivers: User[];

    @ManyToMany(() => User, (user) => user.seenNotifications)
    @JoinTable()
    public seenBy: User[];

    @ManyToOne(() => User, (user) => user.sentNotifications)
    public creator: User;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;

    public howLongAgo?: string;
}
