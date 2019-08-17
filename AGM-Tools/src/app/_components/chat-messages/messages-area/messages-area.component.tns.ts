import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Input,
    OnInit,
    ViewChild,
    ElementRef,
    SimpleChanges
} from "@angular/core";
import { Message } from "../../../_models/message.model";
import { RemoteService } from "../../../_services/remote.service";

@Component({
    moduleId: module.id,
    selector: "ns-messages-area",
    templateUrl: "./messages-area.component.html",
    styleUrls: ["./messages-area.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesAreaComponent implements OnInit {
    @Input() messages: ObservableArray(Message[]);
@Input() messageSent;
@Input() receiverId: number;
@ViewChild("messagesListView", { static: false }) messagesListView: ElementRef;
shouldScrollToBottom: boolean = false;
constructor(private remoteService: RemoteService) { }

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
            sent: "0",
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
                message.sent = "1";
                this.messages.push(message);
                this.messagesListView.nativeElement.refresh();
            });
    }
}

scrollToBottom(): void {
    if(this.messagesListView && this.messagesListView.nativeElement && this.messagesListView.nativeElement.items.length > 0) {
    this.messagesListView.nativeElement.scrollToIndex(this.messagesListView.nativeElement.items.length - 1);

} else {
    this.shouldScrollToBottom = true;
}
    }
ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
        this.shouldScrollToBottom = false;
        this.scrollToBottom();
    }
}

ngOnInit() {
    this.shouldScrollToBottom = true;
}

isContinuation(idx: number) {
    if (idx && this.messages[idx]) {
        return (this.messages[idx - 1] && this.messages[idx].fromMe == this.messages[idx - 1].fromMe && !this.messages[idx].system);
    } else {
        return false;
    }

}

getIcon(message: Message) {
    switch (parseInt(message.sent)) {
        case 0:
            return "not_sent";
        case 1:
            return "sent";
        default:
            return "default";
    }
    //return "T";
}

isSent(message: Message) {
    if (parseInt(message.sent) == 1) {
        return true;
    }
}
isNotSent(message: Message) {
    if (parseInt(message.sent) == 0) {
        return true;
    }
}
isDefault(message: Message) {
    if (parseInt(message.sent) == 2 || parseInt(message.sent) == 3) {
        return true;
    }
}

isViewed(message: Message) {
    return parseInt(message.sent) === 3;
}
}
