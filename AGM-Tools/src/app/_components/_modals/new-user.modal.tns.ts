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

// tslint:disable-next-line: max-classes-per-file
@Component({
    selector: "new-user-mdoal",
    templateUrl: "new-user.modal.tns.html",
})
export class NewUserModalComponent {
    public puser: User;
    @ViewChild("dataform", { static: false }) public dataform: RadDataFormComponent;
    public dataFormConfig = {
        commitMode: "Immediate",
        isReadOnly: false,
        propertyAnnotations:
            [
                {
                    displayName: "Name des Benutzers",
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
                    displayName: "Passwort",
                    editor: "Password",
                    index: 2,
                    name: "password",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: "Passwort wiederholen",
                    editor: "Password",
                    index: 3,
                    name: "password2",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
            ],
            validationMode: "Immediate",
    };

    public constructor(private params: ModalDialogParams) {
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
            const password1 = dataForm.getPropertyByName("password");
            const password2 = args.entityProperty;
            if (password1.valueCandidate !== password2.valueCandidate) {
                password2.errorMessage = "Die Passwörter stimmen nicht überein.";
                validationResult = false;
            }
        }
        args.returnValue = validationResult;
    }

    public ngOnInit() {
        this.puser = new User("", "", "", "");
    }

    get user(): User {
        return this.puser;
    }

    public goBack() {
        this.params.closeCallback(null);
    }
}
