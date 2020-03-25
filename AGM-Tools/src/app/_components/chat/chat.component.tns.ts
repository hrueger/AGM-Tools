import { Component, ElementRef, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { NavbarService } from "../../_services/navbar.service";
import { PushService } from "../../_services/push.service.tns";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-chat",
    styleUrls: ["./chat.component.scss"],
    templateUrl: "./chat.component.html",
})
export class ChatComponent {
    public chats = [];
    public currentRid: number;
    @ViewChild("chatsListView", { static: false }) public chatsListView: ElementRef;

    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
        private router: RouterExtensions,
        private pushService: PushService,
    ) {
        this.chats = [];
    }

    public getInitials(name: string) {
        const initials = name.match(/\b\w/g) || [];
        return ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();
    }

    public newMessageFromPushService(data: any) {
        if (data.action == "newMessage") {
            let index = null;
            this.chats.some((cht, i) => {
                if (parseInt(cht.rid) == parseInt(data.data.data.chatID)) {
                    index = i;
                    return true;
                }
                return false;
            });
            if (this.chats[index]) {
                this.chats[index].unread = (this.chats[index].unread > 0
                    ? this.chats[index].unread++ : 1);
                this.chats[index].text = data.data.body;
                this.chats[index].when = new Date();
                this.chatsListView.nativeElement.refresh();
            }
        } else {
            // eslint-disable-next-line no-console
            console.log(data);
        }
    }

    public ngOnInit() {
        this.navbarService.setHeadline("Chat");
        this.remoteService.get("get", "chats").subscribe((chats) => {
            this.chats = chats;
        });
        this.pushService.reregisterCallbacks();
        this.pushService.getChatActions().subscribe((data) => {
            this.newMessageFromPushService(data);
        });
    }

    public goToChat(chat) {
        this.router.navigate(["chat-messages", chat.isUser ? "user" : "project", chat.id], {
            animated: true,
            transition: {
                name: "slideLeft",
            },
        });
    }
}
