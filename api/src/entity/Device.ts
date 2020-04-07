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

    @ManyToOne(() => User, (user) => user.devices)
    public user: User;
}
