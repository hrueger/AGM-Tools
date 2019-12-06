import { Component, EventEmitter, Output } from "@angular/core";
import { AlertService } from "../../../_services/alert.service";

@Component({
    moduleId: module.id,
    selector: "ns-message-box",
    styleUrls: ["./message-box.component.scss"],
    templateUrl: "./message-box.component.html",
})
export class MessageBoxComponent {
    public messageContent: string;
    public showAttachmentContainer: boolean = false;
    @Output() public messageSent = new EventEmitter<string>();
    @Output() public attachmentMessageSent = new EventEmitter<any>();
    public showEmojiPicker = false;

    constructor(private alertService: AlertService) {}

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

    public sendDocument() {
        this.showAttachmentContainer = false;
        this.alertService.info("Das geht in der Webversion noch nicht!");
        // console.log("Send document!");
    }
    public sendPicture() {
        this.showAttachmentContainer = false;
        this.alertService.info("Das geht in der Webversion noch nicht!");
        // console.log("Send image!");
    }
    public sendGallery() {
        this.showAttachmentContainer = false;
        this.alertService.info("Das geht in der Webversion noch nicht!");
        // console.log("Send gallery!");
    }
    public sendAudio() {
        this.showAttachmentContainer = false;
        this.alertService.info("Das geht in der Webversion noch nicht!");
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
            this.attachmentMessageSent.emit({type: "location", data: val});
        }).catch(() => undefined);
    }
    public sendContact() {
        this.showAttachmentContainer = false;
        this.alertService.info("Das geht in der Webversion nicht!");
        // console.log("Send contact!");
    }
}
