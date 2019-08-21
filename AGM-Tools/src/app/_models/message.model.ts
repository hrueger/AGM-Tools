import { Chat } from "./chat.model";
import { Contact } from "./contact.model";

export class Message {
    public id?: number;
    public text: string = "";
    public chat: Chat;
    public fromMe: boolean;
    public readonly created: number = Date.now();
    public sent: string;
    public sendername: string;
    public system?: boolean;

    public toString(): string {
        const { created, text } = this;
        return `Message created at: ${created} - Text: ${text}`;
    }
}
