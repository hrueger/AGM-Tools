import { Component, ElementRef, ViewChild } from "@angular/core";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";

import { AuthenticationService } from "../../_services/authentication.service";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-login",

    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"]
})
export class LoginComponent {
    isLoggingIn = true;
    user: any;
    processing = false;
    username: string;
    password: string;
    @ViewChild("passwordField", { static: false }) passwordField: ElementRef;
    @ViewChild("confirmPassword", { static: false }) confirmPassword: ElementRef;

    constructor(
        private page: Page,
        private authService: AuthenticationService,
        private routerExtensions: RouterExtensions,
        private alertService: AlertService
    ) {
        this.page.actionBarHidden = true;

        this.username = "";
        this.password = "";
    }

    toggleForm() {
        this.isLoggingIn = !this.isLoggingIn;
    }

    submit() {
        if (!this.username || !this.password) {
            this.alertService.error("Bitte gib ein Passwort und einen Benutzernamen an!");
            return;
        }

        this.processing = true;
        if (this.isLoggingIn) {
            this.login();
        } else {

        }
    }

    login() {
        this.authService.login(this.username, this.password).subscribe(
            data => {
                this.processing = false;
                this.routerExtensions.navigate(["/dashboard"], {
                    clearHistory: true
                });
            },
            error => {
                this.processing = false;
                this.alertService.error(
                    error ||
                    "Dein Account wurde leider nicht gefunden. Bitte überprüfe deinen Benutzernamen nochmals!"
                );
            }
        );
    }


    forgotPassword() {
        prompt({
            title: "Passwort zurücksetzen",
            message:
                "Gib deine Email-Adresse ein, sodass wir dir ein neues Passwort zuschicken können.",
            inputType: "email",
            defaultText: "",
            okButtonText: "Weiter",
            cancelButtonText: "Zurück"
        }).then(data => {
            /*if (data.result) {
                this.authService.resetPassword(data.text.trim())
                    .then(() => {
                        this.alert("Your password was successfully reset. Please check your username for instructions on choosing a new password.");
                    }).catch(() => {
                        this.alert("Unfortunately, an error occurred resetting your password.");
                    });
            }*/
        });
    }

    focusPassword() {
        this.passwordField.nativeElement.focus();
    }
    focusConfirmPassword() {
        if (!this.isLoggingIn) {
            this.confirmPassword.nativeElement.focus();
        }
    }
}
