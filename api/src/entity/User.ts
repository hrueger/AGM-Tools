import * as bcrypt from "bcryptjs";
import {
Column,
CreateDateColumn,
Entity,
JoinTable,
ManyToMany,
ManyToOne,
OneToMany,
PrimaryGeneratedColumn,
Unique,
UpdateDateColumn,
} from "typeorm";
import { Event } from "./Event";
import { File } from "./File";
import { Message } from "./Message";
import { Notification } from "./Notification";
import { Project } from "./Project";
import { Setting } from "./Setting";
import { Task } from "./Task";
import { Template } from "./Template";
import { Tutorial } from "./Tutorial";
import { Usergroup } from "./Usergroup";

@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public username: string;

  @Column()
  public email: string;

  @Column({select: false})
  public password: string;

  @Column({select: false, nullable: true})
  public passwordResetToken: string;

  @ManyToOne((type) => Usergroup, (usergroup) => usergroup.users)
  public usergroup: Usergroup;

  @ManyToMany((type) => Project, (project) => project.users)
  public projects: Project[];

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToMany((type) => Notification, (notification) => notification.receivers)
  public receivedNotifications: Notification[];

  @ManyToMany((type) => Notification, (notification) => notification.seenBy)
  public seenNotifications: Notification[];

  @OneToMany((type) => Notification, (notification) => notification.creator)
  public sentNotifications: Notification[];

  @OneToMany((type) => Message, (message) => message.sender)
  public sentMessages: Message[];

  @OneToMany((type) => Message, (message) => message.toUser)
  public receivedMessages: Message[];

  @OneToMany((type) => Template, (template) => template.creator)
  public templates: Template[];

  @OneToMany((type) => Tutorial, (tutorial) => tutorial.creator)
  public tutorials: Tutorial[];

  @OneToMany((type) => Task, (task) => task.creator)
  public createdTasks: Task[];

  @ManyToMany((type) => Task, (task) => task.users)
  public tasks: Task[];

  @OneToMany((type) => Event, (event) => event.creator)
  public events: Event[];

  @OneToMany((type) => File, (file) => file.creator)
  public files: File[];

  @OneToMany((type) => Setting, (setting) => setting.user)
  public settings: Setting[];

  public hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  public checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
      if (unencryptedPassword) {
          return bcrypt.compareSync(unencryptedPassword, this.password);
      } else {
          return false;
      }
  }
}
