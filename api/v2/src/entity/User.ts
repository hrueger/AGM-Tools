import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    OneToMany
  } from "typeorm";
  import { Length, IsNotEmpty } from "class-validator";
  import * as bcrypt from "bcryptjs";
import { Usergroup } from "./Usergroup";
import { Project } from "./Project";
import { Notification } from "./Notification";
import { Template } from "./Template";
import { Tutorial } from "./Tutorial";
  
  @Entity()
  @Unique(["username"])
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    username: string;

    @Column()
    email: string;
  
    @Column()
    password: string;
  
    @ManyToOne((type) => Usergroup, (usergroup) => usergroup.users)
    usergroup: Usergroup;

    @ManyToMany((type) => Project, (project) => project.users)
    projects: Project[];
  
    @Column()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany((type) => Notification, (notification) => notification.receivers)
    receivedNotifications: Notification[];

    @OneToMany((type) => Notification, (notification) => notification.creator)
    sentNotifications: Notification[];

    @OneToMany((type) => Template, (template) => template.creator)
    templates: Template[];

    @OneToMany((type) => Tutorial, (tutorial) => tutorial.creator)
    tutorials: Tutorial[];
  
    hashPassword() {
      this.password = bcrypt.hashSync(this.password, 8);
    }
  
    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        if (unencryptedPassword) {
            return bcrypt.compareSync(unencryptedPassword, this.password)
        } else {
            return false;
        }
    }
  }