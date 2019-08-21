import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Input,
    OnInit,
    SimpleChanges,
} from "@angular/core";
import { Message } from "../../../_models/message.model";
import { RemoteService } from "../../../_services/remote.service";

@Component({
    moduleId: module.id,
    selector: "ns-messages-area",
    templateUrl: "./messages-area.component.html",
    styleUrls: ["./messages-area.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesAreaComponent implements OnInit {
    @Input() public messages: Message[];
    @Input() public messageSent: Event;
    @Input() public receiverId: number;

    constructor(
        private remoteService: RemoteService,
        private cdr: ChangeDetectorRef,
    ) { }

    public ngOnInit() {
        this.messages = this.messages.slice(0, 50);
        console.log("Messages");
        console.log(this.messages);
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
                text: changes.messageSent.currentValue,
                chat: null,
                fromMe: true,
                created: Date.now(),
                sent: "0",
                sendername: "",
            };
            this.messages.push(message);
            this.remoteService
                .getNoCache("chatSendMessage", {
                    rid: this.receiverId,
                    message: changes.messageSent.currentValue,
                })
                .subscribe((data) => {
                    message = this.messages.pop();
                    message.sent = "1";
                    this.messages.push(message);
                    // console.log(this.messages);
                    this.cdr.detectChanges();
                });
        }
    }

    public trackByFn(index, item) {
        return item.id;
    }

    public isContinuation(idx: number) {
        if (!this.messages[idx - 1]) { return false; }
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

    public getIcon(message: Message) {
        switch (parseInt(message.sent)) {
            case 0:
                return "&#xf017;";
            case 1:
                return "&#xf00c;";
            default:
                return "&#xf560;";
        }
        // return "T";
    }

    public isViewed(message: Message) {
        return parseInt(message.sent) === 3;
    }
}
