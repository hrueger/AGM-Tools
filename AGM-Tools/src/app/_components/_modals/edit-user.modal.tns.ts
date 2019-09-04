import { Component, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";

export class User {
    public name: string;
    public email: string;
    public passwordOld: string;
    public password1: string;
    public password2: string;

    constructor(name: string, email: string, passwordOld: string, password1: string, password2: string) {
        this.name = name;
        this.passwordOld = passwordOld;
        this.password1 = password1;
        this.password2 = password2;
        this.email = email;
    }
}

// tslint:disable-next-line: max-classes-per-file
@Component({
    selector: "edit-user-mdoal",
    templateUrl: "edit-user.modal.tns.html",
})
export class EditUserModalComponent {
    public puser: User;
    @ViewChild("dataform", { static: false }) public dataform: RadDataFormComponent;
    public dataFormConfig = {
        commitMode: "Immediate",
        isReadOnly: false,
        propertyAnnotations:
        [
            {
                displayName: "Benutzername",
                index: 0,
                name: "name",
                validators: [
                    { name: "NonEmpty" },
                ],
            },
            {
                displayName: "Email-Adresse",
                editor: "Email",
                index: 1,
                name: "email",
                validators: [
                    { name: "NonEmpty" },
                    { name: "EmailValidator" },
                ],
            },
            {
                displayName: "Altes Passwort (immer angeben)",
                editor: "Password",
                index: 2,
                name: "passwordOld",
                validators: [
                    { name: "NonEmpty" },
                ],
            },
            {
                displayName: "Neues Passwort",
                editor: "Password",
                index: 3,
                name: "password1",
                validators: [

                ],
            },
            {
                displayName: "Neues Passwort wiederholen",
                editor: "Password",
                index: 4,
                name: "password2",
                validators: [

                ],
            },
        ],
        validationMode: "Immediate",
    };

    public constructor(private params: ModalDialogParams) {
        this.puser = new User(params.context.currentUser.username, params.context.currentUser.email, "", "", "");

    }

    public close() {
        this.dataform.dataForm.validateAll()
            .then((result) => {
                if (result == true) {
                    this.params.closeCallback(this.puser);
                }
            });
    }

    public onPropertyValidate(args) {
        let validationResult = true;
        if (args.propertyName === "password2") {
            const dataForm = args.object;
            const password1 = dataForm.getPropertyByName("password1");
            const password2 = args.entityProperty;
            if (password1.valueCandidate !== password2.valueCandidate) {
                password2.errorMessage = "Die Passwörter stimmen nicht überein.";
                validationResult = false;
            }
        }
        args.returnValue = validationResult;
    }

    get user(): User {
        return this.puser;
    }

    public goBack() {
        this.params.closeCallback(null);
    }
}
