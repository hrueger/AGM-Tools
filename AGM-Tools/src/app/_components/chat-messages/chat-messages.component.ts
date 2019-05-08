import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

import { Chat } from "../../_models/chat.model";
import { ChatsDataService } from "../../_services/chat.data.service";
import { Message } from "../../_models/message.model";
import { from } from "rxjs";

@Component({
    moduleId: module.id,
    selector: "ns-chat",
    templateUrl: "./chat-messages.component.html",
    styleUrls: ["./chat-messages.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessagesComponent implements OnInit {
    receiverId: number;
    //chat: Chat;
    unread: number;
    messages: Message[];
    //chats: Chat[];

    constructor(
        private route: ActivatedRoute,
        private chatsService: ChatsDataService,
        private router: RouterExtensions,
        @Inject("platform") public platform
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.receiverId = +params.index;
            /*this.chatsService.getChats().subscribe(chats => {
                //this.chats = chats;
                this.chat = this.chats[this.receiverId];
            });*/
            this.getMessages(this.receiverId);
        });
        /*this.route.queryParams.subscribe(params => {
            this.unread = +params.unread;
        });*/
    }

    getMessages(receiverId) {
        this.messages = this.chatsService.getMessages(receiverId);
    }

    goBack() {
        this.router.back();
    }
}
