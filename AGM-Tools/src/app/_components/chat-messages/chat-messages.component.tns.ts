import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Location, NgSwitchDefault } from "@angular/common";

import { Chat } from "../../_models/chat.model";
import { ChatsDataService } from "../../_services/chat.data.service";
import { Message } from "../../_models/message.model";
import { RemoteService } from "../../_services/remote.service";
import { from } from "rxjs";
import { filter } from "rxjs/operators";
import { Contact } from "../../_models/contact.model";

@Component({
    selector: "ns-chat",
    templateUrl: "chat-messages.component.html",
    styleUrls: ["chat-messages.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessagesComponent implements OnInit {
    receiverId: number;
    chat: Chat = {
        contact: new Contact(),
        type: null,
        when: null,
        unread: null,
        muted: null,
        text: null,
        rid: null
    };
    currentContact = new Contact();
    unread: number;
    messages: Message[] = [];
    //chats: Chat[];

    constructor(
        private route: ActivatedRoute,
        private chatsService: ChatsDataService,
        private remoteService: RemoteService,
        private router: Router,
        private _location: Location,
        @Inject("platform") public platform
    ) { }

    ngOnInit() {

        this.route.params.subscribe(params => {
            this.receiverId = +params.index;
            this.remoteService.get("chatGetChats").subscribe(chats => {
                if (chats) {
                    from(chats)
                        .pipe(
                            //@ts-ignore
                            filter(chat => chat.rid == this.receiverId)
                        )
                        .subscribe(
                            chat =>
                                //@ts-ignore
                                (this.chat = chat)
                        );
                }

            });
            this.getMessages(this.receiverId);
        });
        /*this.route.queryParams.subscribe(params => {
            this.unread = +params.unread;
        });*/
    }

    getMessages(receiverId) {
        this.remoteService
            .get("chatGetMessages", { rid: receiverId })
            .subscribe(data => { this.messages = data });
    }

    goBack() {
        //@ts-ignore
        this._location.back();
    }
}
