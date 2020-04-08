import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../../_services/authentication.service";

export class ChatComponentCommon {
    constructor(private authenticationService: AuthenticationService) {}
    public getAvatarSource(chat) {
        if (chat.isUser) {
            return `${environment.apiUrl}users/${chat.id}?authorization=${this.authenticationService.currentUserValue.token}`;
        }
        return `${environment.apiUrl}projects/${chat.id}?authorization=${this.authenticationService.currentUserValue.token}`;
    }
}
