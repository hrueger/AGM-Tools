import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
} from "typeorm";
import { Project } from "./Project";
import { Tag } from "./Tag";
import { User } from "./User";

@Entity()
@Tree("materialized-path")
export class File {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Project, (project) => project.files)
    public project: Project;

    @Column()
    public isFolder: boolean;

    @Column({type: "simple-json", default: undefined})
    public dropFolder: {
        title: string,
        description: string,
    };

    @TreeParent()
    public parent: File;

    @TreeChildren()
    public files: File[];

    @ManyToMany(() => Tag, (tag) => tag.files)
    @JoinTable()
    public tags: Tag[];

    @ManyToMany(() => Project, (project) => project.linkedFiles)
    public linkedProjects: Project[];

    @Column()
    public name: string;

    @Column({ nullable: true })
    public shareLink: string;

    @Column({ nullable: true })
    public editKey: string;

    @Column()
    @CreateDateColumn()
    public createdAt: Date;

    @ManyToOne(() => User, (user) => user.files)
    public creator: User;
}
