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
import config from "../../../_config/config";
import { Message } from "../../../_models/message.model";
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
    @Input() public messages: Message[];
    @Input() public messageSent: Event;
    @Input() public receiverId: number;
    public allImageSources: any = [];

    constructor(
        private remoteService: RemoteService,
        private cdr: ChangeDetectorRef,
        private authService: AuthenticationService,
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
                    const date = new Date(msg.created);
                    const datestr = `am ${that.pad(date.getDay())}.${that.pad(date.getMonth())}.${date.getFullYear()} um ${that.pad(date.getHours())}:${that.pad(date.getMinutes())} Uhr`;
                    that.allImageSources.push({
                        caption: `${msg.sendername} ${datestr}`,
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
        return config.apiUrl +
            "?getAttachment=" +
            imageName +
            "&token=" +
            this.authService.currentUserValue.token +
            (thumbnail ? "&thumbnail" : "");
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
            let message: Message = {
                chat: null,
                created: Date.now(),
                fromMe: true,
                sendername: "",
                sent: "notsent",
                text: changes.messageSent.currentValue,
            };
            this.messages.push(message);
            this.remoteService
                .getNoCache("chatSendMessage", {
                    message: changes.messageSent.currentValue,
                    rid: this.receiverId,
                })
                .subscribe((data) => {
                    message = this.messages.pop();
                    message.sent = "sent";
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
        // tslint:disable-next-line: radix
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

    public isViewed(message: Message) {
        // tslint:disable-next-line: radix
        return message.sent === "seen";
    }

    private pad(num, size = 2) {
        let s = num + "";
        while (s.length < size) { s = "0" + s; }
        return s;
    }
}
