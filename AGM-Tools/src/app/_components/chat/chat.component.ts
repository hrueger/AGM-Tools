import { Component, OnInit } from "@angular/core";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-chat",
    styleUrls: ["./chat.component.scss"],
    templateUrl: "./chat.component.html",
})
export class ChatComponent {
    public chats = [];
    public currentRid: number;
    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
    ) {
        this.chats = [];
    }

    public ngOnInit() {
        this.navbarService.setHeadline("Chat");
        this.remoteService.get("post", "chatGetContacts").subscribe((chats) => {
            this.chats = chats;
        });
    }

    public goToChat(rid) {
        /*const extras: NavigationExtras = {
            queryParams: {
                unread: 3
            }
        };*/
        // this.router.navigate(["chat-messages", rid], extras);

        this.currentRid = rid;
    }
}
