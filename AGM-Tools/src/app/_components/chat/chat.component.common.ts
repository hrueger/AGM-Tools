import { EnvironmentService } from "../../_services/environment.service";

export class ChatComponentCommon {
    constructor(private eS: EnvironmentService) { }
    public getAvatarSource(chat) {
        if (chat.isUser) {
            return `${this.eS.environment.apiUrl}users/${chat.id}`;
        }
        return `${this.eS.environment.apiUrl}projects/${chat.id}`;
    }
}
