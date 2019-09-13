import { Component, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { getContactsWorker } from "nativescript-contacts-lite";
import { ListView } from "tns-core-modules/ui/list-view/list-view";

@Component({
    selector: "contact-picker-mdoal",
    styles: [`
    .list-item {
        margin:1 0;
        padding:10;
        background-color: #f6f6f6;
    }
    .thumbnail {
        width:50;
        height:50;
        border-radius:25;
        vertical-align:center;
        text-align:center;
    }
    .thumbnail-awesome {
        width:50;
        height:50;
        padding-top: 5;
        font-size:30;
        border-radius:25;
        color:#ffffff;
        vertical-align:middle;
        text-align:center;
    }
    .contact-name {
        font-size: 18;
        color: #000000;
        margin-left: 10;
        vertical-align:center;
    }
    .contact-number {
        margin-left: 10;
        vertical-align:center;
    }
  `],
    templateUrl: "contact-picker.modal.tns.html",
})
export class ContactPickerComponent {
    public contacts: any;
    @ViewChild("contactsList", { static: false }) private contactsListView: ListView;
    private flatColors: string[] = [
        "#1abc9c",
        "#2ecc71",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#16a085",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
        "#f1c40f",
        "#e67e22",
        "#e74c3c",
        "#f39c12",
        "#d35400",
        "#c0392b",
    ];
    public constructor(private params: ModalDialogParams) {
    }

    public onContactSelect(contact: any) {
        this.params.closeCallback(contact);
    }

    public ngOnInit() {
        const desiredFields: string[] = ["display_name", "phone", "thumbnail"];
        getContactsWorker(desiredFields).then((result) => {
            this.contacts = result;
        });
    }

    public goBack() {
        this.params.closeCallback(null);
    }

    public getRandomColor() {
        return this.flatColors[Math.floor(Math.random() *
            this.flatColors.length)];
    }

    public getInitialsFromName(name: string) {
        const names = name.split(" ");
        let initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    }
}
