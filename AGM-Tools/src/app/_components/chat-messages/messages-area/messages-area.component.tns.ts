import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild,
} from "@angular/core";
import * as clipboard from "nativescript-clipboard";
import { PageChangeEventData } from "nativescript-image-swipe";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { ListView } from "tns-core-modules/ui/list-view/list-view";
import { Page } from "tns-core-modules/ui/page/page";
import * as utils from "tns-core-modules/utils/utils";
import { environment } from "../../../../environments/environment";
import { Message } from "../../../_models/message.model";
import { AuthenticationService } from "../../../_services/authentication.service";
import { PushService } from "../../../_services/push.service.tns";
import { RemoteService } from "../../../_services/remote.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    public showingMedia = false;
    public currentImageName: string;
    public currentImageDate: string;
    public currentImageIndex: number;
    public shouldScrollWhenImageLoaded = true;
    public constructor(private pushService: PushService,
        private authService: AuthenticationService,
        private remoteService: RemoteService,
        private authenticationService: AuthenticationService,
        private page: Page) {

    }

    public openLocation(message): void {
        utils.openUrl(`https://www.google.de/maps/place/${message.locationLat},${message.locationLong}/@${message.locationLat},${message.locationLong},17z/`);
    }

    public getImageSrc(imageName, thumbnail = true): string {
        return `${environment.apiUrl}?getAttachment=${imageName}&token=${this.authService.currentUserValue.token}${thumbnail ? "&thumbnail" : ""}`;
    }

    public onPageChanged(e: PageChangeEventData): void {
        this.currentImageName = (
            this.allImageSources[e.page].sender
                == this.authService.currentUserValue.username
                ? "Ich"
                : this.allImageSources[e.page].sender);
        this.currentImageDate = this.allImageSources[e.page].date;
    }
    public downloadCurrentImage(): void {
        // eslint-disable-next-line no-alert
        alert("Herunterladen von Bildern in die Gallerie wird noch nicht unterstützt!");
    }

    public getLocationImageSrc(message): string {
        return `${environment.apiUrl}chats/mapProxy/${message.locationLat},${message.locationLong}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public newMessageFromPushService(data: any): void {
        if (data.action == "newMessage") {
            if (data.data.data.chatID == this.receiverId) {
                this.remoteService.getNoCache("post", "chatMarkAsRead",
                    { message: data.data.data.messageId }).subscribe();
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
                setTimeout((): void => {
                    this.scrollToBottom(this.messagesListView.nativeElement);
                }, 300);
            }
        } else {
            // eslint-disable-next-line no-console
            console.log(data);
        }
    }

    public imageLoaded(): void {
        if (this.shouldScrollWhenImageLoaded) {
            this.scrollToBottom(this.messagesListView.nativeElement);
            setTimeout((): void => {
                this.scrollToBottom(this.messagesListView.nativeElement);
            }, 300);
        }
    }

    public addContact(contact: { name: string; number: string }): void {
        clipboard.setText(contact.number).then((): void => {
            // eslint-disable-next-line no-alert
            alert("Die Nummer wurde kopiert. Fügen Sie jetzt den Kontakt in Ihrem Adressbuch hinzu!");
        });
    }

    public displayImage(messageIndex): void {
        const that = this;
        if (this.allImageSources.length == 0) {
            this.messages.forEach((msg): void => {
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
        this.currentImageIndex = this.allImageSources.findIndex(
            (img): boolean => img.name == that.messages.getItem(messageIndex).imageSrc,
        );
        this.showingMedia = true;
        this.page.actionBarHidden = true;
        this.currentImageName = (
            this.allImageSources[this.currentImageIndex].sender
                == this.authService.currentUserValue.username
                ? "Ich"
                : this.allImageSources[this.currentImageIndex].sender);
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

    public scrollToBottom(lv: ListView): void {
        if (lv && lv.items.length > 0) {
            lv.scrollToIndex(lv.items.length);
            lv.android.setSelection(lv.items.length - 1);
            // lv.refresh();
        }
    }

    public ngOnInit(): void {
        setTimeout((): void => {
            this.shouldScrollWhenImageLoaded = false;
        }, 1000);
        this.pushService.reregisterCallbacks();
        this.pushService.getChatActions().subscribe((data): void => {
            this.newMessageFromPushService(data);
        });
        setTimeout((): void => {
            this.scrollToBottom(this.messagesListView.nativeElement);
        }, 500);
    }

    public listviewLoaded(): void {
        this.scrollToBottom(this.messagesListView.nativeElement);
    }

    public isContinuation(idx: number): boolean {
        if (idx && this.messages.getItem(idx)) {
            if ((this.messages.getItem(idx - 1)
                && this.messages.getItem(idx).fromMe == this.messages.getItem(idx - 1).fromMe
                && this.messages.getItem(idx).sendername
                    == this.messages.getItem(idx - 1).sendername
                && !this.messages.getItem(idx).system)) {
                return true;
            }
            return false;
        }
        return false;
    }

    public getIcon(message: Message): string {
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

    public isSent(message: Message): boolean {
        if (message.sent == "sent") {
            return true;
        }
        return undefined;
    }
    public isNotSent(message: Message): boolean {
        if (message.sent == "notsent") {
            return true;
        }
        return undefined;
    }
    public isDefault(message: Message): boolean {
        if (message.sent == "received" || message.sent == "seen") {
            return true;
        }
        return undefined;
    }

    public isViewed(message: Message): boolean {
        return message.sent === "seen";
    }
}
