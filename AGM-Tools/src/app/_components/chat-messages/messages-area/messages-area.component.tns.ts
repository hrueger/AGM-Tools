import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Input,
    OnInit
} from "@angular/core";
import { Message } from "../../../_models/message.model";
import { SentStatus } from "../../../_models/sent-status.model";

@Component({
    moduleId: module.id,
    selector: "ns-messages-area",
    templateUrl: "./messages-area.component.html",
    styleUrls: ["./messages-area.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesAreaComponent implements OnInit {
    @Input() messages: Message[];

    constructor(@Inject("platform") public platform) {}

    ngOnInit() {}

    isContinuation(idx: number) {
        return (
            (!this.messages[idx].fromMe &&
                this.messages[idx - 1] &&
                !this.messages[idx - 1].fromMe) ||
            (this.messages[idx].fromMe &&
                this.messages[idx - 1] &&
                this.messages[idx - 1].fromMe)
        );
    }

    getIcon(message: Message) {
        /*switch (message.sent) {
            case SentStatus.NOT_SENT:
                return "&#xf017;";
            case SentStatus.SENT:
                return "&#xf00c;";
            default:
                return "&#xf560;";
        }*/
        return "T";
    }

    isViewed(message: Message) {
        return message.sent === SentStatus.VIEWED;
    }
}
