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


@Component({
    selector: "edit-user-mdoal",
    templateUrl: "edit-user.modal.tns.html",
})
export class EditUserModalComponent {
    _user: User;
    @ViewChild('dataform', { static: false }) dataform: RadDataFormComponent;
    dataFormConfig = {
        "isReadOnly": false,
        "commitMode": "Immediate",
        "validationMode": "Immediate",
        "propertyAnnotations":
            [
                {
                    "name": "name",
                    "displayName": "Benutzername",
                    "index": 0,
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "email",
                    "displayName": "Email-Adresse",
                    "index": 1,
                    "editor": "Email",
                    "validators": [
                        { "name": "NonEmpty" },
                        { "name": "EmailValidator" }
                    ]
                },
                {
                    "name": "passwordOld",
                    "displayName": "Altes Passwort (immer angeben)",
                    "index": 2,
                    "editor": "Password",
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "password1",
                    "displayName": "Neues Passwort",
                    "index": 3,
                    "editor": "Password",
                    "validators": [

                    ]
                },
                {
                    "name": "password2",
                    "displayName": "Neues Passwort wiederholen",
                    "index": 4,
                    "editor": "Password",
                    "validators": [

                    ]
                }
            ]
    };

    public constructor(private params: ModalDialogParams) {
        this._user = new User(params.context.currentUser.username, params.context.currentUser.email, "", "", "");

    }

    public close() {
        this.dataform.dataForm.validateAll()
            .then(result => {
                if (result == true) {
                    console.log("closing");
                    this.params.closeCallback(this._user);
                    console.log("closed");
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


    ngOnInit() {

    }

    get user(): User {
        return this._user;
    }

    goBack() {
        this.params.closeCallback(null);
    }
}