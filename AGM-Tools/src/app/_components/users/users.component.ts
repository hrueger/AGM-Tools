import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { User } from "../../_models/user.model";
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"]
})
export class UsersComponent implements OnInit {
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
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private authService: AuthenticationService
    ) {}

    ngOnInit() {
        this.remoteService.get("usersGetUsers").subscribe(data => {
            this.users = data;
        });
        this.newUserForm = this.fb.group({
            name: [this.name, [Validators.required]],
            email: [this.email, [Validators.required]],
            password1: [this.password1, [Validators.required]],
            password2: [this.password2, [Validators.required]]
        });
        this.editUserForm = this.fb.group({
            editUserName: [this.editUserName, [Validators.required]],
            editUserEmail: [this.editUserEmail, [Validators.required]],
            editUserPasswordOld: [
                this.editUserPasswordOld,
                [Validators.required]
            ],
            editUserPassword1: [this.editUserPassword1, []],
            editUserPassword2: [this.editUserPassword2, []]
        });

        this.editUserForm
            .get("editUserName")
            .setValue(
                this.authService.currentUserValue.firstName +
                    " " +
                    this.authService.currentUserValue.lastName
            );
        this.editUserForm
            .get("editUserEmail")
            .setValue(this.authService.currentUserValue.email);
    }
    onSetupItemView(args: SetupItemViewArgs) {
        args.view.context.third = args.index % 3 === 0;
        args.view.context.header = (args.index + 1) % this.users.length === 1;
        args.view.context.footer = args.index + 1 === this.users.length;
    }
    openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                result => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("usersNewUser", {
                            username: this.newUserForm.get("name").value,
                            email: this.newUserForm.get("email").value,
                            pw: this.newUserForm.get("password1").value,
                            pw2: this.newUserForm.get("password2").value
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
                },
                reason => {}
            );
    }
    openEditModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                result => {
                    this.invalidMessage = false;
                    var pwnew1val = "";
                    /*if (this.editUserForm.get("editUserPassword1")) {
                        pwnew1val = this.editUserForm.get("editUserPassword1")
                            .value;
                    } */
                    var pwnew2val = "";
                    /*if (this.editUserForm.get("editUserPassword1")) {
                        pwnew2val = this.editUserForm.get("editUserPassword2")
                            .value;
                    }*/
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
                reason => {}
            );
    }

    deleteUser(user: User) {
        if (confirm("Möchten Sie diesen Nutzer wirklich löschen?") == true) {
            this.remoteService
                .getNoCache("usersDeleteUser", {
                    id: user.id
                })
                .subscribe(data => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Benutzer erfolgreich gelöscht"
                        );
                        this.remoteService
                            .get("usersGetUsers")
                            .subscribe(data => {
                                this.users = data;
                            });
                    }
                });
        }
    }
}
