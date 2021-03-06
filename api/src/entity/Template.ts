import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Template {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column({ length: 10000 })
    public description: string;

    @Column()
    public filename: string;

    @Column()
    public group: string;

    @ManyToOne(() => User, (user) => user.templates)
    public creator: User;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;
}
