import { Component, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { FastTranslateService } from "../../_services/fast-translate.service";

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
    public dataFormConfig: any;

    public constructor(private params: ModalDialogParams, private fts: FastTranslateService) {
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

    public async onPropertyValidate(args) {
        let validationResult = true;
        if (args.propertyName === "password2") {
            const dataForm = args.object;
            const password1 = dataForm.getPropertyByName("password1");
            const password2 = args.entityProperty;
            if (password1.valueCandidate !== password2.valueCandidate) {
                password2.errorMessage = await this.fts.t("errors.passwordsDontMatch");
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

    public async ngOnInit() {
        this.dataFormConfig = {
            commitMode: "Immediate",
            isReadOnly: false,
            propertyAnnotations:
            [
                {
                    displayName: await this.fts.t("general.username"),
                    index: 0,
                    name: "name",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: await this.fts.t("general.email"),
                    editor: "Email",
                    index: 1,
                    name: "email",
                    validators: [
                        { name: "NonEmpty" },
                        { name: "EmailValidator" },
                    ],
                },
                {
                    displayName: await this.fts.t("users.oldPasswordProvideAlways"),
                    editor: "Password",
                    index: 2,
                    name: "passwordOld",
                    validators: [
                        { name: "NonEmpty" },
                    ],
                },
                {
                    displayName: await this.fts.t("login.inputNewPassword"),
                    editor: "Password",
                    index: 3,
                    name: "password1",
                    validators: [],
                },
                {
                    displayName: await this.fts.t("login.repeatNewPassword"),
                    editor: "Password",
                    index: 4,
                    name: "password2",
                    validators: [],
                },
            ],
            validationMode: "Immediate",
        };
    }
}
