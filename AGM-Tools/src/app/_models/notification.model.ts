import { User } from "./user.model";

export class Notification {
    id: number;
    headline: string;
    content: string;
    receivers: User[];
    seen: User[];
    notseen: User[];
    selected: boolean;
}
