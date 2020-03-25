import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Tutorial } from "./Tutorial";

@Entity()
export class TutorialStep {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public title: string;

    @Column({ length: 10000 })
    public content: string;

    @Column()
    public image1: string;

    @Column()
    public image2: string;

    @Column()
    public image3: string;

    @ManyToOne(() => Tutorial, (tutorial) => tutorial.steps)
    public tutorial: Tutorial;
}
