import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    Input,
    OnInit,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Message } from "../../../_models/message.model";
import { PushService } from "../../../_services/push.service.tns";
import { RemoteService } from "../../../_services/remote.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    moduleId: module.id,
    providers: [PushService],
    selector: "ns-messages-area",
    styleUrls: ["./messages-area.component.scss"],
    templateUrl: "./messages-area.component.html",
})
export class MessagesAreaComponent implements OnInit {
    @Input() public messages: ObservableArray<Message>;
    @Input() public messageSent;
    @Input() public receiverId: number;
    @ViewChild("messagesListView", { static: false }) public messagesListView: ElementRef;
    public shouldScrollToBottom: boolean = false;
    constructor(private remoteService: RemoteService, private pushService: PushService) {
        this.pushService.setNewMesssageCallback(this.newMessageFromPushService);
    }

    public newMessageFromPushService(body: any, fromMe: boolean) {
        console.log("Etwas bekommen: ", body);
        const message = {
            chat: null,
            created: Date.now(),
            fromMe,
            sendername: "",
            sent: "0",
            text: body,
        };
        this.messages.push(message);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (
            changes.messageSent &&
            changes.messageSent.currentValue != "" &&
            changes.messageSent.currentValue != null
        ) {
            /*if (this.messages[-1]) {
                let chat = this.messages[-1].chat
            }*/
            let message = {
                chat: null,
                created: Date.now(),
                fromMe: true,
                sendername: "",
                sent: "0",
                text: changes.messageSent.currentValue,
            };
            this.messages.push(message);
            this.remoteService
                .getNoCache("chatSendMessage", {
                    message: changes.messageSent.currentValue,
                    rid: this.receiverId,
                })
                .subscribe(() => {
                    message = this.messages.pop();
                    message.sent = "1";
                    this.messages.push(message);
                    this.messagesListView.nativeElement.refresh();
                });
        }
    }

    public scrollToBottom(): void {
        if (this.messagesListView && this.messagesListView.nativeElement &&
            this.messagesListView.nativeElement.items.length > 0) {
            this.messagesListView.nativeElement.scrollToIndex(this.messagesListView.nativeElement.items.length - 1);

        } else {
            this.shouldScrollToBottom = true;
        }
    }
    public ngAfterViewChecked() {
        if (this.shouldScrollToBottom) {
            this.shouldScrollToBottom = false;
            this.scrollToBottom();
        }
    }

    public ngOnInit() {
        this.shouldScrollToBottom = true;
    }

    public isContinuation(idx: number) {
        if (idx && this.messages.getItem(idx)) {
            if ((this.messages.getItem(idx - 1) &&
                this.messages.getItem(idx).fromMe == this.messages.getItem(idx - 1).fromMe
                && !this.messages.getItem(idx).system)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }

    }

    public getIcon(message: Message) {
        // tslint:disable-next-line: radix
        switch (parseInt(message.sent)) {
            case 0:
                return "not_sent";
            case 1:
                return "sent";
            default:
                return "default";
        }
        // return "T";
    }

    public isSent(message: Message) {
        // tslint:disable-next-line: radix
        if (parseInt(message.sent) == 1) {
            return true;
        }
    }
    public isNotSent(message: Message) {
        // tslint:disable-next-line: radix
        if (parseInt(message.sent) == 0) {
            return true;
        }
    }
    public isDefault(message: Message) {
        // tslint:disable-next-line: radix
        if (parseInt(message.sent) == 2 || parseInt(message.sent) == 3) {
            return true;
        }
    }

    public isViewed(message: Message) {
        // tslint:disable-next-line: radix
        return parseInt(message.sent) === 3;
    }
}
