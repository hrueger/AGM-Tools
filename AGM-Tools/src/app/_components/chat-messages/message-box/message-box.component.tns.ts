import { Component, Inject, Input } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "ns-message-box",
    templateUrl: "./message-box.component.html",
    styleUrls: ["./message-box.component.scss"]
})
export class MessageBoxComponent {
    showEmojiPicker: boolean = false;
    constructor(@Inject("platform") public platform) { }

    toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }
}
