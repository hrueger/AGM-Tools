import { Component, NgZone, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { AShowType, MSOption, MultiSelect } from "nativescript-multi-select";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { AlertService } from "../../_services/alert.service";
import { RemoteService } from "../../_services/remote.service";

export class Notification {
    public headline: string;
    public content: string;
    public importance: string;
    public receivers: any[];
    constructor(headline: string, content: string, importance: string) {
        this.headline = headline;
        this.content = content;
        this.importance = importance;
    }
}

// tslint:disable-next-line: max-classes-per-file
@Component({
    selector: "new-notification-modal",
    templateUrl: "new-notification.modal.tns.html",
})
export class NewNotificationModalComponent {
    public receivers: any[] = [];
    @ViewChild("dataform", { static: false }) public dataform: RadDataFormComponent;
    public dataFormConfig = {
        commitMode: "Immediate",
        isReadOnly: false,
        propertyAnnotations:
            [
                {
                    displayName: "Thema",
                    index: 0,
                    name: "headline",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Nachricht",
                    editor: "MultilineText",
                    index: 1,
                    name: "content",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },

                {
                    displayName: "Wichtigkeit",
                    editor: "Picker",
                    index: 3,
                    name: "importance",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                    valuesProvider: ["Bitte wählen", "Erfolg", "Information", "Warnung", "Gefahr"],
                },
            ],
        validationMode: "Immediate",
    };
    public noReceiversSelectedErrorMessage: boolean = false;
    public noTypeSelectedErrorMessage: boolean = false;
    private notification: Notification;
    private multiSelect: MultiSelect;
    private users: any[] = [];

    public constructor(
        private params: ModalDialogParams, private remoteService: RemoteService,
        private zone: NgZone) {
        this.multiSelect = new MultiSelect();
        this.remoteService.get("post", "usersGetUsers").subscribe((data) => {
            data.forEach((user) => {
                this.users.push({ name: user.username, id: user.id });
            });
        });
    }

    public close() {
        this.dataform.dataForm.validateAll()
            .then((result) => {
                if (result == true) {
                    if (this.receivers.length && this.receivers.length > 0) {
                        if (this.notification.importance && this.notification.importance != ""
                        && this.notification.importance != "Bitte wählen") {
                            if (this.notification.importance == "Erfolg") {
                                this.notification.importance = "1";
                            } else if (this.notification.importance == "Information") {
                                this.notification.importance = "2";
                            } else if (this.notification.importance == "Warnung") {
                                this.notification.importance = "3";
                            } else if (this.notification.importance == "Gefahr") {
                                this.notification.importance = "3";
                            } else {
                                this.notification.importance = "2";
                            }
                            this.notification.receivers = this.receivers;
                            this.params.closeCallback(this.notification);
                        } else {
                            this.noTypeSelectedErrorMessage = true;
                        }
                    } else {
                        this.noReceiversSelectedErrorMessage = true;
                    }
                }
            });
    }

    public ngOnInit() {
        this.notification = new Notification("", "", "");

    }

    public goBack() {
        this.params.closeCallback(null);
    }

    public openReceiversSelectMenu(): void {
        const options: MSOption = {
            android: {
                cancelButtonTextColor: "#252323",
                confirmButtonTextColor: "#70798C",
                titleSize: 25,
            },
            bindValue: "id",
            cancelButtonText: "Abbrechen",
            confirmButtonText: "Ok",
            displayLabel: "name",
            ios: {
                cancelButtonBgColor: "#252323",
                cancelButtonTextColor: "#ffffff",
                confirmButtonBgColor: "#70798C",
                confirmButtonTextColor: "#ffffff",
                showType: AShowType.TypeBounceIn,
            },
            items: this.users,
            onCancel: () => {
                // console.log('CANCEL');
            },
            onConfirm: (selectedItems) => {
                this.zone.run(() => {
                    this.receivers = selectedItems;
                    // this.users = selectedItems;
                    // console.log("SELECTED ITEMS => ", selectedItems);
                });
            },
            onItemSelected: (selectedItem) => {
                // console.log("SELECTED ITEM => ", selectedItem);
                this.zone.run(() => {
                    this.noReceiversSelectedErrorMessage = false;
                });
            },
            selectedItems: this.users,
            title: "Empfänger auswählen",
        };

        this.multiSelect.show(options);
    }
}
