import { Component } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
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
        private router: RouterExtensions,
    ) {
        this.chats = [];
    }

    public ngOnInit() {
        this.navbarService.setHeadline("Chat");
        this.remoteService.get("chatGetContacts").subscribe((chats) => {
            this.chats = chats;
        });
    }

    public goToChat(rid) {
        this.router.navigate(["chat-messages", rid], {
            animated: true,
            transition: {
                name: "slideLeft",
            },
        });

    }
}
