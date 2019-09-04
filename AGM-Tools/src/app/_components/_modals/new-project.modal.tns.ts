import { Component, NgZone, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { AShowType, MSOption, MultiSelect } from "nativescript-multi-select";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { AlertService } from "../../_services/alert.service";
import { RemoteService } from "../../_services/remote.service";

export class Project {
    public name: string;
    public description: string;
    public members: any[];

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }
}

// tslint:disable-next-line: max-classes-per-file
@Component({
    selector: "new-project-modal",
    templateUrl: "new-project.modal.tns.html",
})
export class NewProjectModalComponent {
    public members: any[] = [];
    public noMembersSelectedInvalidMessage: boolean = false;
    @ViewChild("dataform", { static: false }) public dataform: RadDataFormComponent;
    public dataFormConfig = {
        commitMode: "Immediate",
        isReadOnly: false,
        propertyAnnotations:
            [
                {
                    displayName: "Titel",
                    index: 0,
                    name: "title",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Beschreibung",
                    editor: "MultilineText",
                    index: 1,
                    name: "description",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Ort",
                    index: 2,
                    name: "location",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Ganztägig",
                    index: 3,
                    name: "isAllDay",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Wichtiger Termin",
                    index: 4,
                    name: "important",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
            ],
        validationMode: "Immediate",
    };
    private project: Project;
    private multiSelect: MultiSelect;
    private users: any[] = [];

    public constructor(private params: ModalDialogParams, private remoteService: RemoteService, private zone: NgZone) {
        this.multiSelect = new MultiSelect();
        this.remoteService.get("usersGetUsers").subscribe((data) => {
            data.forEach((user) => {
                this.users.push({ name: user.username, id: user.id });
            });
        });
    }

    public openMembersSelectMenu(): void {
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
                // Cancel
            },
            onConfirm: (selectedItems) => {
                this.zone.run(() => {
                    this.members = selectedItems;

                });
            },
            onItemSelected: (selectedItem) => {

                this.zone.run(() => {
                    this.noMembersSelectedInvalidMessage = false;
                });
            },
            selectedItems: this.users,
            title: "Mitglieder auswählen",
        };

        this.multiSelect.show(options);
    }

    public close() {
        this.dataform.dataForm.validateAll()
            .then((result) => {
                if (result == true) {
                    if (this.members.length && this.members.length > 0) {
                        this.project.members = this.members;
                        this.params.closeCallback(this.project);
                    } else {
                        this.noMembersSelectedInvalidMessage = true;
                    }
                }
            });
    }

    public ngOnInit() {
        this.project = new Project("", "");

    }

    public goBack() {
        this.params.closeCallback(null);
    }

}
