import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { connectionType, getConnectionType } from "tns-core-modules/connectivity";
import { Animation } from "tns-core-modules/ui/animation";
import { View } from "tns-core-modules/ui/core/view";
import { prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { AlertService } from "../../_services/alert.service";
import { AuthenticationService } from "../../_services/authentication.service";

@Component({
    selector: "app-login",
    styleUrls: ["./login.component.css"],
    templateUrl: "./login.component.html",
})
export class LoginComponent {
  public username: string = "";
  public password: string = "";
  public isAuthenticating = false;

  @ViewChild("initialContainer", { static: false }) public initialContainer: ElementRef;
  @ViewChild("mainContainer", { static: false }) public mainContainer: ElementRef;
  @ViewChild("logoContainer", { static: false }) public logoContainer: ElementRef;
  @ViewChild("formControls", { static: false }) public formControls: ElementRef;
  @ViewChild("passwordField", { static: false }) public passwordEl: ElementRef;

  constructor(private authService: AuthenticationService,
              private page: Page,
              private router: Router,
              private alertService: AlertService) {
  }

  public ngOnInit() {
    this.page.actionBarHidden = true;
  }


  public focusPassword() {
    this.passwordEl.nativeElement.focus();
  }

  public startBackgroundAnimation(background) {
    background.animate({
      duration: 10000,
      scale: { x: 1.0, y: 1.0 },
    });
  }

  public submit() {
    this.isAuthenticating = true;
    this.login();
  }

  public login() {
    if (getConnectionType() === connectionType.none) {
      alert("AGM-Tools benötigt eine Internetverbindung.");
      return;
    }

    this.authService.login(this.username, this.password).subscribe(
      (data) => {
          this.isAuthenticating = false;
          this.router.navigate(["/dashboard"]);
      },
      (error) => {
          this.isAuthenticating = false;
          this.alertService.error(
              error ||
              "Dein Account wurde leider nicht gefunden. Bitte überprüfe deinen Benutzernamen nochmals!",
          );
      },
  );
  }

  public forgotPassword() {
    prompt({
      cancelButtonText: "Cancel",
      defaultText: "",
      message: "Bitte gib deine Email-Adresse ein, um dein Passwort zurückzusetzen.",
      okButtonText: "Ok",
      title: "Passwort vergesssen",
    }).then((data) => {
      if (data.result) {
        this.authService.resetPassword(data.text.trim())
          .subscribe(() => {
            alert("Your password was successfully reset. Please check\
            your email for instructions on choosing a new password.");
          }, () => {
            alert("Unfortunately, an error occurred resetting your password.");
          });
      }
    });
  }

  public showMainContent() {
    const initialContainer =  this.initialContainer.nativeElement as View;
    const mainContainer =  this.mainContainer.nativeElement as View;
    const logoContainer =  this.logoContainer.nativeElement as View;
    const formControls =  this.formControls.nativeElement as View;
    const animations = [];

    // Fade out the initial content over one half second
    initialContainer.animate({
      duration: 500,
      opacity: 0,
    }).then(() => {
      // After the animation completes, hide the initial container and
      // show the main container and logo. The main container and logo will
      // not immediately appear because their opacity is set to 0 in CSS.
      initialContainer.style.visibility = "collapse";
      mainContainer.style.visibility = "visible";
      logoContainer.style.visibility = "visible";

      // Fade in the main container and logo over one half second.
      animations.push({ target: mainContainer, opacity: 1, duration: 500 });
      animations.push({ target: logoContainer, opacity: 1, duration: 500 });

      // Slide up the form controls and sign up container.
      animations.push({ target: formControls, translate: { x: 0, y: 0 }, opacity: 1, delay: 650, duration: 150 });

      // Kick off the animation queue
      new Animation(animations, false).play();
    });
  }
    /*isLoggingIn = true;
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
            this.alertService.info("Diese Funktion gibt's noch nicht ;-), bitte melde dich direkt bei Hannes!")
            if (data.result) {
                this.authService.resetPassword(data.text.trim())
                    .then(() => {
                        this.alert("Your password was successfully reset.
                        Please check your username for instructions on choosing a new password.");
                    }).catch(() => {
                        this.alert("Unfortunately, an error occurred resetting your password.");
                    });
            }
        });
    }

    focusPassword() {
        this.passwordField.nativeElement.focus();
    }
    focusConfirmPassword() {
        if (!this.isLoggingIn) {
            this.confirmPassword.nativeElement.focus();
        }
    }*/
}
