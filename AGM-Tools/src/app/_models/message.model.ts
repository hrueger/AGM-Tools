import { Chat } from "./chat.model";
import { Contact } from "./contact.model";

export class Message {
    id?: number;
    text: string = "";
    chat: Chat;
    fromMe: boolean;
    readonly created: number = Date.now();
    sent: string;
    sendername: string;
    system?: boolean;

    toString(): string {
        const { created, text } = this;
        return `Message created at: ${created} - Text: ${text}`;
    }
}
