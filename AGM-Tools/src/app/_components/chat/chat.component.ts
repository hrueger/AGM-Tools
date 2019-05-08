import { Component, OnInit } from "@angular/core";
import { NavigationExtras } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { ChatsDataService } from "~/app/_services/chat.data.service";

@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.scss"]
})
export class ChatComponent {
    chats = [];
    constructor(
        private chatsService: ChatsDataService,
        private routerExtensions: RouterExtensions
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
        this.routerExtensions.navigate(["chat-messages", rid], extras);
    }
}
