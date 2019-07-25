import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Input,
    OnInit,
    SimpleChanges,
    ChangeDetectorRef
} from "@angular/core";
import { Message } from "../../../_models/message.model";
import { SentStatus } from "../../../_models/sent-status.model";
import { RemoteService } from "../../../_services/remote.service";

@Component({
    moduleId: module.id,
    selector: "ns-messages-area",
    templateUrl: "./messages-area.component.html",
    styleUrls: ["./messages-area.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesAreaComponent implements OnInit {
    @Input() messages: Message[];
    @Input() messageSent: Event;
    @Input() receiverId: number;

    constructor(
        private remoteService: RemoteService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.messages = this.messages.slice(0, 50);
        console.log("Messages");
        console.log(this.messages);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            changes.messageSent &&
            changes.messageSent.currentValue != "" &&
            changes.messageSent.currentValue != null
        ) {
            /*if (this.messages[-1]) {
                let chat = this.messages[-1].chat
            }*/
            let message = {
                text: changes.messageSent.currentValue,
                chat: null,
                fromMe: true,
                created: Date.now(),
                sent: SentStatus.NOT_SENT,
                sendername: ""
            };
            this.messages.push(message);
            this.remoteService
                .getNoCache("chatSendMessage", {
                    rid: this.receiverId,
                    message: changes.messageSent.currentValue
                })
                .subscribe(data => {
                    message = this.messages.pop();
                    message.sent = SentStatus.SENT;
                    this.messages.push(message);
                    // console.log(this.messages);
                    this.cdr.detectChanges();
                });
        }
    }

    trackByFn(index, item) {
        return item.id;
    }

    isContinuation(idx: number) {
        if (!this.messages[idx - 1]) return false;
        return (
            /*(!this.messages[idx].fromMe &&
                this.messages[idx - 1] &&
                !this.messages[idx - 1].fromMe) ||
            (this.messages[idx].fromMe &&
                this.messages[idx - 1] &&
                this.messages[idx - 1].fromMe)*/

            this.messages[idx].fromMe == this.messages[idx - 1].fromMe &&
            this.messages[idx].sendername == this.messages[idx - 1].sendername
        );
    }

    getIcon(message: Message) {
        switch (message.sent) {
            case SentStatus.NOT_SENT:
                return "&#xf017;";
            case SentStatus.SENT:
                return "&#xf00c;";
            default:
                return "&#xf560;";
        }
        //return "T";
    }

    isViewed(message: Message) {
        return message.sent === SentStatus.VIEWED;
    }
}
