import { Component, Output, EventEmitter } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "ns-message-box",
    templateUrl: "./message-box.component.html",
    styleUrls: ["./message-box.component.scss"]
})
export class MessageBoxComponent {
    messageContent: string;
    @Output() messageSent = new EventEmitter<string>();
    constructor() {}
    sendMessage() {
        this.messageSent.emit(this.messageContent);
        this.messageContent = "";
    }
}
