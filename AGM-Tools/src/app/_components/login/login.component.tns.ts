import { Component, ElementRef, ViewChild } from "@angular/core";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";

import { AuthenticationService } from "../../_services/authentication.service";

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
    @ViewChild("passwordField") passwordField: ElementRef;
    @ViewChild("confirmPassword") confirmPassword: ElementRef;

    constructor(
        private page: Page,
        private authService: AuthenticationService,
        private routerExtensions: RouterExtensions
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
            this.alert("Bitte gib ein Passwort und einen Benutzernamen an!");
            return;
        }

        this.processing = true;
        if (this.isLoggingIn) {
            this.login();
        } else {
            this.register();
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
                console.log(error);
                this.processing = false;
                this.alert(
                    error.error.message ||
                        "Dein Account wurde leider nicht gefunden. Bitte überprüfe deinen Benutzernamen nochmals!"
                );
            }
        );
    }

    register() {
        /*if (this.user.password != this.user.confirmPassword) {
            this.alert("Your passwords do not match.");
            return;
        }
        this.authService.register(this.user)
            .then(() => {
                this.processing = false;
                this.alert("Your account was successfully created.");
                this.isLoggingIn = true;
            })
            .catch(() => {
                this.processing = false;
                this.alert("Unfortunately we were unable to create your account.");
            });*/
    }

    forgotPassword() {
        prompt({
            title: "Passwort zurücksetzen",
            message:
                "Gib deine username-Adresse ein, sodass wir dir ein neues Passwort zuschicken können.",
            inputType: "username",
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

    alert(message: string) {
        return alert({
            title: "AGM-Tools",
            okButtonText: "OK",
            message: message
        });
    }
}
