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
import { ListView } from "tns-core-modules/ui/list-view/list-view";
import config from "../../../_config/config";
import { Message } from "../../../_models/message.model";
import { AuthenticationService } from "../../../_services/authentication.service";
import { PushService } from "../../../_services/push.service.tns";

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
    constructor(private pushService: PushService, private authServcie: AuthenticationService) {

    }
    public getImageSrc(src) {
        return config.apiUrl + "?getAttachment=" + src + "&token=" + this.authServcie.currentUserValue.token;
    }
    public newMessageFromPushService(data: any) {
        if (data.action == "newMessage") {
            const message = {
                chat: null,
                created: Date.now(),
                fromMe: data.fromMe,
                sendername: (data.fromMe ? "" : data.data.sender),
                sent: "notsent",
                text: data.data.body,
            };
            this.messages.push(message);
            this.scrollToBottom(this.messagesListView.nativeElement);
            setTimeout(() => {
                this.scrollToBottom(this.messagesListView.nativeElement);
            }, 300);
        } else {
            console.log(data);
        }
    }

    public scrollToBottom(lv: ListView) {
        if (lv && lv.items.length > 0) {
            lv.scrollToIndex(lv.items.length);
            lv.android.setSelection(lv.items.length - 1);
            // lv.refresh();
        }
    }

    public ngOnInit() {
        this.pushService.reregisterCallbacks();
        this.pushService.getChatActions().subscribe((data) => {
            this.newMessageFromPushService(data);
        });
        setTimeout(() => {
            this.scrollToBottom(this.messagesListView.nativeElement);
        }, 500);
    }

    public listviewLoaded() {
        this.scrollToBottom(this.messagesListView.nativeElement);
    }

    public isContinuation(idx: number) {
        if (idx && this.messages.getItem(idx)) {
            if ((this.messages.getItem(idx - 1) &&
                this.messages.getItem(idx).fromMe == this.messages.getItem(idx - 1).fromMe &&
                this.messages.getItem(idx).sendername == this.messages.getItem(idx - 1).sendername &&
                !this.messages.getItem(idx).system)) {
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
        switch (message.sent) {
            case "notsent":
                return "not_sent";
            case "sent":
                return "sent";
            default:
                return "default";
        }
        // return "T";
    }

    public isSent(message: Message) {
        if (message.sent == "sent") {
            return true;
        }
    }
    public isNotSent(message: Message) {
        if (message.sent == "notsent") {
            return true;
        }
    }
    public isDefault(message: Message) {
        if (message.sent == "received" || message.sent == "seen") {
            return true;
        }
    }

    public isViewed(message: Message) {
        return message.sent === "seen";
    }
}
