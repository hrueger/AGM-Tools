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
import { Message } from "../../_models/message.model";
import { Contact } from "../../_models/contact.model";
import { from } from "rxjs";
import { filter } from "rxjs/operators";
import { RemoteService } from "../../_services/remote.service";
import { ObservableArray, ChangedData } from "tns-core-modules/data/observable-array";


@Component({
    selector: "chat-messages",
    templateUrl: "chat-messages.component.html",
    styleUrls: ["chat-messages.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessagesComponent
    implements OnInit {
    @Input() inputReceiverId: number;
    receiverId: number;
    showEmojiPicker = false;
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
    messages: ObservableArray<Message> = new ObservableArray<Message>(0);
    //chats: Chat[];
    public messageGotToSend: string;
    inputMessage: string;

    @ViewChild("inputMessageField", { static: false }) inputMessageField: ElementRef;
    constructor(
        private remoteService: RemoteService,
        private _location: Location,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute
    ) { }

    sendMessage() {
        this.messageGotToSend = this.inputMessage;
        this.inputMessage = "";
    }

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


    onEmojiClick(emoji: string) {
        //@ts-ignore
        this.inputMessage = (this.inputMessage ? this.inputMessage : "") + String.fromCodePoint("0x" + emoji);
        //console.log(this.inputMessageField.nativeElement.android.setSelection);
        if (this.inputMessageField.nativeElement.android) {
            setTimeout(() => {
                this.inputMessageField.nativeElement.android.setSelection(
                    this.inputMessageField.nativeElement.android.length()
                );
            }, 0);
        }
    }

    getMessages(receiverId) {
        this.remoteService
            .get("chatGetMessages", { rid: receiverId })
            .subscribe(data => {
                if (data != null) {
                    this.messages.length = 0;
                    this.messages.push(...data);
                    this.cdr.detectChanges();
                } else {

                }
            });
    }

    goBack() {
        //@ts-ignore
        this._location.back();
    }



    toggleEmojiPicker() {
        if (this.showEmojiPicker) {
            this.showEmojiPicker = false;
            this.inputMessageField.nativeElement.focus();
        } else {
            this.showEmojiPicker = true;
            this.inputMessageField.nativeElement.dismissSoftInput();
        }
    }
    showKeyboard() {
        this.showEmojiPicker = false;
    }

    onBackspaceClick() {
        this.inputMessage = (this.inputMessage ? this.inputMessage.slice(0, -1) : "");
        //console.log(this.inputMessageField.nativeElement.android.setSelection);
        if (this.inputMessageField.nativeElement.android) {
            setTimeout(() => {
                this.inputMessageField.nativeElement.android.setSelection(
                    this.inputMessageField.nativeElement.android.length()
                );
            }, 0);
        }
    }
}
