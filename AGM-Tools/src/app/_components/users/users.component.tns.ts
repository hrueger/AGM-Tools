import {
    Component, OnInit, ViewChild, ViewContainerRef,
} from "@angular/core";
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { ModalDialogOptions, ModalDialogService } from "nativescript-angular/directives/dialogs";
import {
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertDialog,
    CFAlertStyle,
} from "nativescript-cfalert-dialog";
import { SwipeActionsEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import * as app from "tns-core-modules/application";
import { View } from "tns-core-modules/ui/core/view/view";
import { User } from "../../_models/user.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { RemoteService } from "../../_services/remote.service";
import { EditUserModalComponent } from "../_modals/edit-user.modal.tns";
import { NewUserModalComponent } from "../_modals/new-user.modal.tns";

@Component({
    selector: "app-users",
    styleUrls: ["./users.component.scss"],
    templateUrl: "./users.component.html",
})
export class UsersComponent implements OnInit {
    @ViewChild("usersListView", { read: RadListViewComponent, static: false })
    public usersListView: RadListViewComponent;
    public users: User[] = [];

    constructor(
        private remoteService: RemoteService,
        private alertService: AlertService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private authService: AuthenticationService,
    ) { }

    public ngOnInit() {
        this.remoteService.get("get", "users").subscribe((data) => {
            this.users = data;
        });
    }
    public onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.users.length === 1;
        args.view.context.footer = args.index + 1 === this.users.length;
    }

    public openNewModal() {
        const options: ModalDialogOptions = {
            animated: true,
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef,
        };
        this.modal.showModal(NewUserModalComponent, options).then((newUser) => {
            if (newUser) {
                this.remoteService
                    .getNoCache("post", "users", {
                        email: newUser.email,
                        pw: newUser.password,
                        pw2: newUser.password2,
                        username: newUser.name,
                    })
                    .subscribe((data) => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Benutzer erfolgreich erstellt",
                            );
                            this.remoteService
                                .get("get", "users")
                                .subscribe((res) => {
                                    this.users = res;
                                });
                        }
                    });
            }
        });
    }

    public onDrawerButtonTap(): void {
        const sideDrawer = app.getRootView() as any;
        sideDrawer.showDrawer();
    }

    public openEditModal() {
        const currentUser = this.authService.currentUserValue;
        const options = {
            animated: true,
            context: { currentUser },
            fullscreen: true,
            viewContainerRef: this.vcRef,
        };
        this.modal.showModal(EditUserModalComponent, options).then((newUser) => {
            if (newUser) {
                this.remoteService
                    .getNoCache("post", "users/editCurrent", {
                        email: newUser.email,
                        id: this.authService.currentUserValue.id,
                        "pw-new": newUser.password1,
                        "pw-new2": newUser.password2,
                        "pw-old": newUser.passwordOld,
                        username: newUser.name,
                    })
                    .subscribe((data) => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Eigene Daten erfolgreich geändert!",
                            );
                            this.remoteService
                                .get("get", "users")
                                .subscribe((res) => {
                                    this.users = res;
                                });
                        }
                    });
            }
        });
    }

    public onSwipeCellStarted(args: SwipeActionsEventData) {
        const { swipeLimits } = args.data;
        const swipeView = args.object;
        // @ts-ignore
        const rightItem = swipeView.getViewById<View>("delete-view");
        swipeLimits.right = rightItem.getMeasuredWidth();
    }

    public onRightSwipeClick(args) {
        const uid = args.object.bindingContext.id;
        const cfalertDialog = new CFAlertDialog();
        const onNoPressed = () => {
            this.usersListView.listView.notifySwipeToExecuteFinished();
        };
        const onYesPressed = () => {
            this.usersListView.listView.notifySwipeToExecuteFinished();
            this.remoteService
                .getNoCache("post", "usersDeleteUser", {
                    id: uid,
                })
                .subscribe((data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Benutzer erfolgreich gelöscht",
                        );
                        this.remoteService
                            .get("post", "usersGetUsers")
                            .subscribe((res) => {
                                this.users = res;
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
            message: "Soll dieser Benutzer wirklich gelöscht werden?",
            title: "Bestätigung",
        });
    }

    /*
     openEditModal(content) {
         this.modalService
             .open(content, { ariaLabelledBy: "modal-basic-title" })
             .result.then(
                 result => {
                     this.invalidMessage = false;
                     var pwnew1val = "";

                     var pwnew2val = "";

 this.remoteService
     .getNoCache("usersEditCurrentUser", {
         id: this.authService.currentUserValue.id,
         username: this.editUserForm.get("editUserName")
             .value,
         email: this.editUserForm.get("editUserEmail").value,
         "pw-old": this.editUserForm.get(
             "editUserPasswordOld"
         ).value,
         "pw-new": pwnew1val,
         "pw-new2": pwnew2val
     })
     .subscribe(data => {
         if (data && data.status == true) {
             this.alertService.success(
                 "Ihr Benutzer erfolgreich geändert"
             );
             this.remoteService
                 .get("usersGetUsers")
                 .subscribe(data => {
                     this.users = data;
                 });
         }
     });
                 },
 reason => { }
             );
     }

 deleteUser(user: User) {

 } */
}
