import { User } from "./user.model";

export class Project {
    public id: number;
    public name: string;
    public members: User[];
}
