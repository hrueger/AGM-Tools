import { Contact } from "./contact.model";

export class Chat {
    public id?: number;
    public contact: Contact;
    public type: string;
    public when: number;
    public muted: boolean;
    public unread: number;
    public text: string;
    public rid: any;
}
