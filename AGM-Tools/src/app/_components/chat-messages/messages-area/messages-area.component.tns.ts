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
import * as clipboard from "nativescript-clipboard";
import { PageChangeEventData } from "nativescript-image-swipe";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { ListView } from "tns-core-modules/ui/list-view/list-view";
import { Page } from "tns-core-modules/ui/page/page";
import config from "../../../_config/config";
import { Message } from "../../../_models/message.model";
import { AlertService } from "../../../_services/alert.service";
import { AuthenticationService } from "../../../_services/authentication.service";
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
    public allImageSources: any[] = [];
    public showingMedia: boolean = false;
    public currentImageName: string;
    public currentImageDate: string;
    public currentImageIndex: number;
    public shouldScrollWhenImageLoaded: boolean = true;
    constructor(private pushService: PushService,
        private authService: AuthenticationService,
        private remoteService: RemoteService,
        private page: Page) {

    }
    public getImageSrc(imageName, thumbnail = true) {
        return config.apiUrl +
            "?getAttachment=" +
            imageName +
            "&token=" +
            this.authService.currentUserValue.token +
            (thumbnail ? "&thumbnail" : "");
    }

    public onPageChanged(e: PageChangeEventData) {
        this.currentImageName = (
            this.allImageSources[e.page].sender ==
                this.authService.currentUserValue.firstName + " " + this.authService.currentUserValue.lastName ?
                "Ich" :
                this.allImageSources[e.page].sender);
        this.currentImageDate = this.allImageSources[e.page].date;
    }
    public downloadCurrentImage() {
        alert("Herunterladen von Bildern in die Gallerie wird noch nicht unterstützt!");
    }

    public newMessageFromPushService(data: any) {
        if (data.action == "newMessage") {
            if (data.data.data.chatID == this.receiverId) {
                this.remoteService.getNoCache("chatMarkAsRead", { message: data.data.data.messageId }).subscribe();
                const message = {
                    chat: null,
                    created: Date.now(),
                    fromMe: data.fromMe,
                    sendername: (data.fromMe ? "" : data.data.data.sender),
                    sent: "notsent",
                    text: data.data.body,
                };
                this.messages.push(message);
                this.scrollToBottom(this.messagesListView.nativeElement);
                setTimeout(() => {
                    this.scrollToBottom(this.messagesListView.nativeElement);
                }, 300);
            }
        } else {
            console.log(data);
        }
    }

    public imageLoaded() {
        if (this.shouldScrollWhenImageLoaded) {
            this.scrollToBottom(this.messagesListView.nativeElement);
            setTimeout(() => {
                this.scrollToBottom(this.messagesListView.nativeElement);
            }, 300);
        }
    }

    public addContact(contact: { name: string, number: string }) {
        clipboard.setText(contact.number).then(() => {
            alert("Die Nummer wurde kopiert. Fügen Sie jetzt den Kontakt in Ihrem Adressbuch hinzu!");
        });
    }

    public displayImage(messageIndex) {
        const that = this;
        if (this.allImageSources.length == 0) {
            this.messages.forEach((msg) => {
                if (msg.imageSrc) {
                    that.allImageSources.push({
                        date: msg.created,
                        name: msg.imageSrc,
                        sender: msg.sendername,
                        src: that.getImageSrc(msg.imageSrc, false),
                    });
                }
            });
        }
        this.currentImageIndex = this.allImageSources.findIndex((img) =>
            img.name == that.messages.getItem(messageIndex).imageSrc);
        this.showingMedia = true;
        this.page.actionBarHidden = true;
        this.currentImageName = (
            this.allImageSources[this.currentImageIndex].sender ==
                this.authService.currentUserValue.firstName + " " + this.authService.currentUserValue.lastName ?
                "Ich" :
                this.allImageSources[this.currentImageIndex].sender);
        this.currentImageDate = this.allImageSources[this.currentImageIndex].date;
    }

    public back(): void {
        this.showingMedia = false;
        this.page.actionBarHidden = false;
        this.currentImageName = "";
        this.currentImageDate = "";
    }

    public test(): void {
        this.showingMedia = false;
        this.page.actionBarHidden = false;
        this.currentImageName = "";
        this.currentImageDate = "";
    }

    public scrollToBottom(lv: ListView) {
        if (lv && lv.items.length > 0) {
            lv.scrollToIndex(lv.items.length);
            lv.android.setSelection(lv.items.length - 1);
            // lv.refresh();
        }
    }

    public ngOnInit() {
        setTimeout(() => {
            this.shouldScrollWhenImageLoaded = false;
        }, 1000);
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
