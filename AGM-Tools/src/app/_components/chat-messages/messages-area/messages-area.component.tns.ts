import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Input,
    OnInit,
    ViewChild,
    ElementRef
} from "@angular/core";
import { Message } from "../../../_models/message.model";

@Component({
    moduleId: module.id,
    selector: "ns-messages-area",
    templateUrl: "./messages-area.component.html",
    styleUrls: ["./messages-area.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesAreaComponent implements OnInit {
    @Input() messages: Message[];
    @ViewChild("messagesListView", { static: false }) messagesListView: ElementRef;
    shouldScrollToBottom: boolean = false;
    constructor(@Inject("platform") public platform) { }

    scrollToBottom(): void {
        if (this.messagesListView && this.messagesListView.nativeElement && this.messagesListView.nativeElement.items.length > 0) {
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
