import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
  } from "typeorm";
import { User } from "./User";
  
  @Entity()
  export class Usergroup {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @OneToMany((type) => User, (user) => user.usergroup)
    users: User[];

    /* Permissions */
    @Column()
    REMOVE_FILE: boolean;
    
    @Column()
    CREATE_USER: boolean;
    
    @Column()
    EDIT_USER: boolean;
    
    @Column()
    DELETE_USER: boolean;

    @Column()
    EDIT_GLOBAL_SETTINGS: boolean;
    
    @Column()
    REMOVE_DATE: boolean;
    
    @Column()
    CREATE_PROJECT: boolean;
    
    @Column()
    ADD_USER_TO_PROJECT: boolean;
    
    @Column()
    REMOVE_PROJECT: boolean;
  }