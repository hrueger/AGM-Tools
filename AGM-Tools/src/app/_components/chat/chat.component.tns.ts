import { Component } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { NavbarService } from "../../_services/navbar.service";
import { RouterExtensions } from "nativescript-angular/router";

@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.scss"]
})
export class ChatComponent {
    chats = [];
    currentRid: number;

    constructor(
        private remoteService: RemoteService,
        private NavbarService: NavbarService,
        private router: RouterExtensions,
    ) {
        this.chats = [];
    }

    ngOnInit() {
        this.NavbarService.setHeadline("Chat");
        this.remoteService.get("chatGetContacts").subscribe(chats => {
            this.chats = chats;
        });
    }

    goToChat(rid) {
        this.router.navigate(["chat-messages", rid], {
            animated: true,
            transition: {
                name: "slideLeft",
            },
        });

    }
}
