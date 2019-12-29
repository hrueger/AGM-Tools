import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import * as appversion from "nativescript-appversion";
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
  public versionLabelText: string = "";

  @ViewChild("initialContainer", { static: false }) public initialContainer: ElementRef;
  @ViewChild("mainContainer", { static: false }) public mainContainer: ElementRef;
  @ViewChild("logoContainer", { static: false }) public logoContainer: ElementRef;
  @ViewChild("formControls", { static: false }) public formControls: ElementRef;
  @ViewChild("loginButton", { static: false }) public loginButton: ElementRef;
  @ViewChild("forgotPasswordLabel", { static: false }) public forgotPasswordLabel: ElementRef;
  @ViewChild("passwordField", { static: false }) public passwordEl: ElementRef;

  constructor(private authService: AuthenticationService,
              private page: Page,
              private router: Router,
              private alertService: AlertService) {
  }

  public ngOnInit() {
    this.page.actionBarHidden = true;
    const version = appversion.getVersionNameSync();
    const parts = version.split(".");
    // tslint:disable-next-line: radix
    const date = parts[2] + "." + parts[1] + "." + (2016 + parseInt(parts[0])).toString();
    this.versionLabelText = `Version ${version} vom ${date}`;
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
      this.isAuthenticating = false;
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
    const loginButton =  this.loginButton.nativeElement as View;
    const forgotPasswordLabel =  this.forgotPasswordLabel.nativeElement as View;
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
      const s = {translate: { x: 0, y: 0 }, opacity: 1, delay: 650, duration: 150};
      animations.push({ target: formControls, ...s });
      animations.push({ target: loginButton, ...s });
      animations.push({ target: forgotPasswordLabel, ...s });

      // Kick off the animation queue
      new Animation(animations, false).play();
    });
  }
}
