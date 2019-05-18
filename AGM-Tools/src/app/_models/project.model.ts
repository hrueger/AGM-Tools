import { User } from "./user.model";

export class Project {
    id: number;
    name: string;
    members: User[];
}
