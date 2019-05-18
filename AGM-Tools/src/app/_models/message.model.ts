import { Chat } from "./chat.model";
import { Contact } from "./contact.model";
import { SentStatus } from "./sent-status.model";

export class Message {
    id?: number;
    text: string = "";
    chat: Chat;
    fromMe: boolean;
    readonly created: number = Date.now();
    sent: SentStatus;
    sendername: string;

    toString(): string {
        const { created, text } = this;
        return `Message created at: ${created} - Text: ${text}`;
    }
}
