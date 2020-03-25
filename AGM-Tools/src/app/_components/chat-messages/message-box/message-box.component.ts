import {
    Component, EventEmitter, Input, Output,
} from "@angular/core";
import { AlertService } from "../../../_services/alert.service";
import { FastTranslateService } from "../../../_services/fast-translate.service";

@Component({
    selector: "ns-message-box",
    styleUrls: ["./message-box.component.scss"],
    templateUrl: "./message-box.component.html",
})
export class MessageBoxComponent {
    public messageContent: string;
    @Input() public embedded = false;
    public showAttachmentContainer = false;
    @Output() public messageSent = new EventEmitter<string>();
    @Output() public attachmentMessageSent = new EventEmitter<any>();
    public showEmojiPicker = false;

    constructor(private alertService: AlertService, private fts: FastTranslateService) {}

    public toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }
    public sendMessage() {
        this.messageSent.emit(this.messageContent);
        this.messageContent = "";
    }
    public addEmoji(event) {
        const message = this.messageContent;
        const text = `${message}${event.emoji.native}`;

        this.messageContent = text;
        this.showEmojiPicker = false;
    }

    public async sendDocument() {
        this.showAttachmentContainer = false;
        this.alertService.info(await this.fts.t("errors.avalibleInFutureVersion"));
        // console.log("Send document!");
    }
    public async sendPicture() {
        this.showAttachmentContainer = false;
        this.alertService.info(await this.fts.t("errors.avalibleInFutureVersion"));
        // console.log("Send image!");
    }
    public async sendGallery() {
        this.showAttachmentContainer = false;
        this.alertService.info(await this.fts.t("errors.avalibleInFutureVersion"));
        // console.log("Send gallery!");
    }
    public async sendAudio() {
        this.showAttachmentContainer = false;
        this.alertService.info(await this.fts.t("errors.avalibleInFutureVersion"));
        // console.log("Send audio!");
    }
    public sendLocation() {
        this.showAttachmentContainer = false;
        new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((resp) => {
                resolve(resp);
            },
            (err) => {
                reject(err);
            });
        }).then((val) => {
            this.attachmentMessageSent.emit({ type: "location", data: val });
        }).catch(() => undefined);
    }
    public async sendContact() {
        this.showAttachmentContainer = false;
        this.alertService.info(await this.fts.t("errors.avalibleInFutureVersion"));
        // console.log("Send contact!");
    }
}
