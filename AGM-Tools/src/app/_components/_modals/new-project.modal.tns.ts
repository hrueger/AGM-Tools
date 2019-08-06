import { Component, ViewChild, NgZone } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { RemoteService } from "../../_services/remote.service";
import { AlertService } from "../../_services/alert.service";
import { MultiSelect, MSOption, AShowType } from "nativescript-multi-select";

export class Project {
    name: string;
    description: string;
    members: Array<any>;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }
}


@Component({
    selector: "new-project-modal",
    templateUrl: "new-project.modal.tns.html",
})
export class NewProjectModalComponent {
    private project: Project;
    private _MSelect: MultiSelect;
    private users: Array<any> = [];
    public members: Array<any> = [];
    noMembersSelectedInvalidMessage: boolean = false;
    @ViewChild('dataform', { static: false }) dataform: RadDataFormComponent;
    dataFormConfig = {
        "isReadOnly": false,
        "commitMode": "Immediate",
        "validationMode": "Immediate",
        "propertyAnnotations":
            [
                {
                    "name": "title",
                    "displayName": "Titel",
                    "index": 0,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "description",
                    "displayName": "Beschreibung",
                    "index": 1,
                    "editor": "MultilineText",
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "location",
                    "displayName": "Ort",
                    "index": 2,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "isAllDay",
                    "displayName": "Ganztägig",
                    "index": 3,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "important",
                    "displayName": "Wichtiger Termin",
                    "index": 4,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                }
            ]
    };

    public constructor(private params: ModalDialogParams, private remoteService: RemoteService, private alertService: AlertService, private zone: NgZone) {
        this._MSelect = new MultiSelect();
        this.remoteService.get("usersGetUsers").subscribe(data => {
            data.forEach(user => {
                this.users.push({ name: user.username, id: user.id });
            });
        });
    }

    public openMembersSelectMenu(): void {
        const options: MSOption = {
            title: "Mitglieder auswählen",
            selectedItems: this.users,
            items: this.users,
            bindValue: 'id',
            displayLabel: 'name',
            confirmButtonText: "Ok",
            cancelButtonText: "Abbrechen",
            onConfirm: selectedItems => {
                this.zone.run(() => {
                    this.members = selectedItems;

                });
            },
            onItemSelected: selectedItem => {

                this.zone.run(() => {
                    this.noMembersSelectedInvalidMessage = false;
                });
            },
            onCancel: () => {
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


    public close() {
        this.dataform.dataForm.validateAll()
            .then(result => {
                if (result == true) {
                    if (this.members.length && this.members.length > 0) {
                        this.project.members = this.members;
                        this.params.closeCallback(this.project);
                    } else {
                        this.noMembersSelectedInvalidMessage = true;
                    }
                } else {
                    console.log("validation failed");
                }
            });
    }

    ngOnInit() {
        this.project = new Project("", "");

    }



    goBack() {
        this.params.closeCallback(null);
    }




}