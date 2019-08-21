import { User } from "./user.model";

export class Notification {
    public id: number;
    public headline: string;
    public content: string;
    public receivers: User[];
    public seen: User[];
    public notseen: User[];
    public selected: boolean;
}
