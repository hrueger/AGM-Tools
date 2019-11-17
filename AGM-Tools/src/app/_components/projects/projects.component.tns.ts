import { Component, NgZone, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { Project } from "../../_models/project.model";
import { User } from "../../_models/user.model";
import { RemoteService } from "../../_services/remote.service";

import {
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertDialog,
    CFAlertStyle,
} from "nativescript-cfalert-dialog";
import { AShowType, MSOption, MultiSelect } from "nativescript-multi-select";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular/listview-directives";
import { View } from "tns-core-modules/ui/core/view/view";
import { AlertService } from "../../_services/alert.service";
import { NewProjectModalComponent } from "../_modals/new-project.modal.tns";

@Component({
    selector: "app-projects",
    styleUrls: ["./projects.component.scss"],
    templateUrl: "./projects.component.html",
})
export class ProjectsComponent implements OnInit {
    public projects: Project[] = [];
    public allusers = [];
    public membersToAdd: any[] = [];
    @ViewChild("projectsListView", { read: RadListViewComponent, static: false })
    public projectsListView: RadListViewComponent;

    private multiSelect: MultiSelect;
    constructor(private modal: ModalDialogService,
                private vcRef: ViewContainerRef,
                private remoteService: RemoteService,
                private alertService: AlertService,
                private zone: NgZone,

    ) { this.multiSelect = new MultiSelect(); }

    public ngOnInit() {
        this.remoteService.get("post", "projectsGetProjects").subscribe((data) => {
            this.projects = data;
        });
        this.remoteService.get("post", "usersGetUsers").subscribe((data) => {
            this.allusers = data;
        });

    }
    public openNewModal(content) {
        const options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef,
        };
        this.modal.showModal(NewProjectModalComponent, options).then((newProject) => {
            if (newProject) {
                this.remoteService
                    .getNoCache("post", "projectsNewProject", {
                        description: newProject.description,
                        members: newProject.members,
                        name: newProject.name,
                    })
                    .subscribe((data) => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Projekt erfolgreich erstellt!",
                            );
                            this.remoteService.get("post", "projectsGetProjects").subscribe((res) => {
                                this.projects = res;
                            });
                        }
                    });
            }
        });
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args.object;
        const leftItem = swipeView.getViewById<View>("add-view");
        const rightItem = swipeView.getViewById<View>("delete-view");
        swipeLimits.left = leftItem.getMeasuredWidth();
        swipeLimits.right = rightItem.getMeasuredWidth();
        swipeLimits.threshold = leftItem.getMeasuredWidth() / 2;
    }

    public onLeftSwipeClick(args) {
        const id = args.object.bindingContext.id;
        const alreadyMembers = args.object.bindingContext.members;
        // console.log(alreadyMembers);
        const usersToPick = [];
        this.allusers.forEach((user) => {
            if (!alreadyMembers.includes(user.username)) {
                usersToPick.push({ id: user.id, name: user.username });
                // console.log("added ", user);
            } else {
                // console.log("rejected ", user);
            }
        });
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
            items: usersToPick,
            onCancel: () => { /* Cancel */ },
            onConfirm: (selectedItems) => {
                this.zone.run(() => {
                    this.membersToAdd = selectedItems;
                    if (this.membersToAdd.length) {
                        this.remoteService.getNoCache("post", "projectsAddMembers", {
                            members: this.membersToAdd,
                            project: id,
                        }).subscribe((data) => {
                            this.alertService.success(
                                "Mitglieder erfolgreich hinzugefügt!",
                            );
                            this.remoteService.get("post", "projectsGetProjects").subscribe((res) => {
                                this.projects = res;
                            });
                        });
                    }
                });
            },
            onItemSelected: (selectedItem) => { /* selected */ },
            selectedItems: usersToPick,
            title: "Mitglieder hinzufügen",
        };

        this.multiSelect.show(options);
    }

    public onRightSwipeClick(args) {
        const id = args.object.bindingContext.id;
        const cfalertDialog = new CFAlertDialog();
        const onNoPressed = (response) => {
            this.projectsListView.listView.notifySwipeToExecuteFinished();
        };
        const onYesPressed = (response) => {
            this.projectsListView.listView.notifySwipeToExecuteFinished();
            this.remoteService
                .getNoCache("post", "projectsDeleteProject", {
                    id,
                })
                .subscribe((data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Projekt erfolgreich gelöscht",
                        );
                        this.remoteService.get("post", "projectsGetProjects").subscribe((res) => {
                            this.projects = res;
                        });
                    }
                });

        };
        cfalertDialog.show({
            buttons: [
                {
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    buttonStyle: CFAlertActionStyle.POSITIVE,
                    onClick: onYesPressed,
                    text: "Ja",

                },
                {
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    buttonStyle: CFAlertActionStyle.NEGATIVE,
                    onClick: onNoPressed,
                    text: "Nein",
                }],
            dialogStyle: CFAlertStyle.BOTTOM_SHEET,
            message: "Soll dieses Projekt wirklich gelöscht werden?",
            title: "Bestätigung",
        });
    }
}
