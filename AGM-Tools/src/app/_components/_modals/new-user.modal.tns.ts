import { Component, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";

export class User {
    public name: string;
    public email: string;
    public password: string;
    public password2: string;


    constructor(name: string, email: string, password: string, password2: string) {
        this.name = name;
        this.password = password;
        this.password2 = password2;
        this.email = email;
    }
}


@Component({
    selector: "new-user-mdoal",
    templateUrl: "new-user.modal.tns.html",
})
export class NewUserModalComponent {
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
                    "displayName": "Name des Benutzers",
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
                    "name": "password",
                    "displayName": "Passwort",
                    "index": 2,
                    "editor": "Password",
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                },
                {
                    "name": "password2",
                    "displayName": "Passwort wiederholen",
                    "index": 3,
                    "editor": "Password",
                    "validators": [
                        { "name": "NonEmpty" }
                    ]
                }
            ]
    };

    public constructor(private params: ModalDialogParams) {
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
            const password1 = dataForm.getPropertyByName("password");
            const password2 = args.entityProperty;
            if (password1.valueCandidate !== password2.valueCandidate) {
                password2.errorMessage = "Passwords do not match.";
                validationResult = false;
            }
        }
        args.returnValue = validationResult;
    }


    ngOnInit() {
        this._user = new User("", "", "", "");
    }

    get user(): User {
        return this._user;
    }

    goBack() {
        this.params.closeCallback(null);
    }
}