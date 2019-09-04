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
import { ListView } from "tns-core-modules/ui/list-view/list-view";

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
    constructor(private remoteService: RemoteService, private pushService: PushService) {

    }

    public newMessageFromPushService(body: string, fromMe: boolean) {
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

    public scrollToBottom(lv: ListView) {
        if (lv && lv.items.length > 0) {
            lv.scrollToIndex(lv.items.length - 1);
            lv.refresh();
        }
    }

    public ngOnInit() {
        this.pushService.reregisterCallback();
        this.pushService.getChatActions().subscribe((data) => {
            this.newMessageFromPushService(data.body, data.fromMe);
        });
    }

    public listviewLoaded() {
        console.log("listview loaded");
        this.scrollToBottom(this.messagesListView.nativeElement);
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
