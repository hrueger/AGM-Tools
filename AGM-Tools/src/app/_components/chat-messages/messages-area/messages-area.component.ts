import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Input,
    OnInit,
    SimpleChanges,
} from "@angular/core";
import { Lightbox } from "ngx-lightbox";
import { environment } from "../../../../environments/environment";
import { AlertService } from "../../../_services/alert.service";
import { AuthenticationService } from "../../../_services/authentication.service";
import { RemoteService } from "../../../_services/remote.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    moduleId: module.id,
    selector: "ns-messages-area",
    styleUrls: ["./messages-area.component.scss"],
    templateUrl: "./messages-area.component.html",
})
export class MessagesAreaComponent implements OnInit {
    @Input() public messages: any[];
    @Input() public messageSent: Event;
    @Input() public attachmentMessageSent: Event;
    @Input() public chat: any;
    public allImageSources: any = [];

    constructor(
        private remoteService: RemoteService,
        private cdr: ChangeDetectorRef,
        private authenticationService: AuthenticationService,
        private lightbox: Lightbox,
        private alertService: AlertService,
    ) { }

    public ngOnInit() {
        this.messages = this.messages.slice(0, 50);
    }

    public addContact(contact) {
        const el = document.createElement("textarea");
        el.value = contact.number;
        // @ts-ignore
        el.style = { position: "absolute", left: "-9999px" };
        el.setAttribute("readonly", "");
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        this.alertService.success("Die Nummer wurde in die Zwischenablage kopiert!");
    }

    public displayImage(messageIndex) {
        const that = this;
        if (this.allImageSources.length == 0) {
            this.messages.forEach((msg) => {
                if (msg.imageSrc) {
                    const date = new Date(msg.date);
                    const datestr = `am ${that.pad(date.getDay())}.${that.pad(date.getMonth())}.${date.getFullYear()} um ${that.pad(date.getHours())}:${that.pad(date.getMinutes())} Uhr`;
                    that.allImageSources.push({
                        caption: `${msg.sender.username} ${datestr}`,
                        name: msg.imageSrc,
                        src: that.getImageSrc(msg.imageSrc, false),
                    });
                }
            });
        }
        const index = this.allImageSources.findIndex((img) => img.name == that.messages[messageIndex].imageSrc);
        this.lightbox.open(this.allImageSources, index);
    }

    public getImageSrc(imageName, thumbnail = true) {
        return environment.apiUrl +
            "?getAttachment=" +
            imageName +
            "&token=" +
            this.authenticationService.currentUserValue.token +
            (thumbnail ? "&thumbnail" : "");
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (
            changes.messageSent &&
            changes.messageSent.currentValue != "" &&
            changes.messageSent.currentValue != null
        ) {
            let message = {
                content: changes.messageSent.currentValue,
                date: new Date(),
                fromMe: true,
                id: null,
                sender: {
                    username: "",
                },
                sent: "notsent",
                toProject: null,
                toUser: null,
            };
            this.messages.push(message);
            this.remoteService
                .getNoCache("post", `chats/${this.chat.isUser ? "user" : "project"}/${this.chat.id}`, {
                    message: changes.messageSent.currentValue,
                })
                .subscribe((data) => {
                    message = this.messages.pop();
                    message.sent = "sent";
                    this.messages.push(message);
                    // console.log(this.messages);
                    this.cdr.detectChanges();
                });
        } else if (
            changes.attachmentMessageSent &&
            changes.attachmentMessageSent.currentValue != "" &&
            changes.attachmentMessageSent.currentValue != null
        ) {
            let message;
            let data;
            if (changes.attachmentMessageSent.currentValue.type == "location") {
                message = {
                    date: new Date(),
                    fromMe: true,
                    id: null,
                    locationLat: changes.attachmentMessageSent.currentValue.data.coords.latitude,
                    locationLong: changes.attachmentMessageSent.currentValue.data.coords.longitude,
                    sender: {
                        username: "",
                    },
                    sent: "notsent",
                    toProject: null,
                    toUser: null,
                };
                data = {
                    locationLat: changes.attachmentMessageSent.currentValue.data.coords.latitude,
                    locationLong: changes.attachmentMessageSent.currentValue.data.coords.longitude,
                };
            }
            this.messages.push(message);
            this.remoteService
                .getNoCache("post", `chats/${this.chat.isUser ? "user" : "project"}/${this.chat.id}/attachment`, {
                    message: data,
                })
                .subscribe((d) => {
                    message = this.messages.pop();
                    message.sent = "sent";
                    this.messages.push(message);
                    // console.log(this.messages);
                    this.cdr.detectChanges();
                });
        }
    }

    public getLocationImageSrc(message) {
        return `${environment.apiUrl}chats/mapProxy/${message.locationLat},${message.locationLong}?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public openLocationInNewTab(message) {
        window.open(`https://www.google.de/maps/place/${message.locationLat},${message.locationLong}/@${message.locationLat},${message.locationLong},17z/`, "_blank");
    }

    public trackByFn(index, item) {
        if (item) {
            return item.id;
        }
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

    public getIcon(message) {
        switch (message.sent) {
            case "notsent":
                return "&#xf017;";
            case "sent":
                return "&#xf00c;";
            default:
                return "&#xf560;";
        }
        // return "T";
    }

    public isViewed(message) {
        return message.sent === "seen";
    }

    private pad(num, size = 2) {
        let s = num + "";
        while (s.length < size) { s = "0" + s; }
        return s;
    }
}
