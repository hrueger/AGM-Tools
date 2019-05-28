import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.scss"]
})
export class ChatComponent {
    chats = [];
    currentRid: number;
    constructor(private remoteService: RemoteService) {
        this.chats = [];
    }

    ngOnInit() {
        this.remoteService.get("chatGetContacts").subscribe(chats => {
            this.chats = chats;
        });
    }

    goToChat(rid) {
        /*const extras: NavigationExtras = {
            queryParams: {
                unread: 3
            }
        };*/
        //this.router.navigate(["chat-messages", rid], extras);

        this.currentRid = rid;
    }
}
