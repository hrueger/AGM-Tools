import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import { ChatComponentCommon } from "./chat.component.common";
import { EnvironmentService } from "../../_services/environment.service";

@Component({
    selector: "app-chat",
    styleUrls: ["./chat.component.scss"],
    templateUrl: "./chat.component.html",
})
export class ChatComponent extends ChatComponentCommon {
    public chats = [];
    public currentChat: object;
    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
        private route: ActivatedRoute,
        private router: Router,
        private environmentService: EnvironmentService,
    ) {
        super(environmentService);
        this.chats = [];
    }

    public ngOnInit() {
        this.navbarService.setHeadline("Chat");
        this.remoteService.get("get", "chats").subscribe((chats) => {
            this.chats = chats;
        });
        if (this.route.snapshot.params.type && this.route.snapshot.params.id) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let isUser: boolean;
            if (this.route.snapshot.params.type == "project") {
                isUser = false;
            } else if (this.route.snapshot.params.type == "user") {
                isUser = true;
            }
            const chat = this.chats.filter(
                (c) => (c.isUser == false
                    && c.id == parseInt(this.route.snapshot.params.id, undefined)
                ),
            );
            if (chat && chat[0]) {
                [this.currentChat] = chat;
            }
        }
    }

    public goToChat(chat) {
        this.currentChat = chat;
        this.router.navigate(["chat", chat.isUser ? "user" : "project", chat.id]);
    }
}
