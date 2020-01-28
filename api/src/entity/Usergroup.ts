import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { User } from "./User";

@Entity()
  export class Usergroup {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @OneToMany((type) => User, (user) => user.usergroup)
    public users: User[];

    /* Permissions */
    @Column()
    public REMOVE_FILE: boolean;

    @Column()
    public CREATE_USER: boolean;

    @Column()
    public EDIT_USER: boolean;

    @Column()
    public DELETE_USER: boolean;

    @Column()
    public EDIT_GLOBAL_SETTINGS: boolean;

    @Column()
    public REMOVE_EVENT: boolean;

    @Column()
    public CREATE_PROJECT: boolean;

    @Column()
    public ADD_USER_TO_PROJECT: boolean;

    @Column()
    public REMOVE_PROJECT: boolean;
  }
