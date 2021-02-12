import { getApiUrl } from "../../_helpers/getApiUrl";

export class ChatComponentCommon {
    public getAvatarSource(chat) {
        if (chat.isUser) {
            return `${getApiUrl()}users/${chat.id}`;
        }
        return `${getApiUrl()}projects/${chat.id}`;
    }
}
