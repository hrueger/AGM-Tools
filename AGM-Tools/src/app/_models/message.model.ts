import { Chat } from "./chat.model";

export class Message {
    public id?: number;
    public text: string = "";
    public chat: Chat;
    public fromMe: boolean;
    public readonly created: number = Date.now();
    public sent: string;
    public sendername: string;
    public system?: boolean;
    public imageSrc?: string;
    public attachmentSrc?: string;
    public contactSrc?: any;
}
