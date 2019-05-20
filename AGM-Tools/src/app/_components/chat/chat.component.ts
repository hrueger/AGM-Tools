import { Component, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { ChatsDataService } from "../../_services/chat.data.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.scss"]
})
export class ChatComponent {
    chats = [];
    constructor(private remoteService: RemoteService, private router: Router) {
        this.chats = [];
    }

    ngOnInit() {
        this.remoteService.get("chatGetContacts").subscribe(chats => {
            this.chats = chats;
        });
    }

    goToChat(rid) {
        const extras: NavigationExtras = {
            queryParams: {
                unread: 3
            }
        };
        this.router.navigate(["chat-messages", rid], extras);
    }
}
