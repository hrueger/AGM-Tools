import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    Input,
    OnChanges,
    ViewChild,
    ElementRef,
    AfterViewChecked,
    ChangeDetectorRef
} from "@angular/core";
import { ActivatedRoute, Router, Route } from "@angular/router";
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
    implements OnInit, AfterViewChecked {
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

    public messageGotToSend: Event;
    @ViewChild("messagesListView", { static: false }) messagesListView: ElementRef;
    messageSentFromChild(event: Event) {
        this.messageGotToSend = event;
    }

    constructor(
        private remoteService: RemoteService,
        private _location: Location,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.receiverId = +params.index;
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
        });




    }
    scrollToBottom(): void {
        if (this.messagesListView && this.messagesListView.nativeElement && this.messagesListView.nativeElement.items.length > 0) {
            this.messagesListView.nativeElement.scrollToIndex(this.messagesListView.nativeElement.items.length - 1);

        }
    }
    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    getMessages(receiverId) {
        this.remoteService
            .get("chatGetMessages", { rid: receiverId })
            .subscribe(data => {
                if (data != null) {
                    this.messages = data;
                    this.cdr.detectChanges();
                } else {
                    this.messages = [];
                }
            });
    }

    goBack() {
        //@ts-ignore
        this._location.back();
    }
}
