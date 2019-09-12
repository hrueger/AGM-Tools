import { Component, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { getContactsWorker } from "nativescript-contacts-lite";

@Component({
    selector: "contact-picker-mdoal",
    styles: [`
    .list-item { margin:1 0; padding:10; background-color: #f6f6f6; }
    .thumbnail { width:50; height:50; border-radius:25; vertical-align:center; text-align:center; }
    .thumbnail-awesome { font-size:50; color:#b7b7b7; vertical-align:center; text-align:center; }
    .contact-name { font-size: 18; color: #000000; margin-left: 10; vertical-align:center; }
  `],
    templateUrl: "contact-picker.modal.tns.html",
})
export class ContactPickerComponent {
    public contacts: any;
    public constructor(private params: ModalDialogParams) {
    }

    public close() {
        //
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
}
