import { Component, EventEmitter, Output } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "ns-message-box",
    templateUrl: "./message-box.component.html",
    styleUrls: ["./message-box.component.scss"],
})
export class MessageBoxComponent {
    public messageContent: string;
    @Output() public messageSent = new EventEmitter<string>();
    public showEmojiPicker = false;
    public emojiI18n = {
        search: "Suchen",
        emojilist: "Emoji-Liste",
        notfound: "Keine Emojis gefunden",
        clear: "Leeren",
        categories: {
            search: "Suchergebnisse",
            recent: "Häufig benutzt",
            people: "Smileys & Personen",
            nature: "Tiere & Natur",
            foods: "Essen & Trinken",
            activity: "Aktivität",
            places: "Reisen & Orte",
            objects: "gegenstände",
            symbols: "Symbole",
            flags: "Flaggen",
            custom: "Benutzerdefiniert",
        },
        skintones: {
            1: "Standart-Hautton",
            2: "Heller Hautton",
            3: "Mittelheller Hautton",
            4: "Mittlerer Hautton",
            5: "Mitteldunkler Hautton",
            6: "Dunkler Hautton",
        },
    };
    constructor() {}
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
