import * as bcrypt from "bcryptjs";
import {
    Column,
    CreateDateColumn,
    Entity,
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
import { ChatStatus } from "./ChatStatus";

@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public username: string;

  @Column()
  public email: string;

  @Column({ select: false })
  public password: string;

  @Column({ nullable: true })
  public lastOnline: Date;

  @Column({ select: false, nullable: true })
  public passwordResetToken: string;

  @ManyToOne(() => Usergroup, (usergroup) => usergroup.users)
  public usergroup: Usergroup;

  @ManyToMany(() => Project, (project) => project.users)
  public projects: Project[];

  @Column()
  @CreateDateColumn()
  public createdAt: Date;

  @Column()
  @UpdateDateColumn()
  public updatedAt: Date;

  @ManyToMany(() => Notification, (notification) => notification.receivers)
  public receivedNotifications: Notification[];

  @ManyToMany(() => Notification, (notification) => notification.seenBy)
  public seenNotifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.creator)
  public sentNotifications: Notification[];

  @OneToMany(() => Message, (message) => message.sender)
  public sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.toUser)
  public receivedMessages: Message[];

  @OneToMany(() => Template, (template) => template.creator)
  public templates: Template[];

  @OneToMany(() => Tutorial, (tutorial) => tutorial.creator)
  public tutorials: Tutorial[];

  @OneToMany(() => Task, (task) => task.creator)
  public createdTasks: Task[];

  @ManyToMany(() => Task, (task) => task.users)
  public tasks: Task[];

  @OneToMany(() => Event, (event) => event.creator)
  public events: Event[];

  @OneToMany(() => File, (file) => file.creator)
  public files: File[];

  @OneToMany(() => Setting, (setting) => setting.user)
  public settings: Setting[];

  @OneToMany(() => ChatStatus, (chatStatus) => chatStatus.owner)
  public ownChatStatuses: ChatStatus[];

  @OneToMany(() => ChatStatus, (chatStatus) => chatStatus.owner)
  public chatStatuses: ChatStatus[];

  public hashPassword() {
      this.password = bcrypt.hashSync(this.password, 8);
  }

  public checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
      if (unencryptedPassword) {
          return bcrypt.compareSync(unencryptedPassword, this.password);
      }
      return false;
  }
}
