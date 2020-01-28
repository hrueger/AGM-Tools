import { Component, NgZone, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { AShowType, MSOption, MultiSelect } from "nativescript-multi-select";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { AlertService } from "../../_services/alert.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
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
    public dataFormConfig: any;
    private project: Project;
    private multiSelect: MultiSelect;
    private users: any[] = [];

    public constructor(
            private params: ModalDialogParams,
            private remoteService: RemoteService,
            private zone: NgZone,
            private fts: FastTranslateService,
        ) {
        this.multiSelect = new MultiSelect();
        this.remoteService.get("get", "users").subscribe((data) => {
            this.users = [];
            data.forEach((user) => {
                this.users.push({ name: user.username, id: user.id });
            });
        });
    }

    public async openMembersSelectMenu(): Promise<void> {
        const options: MSOption = {
            android: {
                cancelButtonTextColor: "#252323",
                confirmButtonTextColor: "#70798C",
                titleSize: 25,
            },
            bindValue: "id",
            cancelButtonText: await this.fts.t("general.cancel"),
            confirmButtonText: await this.fts.t("general.select"),
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
            title: await this.fts.t("projects.chooseMembers"),
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

    public async ngOnInit() {
        this.project = new Project("", "");
        this.dataFormConfig = {
            commitMode: "Immediate",
            isReadOnly: false,
            propertyAnnotations:
                [
                    {
                        displayName: await this.fts.t("general.title"),
                        index: 0,
                        name: "title",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                    {
                        displayName: await this.fts.t("general.description"),
                        editor: "MultilineText",
                        index: 1,
                        name: "description",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                ],
            validationMode: "Immediate",
        };

    }

    public goBack() {
        this.params.closeCallback(null);
    }

}
