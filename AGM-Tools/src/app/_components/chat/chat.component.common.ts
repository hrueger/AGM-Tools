import { environment } from "../../../environments/environment";

export class ChatComponentCommon {
    public getAvatarSource(chat) {
        if (chat.isUser) {
            return `${environment.apiUrl}users/${chat.id}`;
        }
        return `${environment.apiUrl}projects/${chat.id}`;
    }
}
