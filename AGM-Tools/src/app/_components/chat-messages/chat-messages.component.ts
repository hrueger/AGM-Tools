import { Location } from "@angular/common";
import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
} from "@angular/core";
import { Message } from "../../_models/message.model";
import { RemoteService } from "../../_services/remote.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "chat-messages",
    styleUrls: ["chat-messages.component.scss"],
    templateUrl: "chat-messages.component.html",
})
export class ChatMessagesComponent
    implements OnChanges, AfterViewChecked {
    @Input() public inputChat: any;
    public unread: number;
    public messages: Message[];
    public showInfoMessage: boolean = true;
    public messageGotToSend: Event;
    public attachmentMessageGotToSend: Event;
    private scrolledToBottom: boolean = false;

    constructor(
        private remoteService: RemoteService,
        private location: Location,
        private cdr: ChangeDetectorRef,
    ) { }

    public messageSentFromChild(event: Event) {
        this.messageGotToSend = event;
    }
    public attachmentMessageSentFromChild(event: Event) {
        this.attachmentMessageGotToSend = event;
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
        if (this.inputChat && this.inputChat.id) {
            this.getMessages(this.inputChat);
        } else {
            this.messages = null;
        }
    }
    public getMessages(chat) {
        this.remoteService
            .get("get", `chats/${chat.isUser ? "user" : "project"}/${chat.id}`)
            .subscribe((data) => {
                if (data) {
                    this.messages = data;
                    this.showInfoMessage = false;
                    this.cdr.detectChanges();
                } else {
                    this.messages = [];
                }
            });
    }

    public goBack() {
        this.location.back();
    }
}
