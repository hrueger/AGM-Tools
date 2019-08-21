import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { User } from "../../_models/user.model";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements OnInit {
    public users: User[] = [];

    public newUserForm: FormGroup;
    public editUserForm: FormGroup;
    public name: string;
    public email: string;

    public password1: string;
    public password2: string;
    public invalidMessage: boolean = false;
    public editUserName: any;
    public editUserEmail: any;
    public editUserPasswordOld: any;
    public editUserPassword1: any;
    public editUserPassword2: any;

    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private authService: AuthenticationService,
        private NavbarService: NavbarService,
    ) { }

    public ngOnInit() {
        this.NavbarService.setHeadline("Benutzer");
        this.remoteService.get("usersGetUsers").subscribe((data) => {
            this.users = data;
        });
        this.newUserForm = this.fb.group({
            name: [this.name, [Validators.required]],
            email: [this.email, [Validators.required]],
            password1: [this.password1, [Validators.required]],
            password2: [this.password2, [Validators.required]],
        });
        this.editUserForm = this.fb.group({
            editUserName: [this.editUserName, [Validators.required]],
            editUserEmail: [this.editUserEmail, [Validators.required]],
            editUserPasswordOld: [
                this.editUserPasswordOld,
                [Validators.required],
            ],
            editUserPassword1: [this.editUserPassword1, []],
            editUserPassword2: [this.editUserPassword2, []],
        });

        this.editUserForm
            .get("editUserName")
            .setValue(
                this.authService.currentUserValue.firstName +
                " " +
                this.authService.currentUserValue.lastName,
            );
        this.editUserForm
            .get("editUserEmail")
            .setValue(this.authService.currentUserValue.email);
    }

    public openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("usersNewUser", {
                            username: this.newUserForm.get("name").value,
                            email: this.newUserForm.get("email").value,
                            pw: this.newUserForm.get("password1").value,
                            pw2: this.newUserForm.get("password2").value,
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Benutzer erfolgreich erstellt",
                                );
                                this.remoteService
                                    .get("usersGetUsers")
                                    .subscribe((data) => {
                                        this.users = data;
                                    });
                            }
                        });
                },
                (reason) => { },
            );
    }
    public openEditModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.invalidMessage = false;
                    const pwnew1val = "";
                    /*if (this.editUserForm.get("editUserPassword1")) {
                        pwnew1val = this.editUserForm.get("editUserPassword1")
                            .value;
                    } */
                    const pwnew2val = "";
                    /*if (this.editUserForm.get("editUserPassword1")) {
                        pwnew2val = this.editUserForm.get("editUserPassword2")
                            .value;
                    }*/
                    this.remoteService
                        .getNoCache("usersEditCurrentUser", {
                            "id": this.authService.currentUserValue.id,
                            "username": this.editUserForm.get("editUserName")
                                .value,
                            "email": this.editUserForm.get("editUserEmail").value,
                            "pw-old": this.editUserForm.get(
                                "editUserPasswordOld",
                            ).value,
                            "pw-new": pwnew1val,
                            "pw-new2": pwnew2val,
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Ihr Benutzer erfolgreich geändert",
                                );
                                this.remoteService
                                    .get("usersGetUsers")
                                    .subscribe((data) => {
                                        this.users = data;
                                    });
                            }
                        });
                },
                (reason) => { },
            );
    }

    public deleteUser(user: User) {
        if (confirm("Möchten Sie diesen Nutzer wirklich löschen?") == true) {
            this.remoteService
                .getNoCache("usersDeleteUser", {
                    id: user.id,
                })
                .subscribe((data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Benutzer erfolgreich gelöscht",
                        );
                        this.remoteService
                            .get("usersGetUsers")
                            .subscribe((data) => {
                                this.users = data;
                            });
                    }
                });
        }
    }
}
