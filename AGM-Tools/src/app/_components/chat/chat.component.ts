import { Component, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { ChatsDataService } from "../../_services/chat.data.service";

@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.scss"]
})
export class ChatComponent {
    chats = [];
    constructor(
        private chatsService: ChatsDataService,
        private router: Router
    ) {
        this.chats = [];
    }

    ngOnInit() {
        this.chatsService.getChats().subscribe(chats => {
            this.chats = chats;
        });
    }

    goToChat(rid) {
        const extras: NavigationExtras = {
            queryParams: {
                unread: 2
            }
        };
        this.router.navigate(["chat-messages", rid], extras);
    }
}
