import { Location } from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

import { from } from "rxjs";
import { filter } from "rxjs/operators";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Chat } from "../../_models/chat.model";
import { Contact } from "../../_models/contact.model";
import { Message } from "../../_models/message.model";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "chat-messages",
    templateUrl: "chat-messages.component.html",
    styleUrls: ["chat-messages.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessagesComponent
    implements OnInit {
    @Input() public inputReceiverId: number;
    public receiverId: number;
    public showEmojiPicker = false;
    public chat: Chat = {
        contact: new Contact(),
        type: null,
        when: null,
        unread: null,
        muted: null,
        text: null,
        rid: null,
    };

    public unread: number;
    public messages: ObservableArray<Message> = new ObservableArray<Message>(0);
    // chats: Chat[];
    public messageGotToSend: string;
    public inputMessage: string;

    @ViewChild("inputMessageField", { static: false }) public inputMessageField: ElementRef;
    constructor(
        private remoteService: RemoteService,
        private router: RouterExtensions,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
    ) { }

    public sendMessage() {
        this.messageGotToSend = this.inputMessage;
        this.inputMessage = "";
    }

    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.receiverId = +params.index;
            console.log("received change: loading for chat ");
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
        });
    }

    public onEmojiClick(emoji: string) {
        // @ts-ignore
        this.inputMessage = (this.inputMessage ? this.inputMessage : "") + String.fromCodePoint("0x" + emoji);
        // console.log(this.inputMessageField.nativeElement.android.setSelection);
        if (this.inputMessageField.nativeElement.android) {
            setTimeout(() => {
                this.inputMessageField.nativeElement.android.setSelection(
                    this.inputMessageField.nativeElement.android.length(),
                );
            }, 0);
        }
    }

    public getMessages(receiverId) {
        this.remoteService
            .get("chatGetMessages", { rid: receiverId })
            .subscribe((data) => {
                if (data != null) {
                    this.messages.length = 0;
                    this.messages.push(...data);
                    this.cdr.detectChanges();
                }
            });
    }

    public goBack() {
        // @ts-ignore
        this.router.navigate(["chat"], {
            animated: true,
            transition: {
                name: "slideRight",
            },
        });
    }

    public toggleEmojiPicker() {
        if (this.showEmojiPicker) {
            this.showEmojiPicker = false;
            this.inputMessageField.nativeElement.focus();
        } else {
            this.showEmojiPicker = true;
            this.inputMessageField.nativeElement.dismissSoftInput();
        }
    }
    public showKeyboard() {
        this.showEmojiPicker = false;
    }

    public onBackspaceClick() {
        this.inputMessage = (this.inputMessage ? this.inputMessage.slice(0, -1) : "");
        // console.log(this.inputMessageField.nativeElement.android.setSelection);
        if (this.inputMessageField.nativeElement.android) {
            setTimeout(() => {
                this.inputMessageField.nativeElement.android.setSelection(
                    this.inputMessageField.nativeElement.android.length(),
                );
            }, 0);
        }
    }
}
