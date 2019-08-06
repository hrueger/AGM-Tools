import { Component, OnInit, ViewContainerRef, ViewChild, NgZone } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { Project } from "../../_models/project.model";
import { User } from "../../_models/user.model";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";

import {
    CFAlertDialog,
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertStyle
} from 'nativescript-cfalert-dialog';
import { MultiSelect, MSOption, AShowType } from "nativescript-multi-select";
import { AlertService } from "../../_services/alert.service";
import { NewProjectModalComponent } from "../_modals/new-project.modal.tns";
import { ListViewEventData } from "nativescript-ui-listview";
import { View } from "tns-core-modules/ui/core/view/view";
import { RadListViewComponent } from "nativescript-ui-listview/angular/listview-directives";

@Component({
    selector: "app-projects",
    templateUrl: "./projects.component.html",
    styleUrls: ["./projects.component.scss"]
})
export class ProjectsComponent implements OnInit {
    projects: Project[] = [];
    allusers = [];

    private _MSelect: MultiSelect;
    public membersToAdd: Array<any> = [];
    @ViewChild("projectsListView", { read: RadListViewComponent, static: false }) projectsListView: RadListViewComponent;
    constructor(private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private remoteService: RemoteService,
        private alertService: AlertService,
        private zone: NgZone

    ) { this._MSelect = new MultiSelect(); }

    ngOnInit() {
        this.remoteService.get("projectsGetProjects").subscribe(data => {
            this.projects = data;
        });
        this.remoteService.get("usersGetUsers").subscribe(data => {
            this.allusers = data;
        });

    }
    openNewModal(content) {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(NewProjectModalComponent, options).then(newProject => {
            if (newProject) {
                this.remoteService
                    .getNoCache("projectsNewProject", {
                        name: newProject.name,
                        description: newProject.description,
                        members: newProject.members
                    })
                    .subscribe(data => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Projekt erfolgreich erstellt!"
                            );
                            this.remoteService.get("projectsGetProjects").subscribe(data => {
                                this.projects = data;
                            });
                        }
                    });
            }
        });
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args.object;
        const leftItem = swipeView.getViewById<View>('add-view');
        const rightItem = swipeView.getViewById<View>('delete-view');
        swipeLimits.left = leftItem.getMeasuredWidth();
        swipeLimits.right = rightItem.getMeasuredWidth();
        swipeLimits.threshold = leftItem.getMeasuredWidth() / 2;
    }

    public onLeftSwipeClick(args) {
        var id = args.object.bindingContext.id;
        var alreadyMembers = args.object.bindingContext.members;
        //console.log(alreadyMembers);
        let usersToPick = [];
        this.allusers.forEach(user => {
            if (!alreadyMembers.includes(user.username)) {
                usersToPick.push({ id: user.id, name: user.username });
                //console.log("added ", user);
            } else {
                //console.log("rejected ", user);
            }
        });
        const options: MSOption = {
            title: "Mitglieder hinzufügen",
            selectedItems: usersToPick,
            items: usersToPick,
            bindValue: 'id',
            displayLabel: 'name',
            confirmButtonText: "Ok",
            cancelButtonText: "Abbrechen",
            onConfirm: selectedItems => {
                this.zone.run(() => {
                    this.membersToAdd = selectedItems;
                    if (this.membersToAdd.length) {
                        this.remoteService.getNoCache("projectsAddMembers", {
                            project: id,
                            members: this.membersToAdd
                        }).subscribe(data => {
                            this.alertService.success(
                                "Mitglieder erfolgreich hinzugefügt!"
                            );
                            this.remoteService.get("projectsGetProjects").subscribe(data => {
                                this.projects = data;
                            });
                        })
                    }
                });
            },
            onItemSelected: selectedItem => {
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

    public onRightSwipeClick(args) {
        var id = args.object.bindingContext.id;
        let cfalertDialog = new CFAlertDialog();
        const onNoPressed = response => {
            console.log("nein");
            this.projectsListView.listView.notifySwipeToExecuteFinished();
        };
        const onYesPressed = response => {
            console.log("ja");
            this.projectsListView.listView.notifySwipeToExecuteFinished();
            this.remoteService
                .getNoCache("projectsDeleteProject", {
                    id: id
                })
                .subscribe(data => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Projekt erfolgreich gelöscht"
                        );
                        this.remoteService.get("projectsGetProjects").subscribe(data => {
                            this.projects = data;
                        });
                    } else {
                        console.log(data);
                    }
                });

        };
        cfalertDialog.show({
            dialogStyle: CFAlertStyle.BOTTOM_SHEET,
            title: "Bestätigung",
            message: "Soll dieses Projekt wirklich gelöscht werden?",
            buttons: [
                {
                    text: "Ja",
                    buttonStyle: CFAlertActionStyle.POSITIVE,
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    onClick: onYesPressed


                },
                {
                    text: "Nein",
                    buttonStyle: CFAlertActionStyle.NEGATIVE,
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    onClick: onNoPressed
                }]
        });
    }
}
