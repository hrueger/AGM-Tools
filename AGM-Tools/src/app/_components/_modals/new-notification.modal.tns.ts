import { Component, ViewChild, NgZone } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { MultiSelect, MSOption, AShowType } from "nativescript-multi-select";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";

export class Notification {
    public headline: string;
    public content: string;
    public importance: string;
    receivers: any[];
    constructor(headline: string, content: string, importance: string) {
        this.headline = headline;
        this.content = content;
        this.importance = importance;
    }
}


@Component({
    selector: "new-notification-modal",
    templateUrl: "new-notification.modal.tns.html",
})
export class NewNotificationModalComponent {
    private notification: Notification;
    private _MSelect: MultiSelect;
    private users: Array<any> = [];
    public receivers: Array<any> = [];
    @ViewChild('dataform', { static: false }) dataform: RadDataFormComponent;
    dataFormConfig = {
        "isReadOnly": false,
        "commitMode": "Immediate",
        "validationMode": "Immediate",
        "propertyAnnotations":
            [
                {
                    "name": "headline",
                    "displayName": "Thema",
                    "index": 0,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "content",
                    "displayName": "Nachricht",
                    "index": 1,
                    "editor": "MultilineText",
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },

                {
                    "name": "importance",
                    "displayName": "Wichtigkeit",
                    "index": 3,
                    "editor": "Picker",
                    "validators": [
                        { "name": "NonEmpty" }
                    ],
                    "valuesProvider": ["Bitte wählen", "Erfolg", "Information", "Warnung", "Gefahr"]
                }
            ]
    };
    noReceiversSelectedErrorMessage: boolean = false;
    noTypeSelectedErrorMessage: boolean = false;

    public constructor(private params: ModalDialogParams, private remoteService: RemoteService, private zone: NgZone, private alertService: AlertService) {
        this._MSelect = new MultiSelect();
        this.remoteService.get("usersGetUsers").subscribe(data => {
            data.forEach(user => {
                this.users.push({ name: user.username, id: user.id });
            });
        });
    }

    public close() {
        this.dataform.dataForm.validateAll()
            .then(result => {
                if (result == true) {
                    if (this.receivers.length && this.receivers.length > 0) {
                        if (this.notification.importance && this.notification.importance != "" && this.notification.importance != "Bitte wählen") {
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
                } else {
                    console.log("validation failed");
                }
            });
    }

    ngOnInit() {
        this.notification = new Notification("", "", "");

    }



    goBack() {
        this.params.closeCallback(null);
    }



    public openReceiversSelectMenu(): void {
        const options: MSOption = {
            title: "Empfänger auswählen",
            selectedItems: this.users,
            items: this.users,
            bindValue: 'id',
            displayLabel: 'name',
            confirmButtonText: "Ok",
            cancelButtonText: "Abbrechen",
            onConfirm: selectedItems => {
                this.zone.run(() => {
                    this.receivers = selectedItems;
                    //this.users = selectedItems;
                    //console.log("SELECTED ITEMS => ", selectedItems);
                });
            },
            onItemSelected: selectedItem => {
                //console.log("SELECTED ITEM => ", selectedItem);
                this.zone.run(() => {
                    this.noReceiversSelectedErrorMessage = false;
                });
            },
            onCancel: () => {
                //console.log('CANCEL');
            },
            android: {
                titleSize: 25,
                cancelButtonTextColor: "#252323",
                confirmButtonTextColor: "#70798C",
            },
            ios: {
                cancelButtonBgColor: "#252323",
                confirmButtonBgColor: "#70798C",
                cancelButtonTextColor: "#ffffff",
                confirmButtonTextColor: "#ffffff",
                showType: AShowType.TypeBounceIn
            }
        };

        this._MSelect.show(options);
    }
}