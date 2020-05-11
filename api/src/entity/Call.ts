import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Project } from "./Project";

@Entity()
export class Call {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public isUser: boolean;

    @ManyToOne(() => User, (user) => user.callsCaller)
    public caller: User;

    @ManyToOne(() => User, (user) => user.callsCallee)
    public callee: User;

    @ManyToOne(() => Project, (project) => project.calls)
    public project: Project;

    @Column()
    public ended: Date;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;
}
