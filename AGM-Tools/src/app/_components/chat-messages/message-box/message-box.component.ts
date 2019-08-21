import { Component, EventEmitter, Output } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "ns-message-box",
    styleUrls: ["./message-box.component.scss"],
    templateUrl: "./message-box.component.html",
})
export class MessageBoxComponent {
    public messageContent: string;
    @Output() public messageSent = new EventEmitter<string>();
    public showEmojiPicker = false;
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
}
