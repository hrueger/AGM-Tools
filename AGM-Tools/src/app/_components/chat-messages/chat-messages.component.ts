import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    Input,
    OnChanges,
    ViewChild,
    ElementRef,
    AfterViewChecked
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";

import { Chat } from "../../_models/chat.model";
import { ChatsDataService } from "../../_services/chat.data.service";
import { Message } from "../../_models/message.model";
import { Contact } from "../../_models/contact.model";
import { from } from "rxjs";
import { filter } from "rxjs/operators";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "chat-messages",
    templateUrl: "chat-messages.component.html",
    styleUrls: ["chat-messages.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessagesComponent
    implements OnInit, OnChanges, AfterViewChecked {
    @Input() inputReceiverId: number;
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

    unread: number;
    messages: Message[];
    //chats: Chat[];

    constructor(
        private remoteService: RemoteService,
        private _location: Location
    ) {}

    ngOnInit() {
        /*this.route.params.subscribe(params => {
            this.receiverId = +params.index;
            this.chatsService.getChats().subscribe(chats => {
                //this.chats = chats;
                from(chats)
                    .pipe(filter(chat => chat.rid == this.receiverId))
                    .subscribe(chat => (this.chat = chat));
            });
            this.getMessages(this.receiverId);
        });*/
        /*this.route.queryParams.subscribe(params => {
            this.unread = +params.unread;
        });*/
    }
    scrollToBottom(): void {
        const elementList = document.querySelectorAll(".browser");
        const element = elementList[0] as HTMLElement;
        element.scrollIntoView(false);
    }
    ngAfterViewChecked() {
        this.scrollToBottom();
    }
    ngOnChanges(data) {
        if (data.inputReceiverId && data.inputReceiverId.currentValue) {
            this.receiverId = data.inputReceiverId.currentValue;
            console.log("received change: loading for chat ");
            this.remoteService.get("chatGetContacts").subscribe(chats => {
                //this.chats = chats;
                from(chats)
                    .pipe(
                        filter(
                            //@ts-ignore
                            chat => chat.rid == this.receiverId
                        )
                    )
                    .subscribe(chat => {
                        //@ts-ignore
                        this.chat = chat;

                        this.getMessages(this.receiverId);
                    });
            });
        } else {
            this.messages = null;
            this.chat = null;
        }
    }
    getMessages(receiverId) {
        this.remoteService
            .get("chatGetMessages", { rid: receiverId })
            .subscribe(data => {
                if (data != null) {
                    this.messages = data;
                    console.warn(data);
                } else {
                    this.messages = [];
                }
            });
        //this.scrollToBottom();
    }

    goBack() {
        //@ts-ignore
        this._location.back();
    }
}
