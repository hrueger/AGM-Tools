import { Injectable } from "@angular/core";
import { SnackBar, SnackBarOptions } from "@nstudio/nativescript-snackbar";
import { Feedback } from "nativescript-feedback";

@Injectable({ providedIn: "root" })
export class AlertService {
  private feedback: Feedback;
  constructor() {
    this.feedback = new Feedback();
  }

  public success(message: string) {
    this.feedback.success({
      duration: 2000,
      message,
      title: "Erfolg!",
    });
  }

  public error(message: string) {
    this.feedback.error({
      duration: 2000,
      message,
      title: "Fehler!",
    });
  }

  public info(message: string) {
    this.feedback.info({
      duration: 2000,
      message,
      title: "Information:",
    });
  }

  public warning(message: string) {
    this.feedback.warning({
      duration: 2000,
      message,
      title: "Warnung!",
    });
  }

  public snackbar(message: string) {
    const snackbar = new SnackBar();

    const options: SnackBarOptions = {
      actionText: "Ok",
      actionTextColor: "#104b7d",
      backgroundColor: "#428bca",
      hideDelay: 3500,
      snackText: message,
      textColor: "#ffffff",
    };

    snackbar.action(options);
  }

}
