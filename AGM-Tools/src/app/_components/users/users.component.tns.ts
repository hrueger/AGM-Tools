import { Component, OnInit, ViewContainerRef, ViewChild } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { User } from "../../_models/user.model";
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertService } from "../../_services/alert.service";
import { NavbarService } from "../../_services/navbar.service";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { NewUserModalComponent } from "../_modals/new-user.modal.tns";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { ListViewEventData } from "nativescript-ui-listview";
import {
    CFAlertDialog,
    DialogOptions,
    CFAlertGravity,
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertStyle
} from 'nativescript-cfalert-dialog';
import { View } from "tns-core-modules/ui/core/view/view";

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"]
})
export class UsersComponent implements OnInit {
    @ViewChild("usersListView", { read: RadListViewComponent, static: false }) usersListView: RadListViewComponent;
    users: User[] = [];

    newUserForm: FormGroup;
    editUserForm: FormGroup;
    name: string;
    email: string;

    password1: string;
    password2: string;
    invalidMessage: boolean = false;
    editUserName: any;
    editUserEmail: any;
    editUserPasswordOld: any;
    editUserPassword1: any;
    editUserPassword2: any;

    constructor(
        private remoteService: RemoteService,
        private alertService: AlertService,
        private NavbarService: NavbarService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef
    ) { }

    ngOnInit() {
        this.NavbarService.setHeadline("Benutzer");
        this.remoteService.get("usersGetUsers").subscribe(data => {
            this.users = data;
        });
    }
    onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.users.length === 1;
        args.view.context.footer = args.index + 1 === this.users.length;
    }



    public openNewModal() {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(NewUserModalComponent, options).then(newUser => {
            if (newUser) {
                this.remoteService
                    .getNoCache("usersNewUser", {
                        username: newUser.name,
                        email: newUser.email,
                        pw: newUser.password,
                        pw2: newUser.password2
                    })
                    .subscribe(data => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Benutzer erfolgreich erstellt"
                            );
                            this.remoteService
                                .get("usersGetUsers")
                                .subscribe(data => {
                                    this.users = data;
                                });
                        }
                    });
            } else {
                this.alertService.warning("wurde abgebrochen");
            }

        });
    }


    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args['object'];
        const rightItem = swipeView.getViewById<View>('delete-view');
        swipeLimits.right = rightItem.getMeasuredWidth();
    }


    public onRightSwipeClick(args) {
        var uid = args.object.bindingContext.id;
        let cfalertDialog = new CFAlertDialog();
        const onNoPressed = response => {
            console.log("nein");
            this.usersListView.listView.notifySwipeToExecuteFinished();
        };
        const onYesPressed = response => {
            console.log("ja");
            this.usersListView.listView.notifySwipeToExecuteFinished();
            this.remoteService
                .getNoCache("usersDeleteUser", {
                    id: uid
                })
                .subscribe(data => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Benutzer erfolgreich gelöscht"
                        );
                        //this.users.splice(this.users.indexOf(args.object.bindingContext), 1);
                    } else {
                        console.log(data);
                    }
                });

        };
        cfalertDialog.show({
            dialogStyle: CFAlertStyle.BOTTOM_SHEET,
            title: "Bestätigung",
            message: "Soll dieser Benutzer wirklich gelöscht werden?",
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
     
 }*/
}
