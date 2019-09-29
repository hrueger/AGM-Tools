import { Location } from "@angular/common";
import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { from } from "rxjs";
import { filter } from "rxjs/operators";
import { Chat } from "../../_models/chat.model";
import { Contact } from "../../_models/contact.model";
import { Message } from "../../_models/message.model";
import { RemoteService } from "../../_services/remote.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "chat-messages",
    styleUrls: ["chat-messages.component.scss"],
    templateUrl: "chat-messages.component.html",
})
export class ChatMessagesComponent
    implements OnInit, OnChanges, AfterViewChecked {
    @Input() public inputReceiverId: number;
    public receiverId: number;
    public chat: Chat = {
        contact: new Contact(),
        muted: null,
        rid: null,
        text: null,
        type: null,
        unread: null,
        when: null,
    };

    public unread: number;
    public messages: Message[];
    // chats: Chat[];

    public messageGotToSend: Event;
    private scrolledToBottom: boolean = false;

    constructor(
        private remoteService: RemoteService,
        private location: Location,
        private cdr: ChangeDetectorRef,
    ) { }

    public messageSentFromChild(event: Event) {
        this.messageGotToSend = event;
    }

    public ngOnInit() {
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
    public scrollToBottom(): void {
        const elementList = document.querySelectorAll(".browser");
        const element = elementList[0] as HTMLElement;
        element.scrollIntoView(false);
    }
    public ngAfterViewChecked() {
        if (this.scrolledToBottom == false) {
            this.scrollToBottom();
        }
    }
    public ngOnChanges(data) {
        if (data.inputReceiverId && data.inputReceiverId.currentValue) {
            this.receiverId = data.inputReceiverId.currentValue;
            this.remoteService.get("chatGetContacts").subscribe((chats) => {
                // this.chats = chats;
                from(chats)
                    .pipe(
                        filter(
                            // @ts-ignore
                            (chat) => chat.rid == this.receiverId,
                        ),
                    )
                    .subscribe((chat) => {
                        // @ts-ignore
                        this.chat = chat;

                        this.getMessages(this.receiverId);
                    });
            });
        } else {
            this.messages = null;
            this.chat = null;
        }
    }
    public getMessages(receiverId) {
        this.remoteService
            .get("chatGetMessages", { rid: receiverId })
            .subscribe((data) => {
                if (data != null) {
                    this.messages = data;
                    // console.warn(data);
                    this.cdr.detectChanges();
                } else {
                    this.messages = [];
                }
            });
        // this.scrollToBottom();
    }

    public goBack() {
        // @ts-ignore
        this.location.back();
    }
}
