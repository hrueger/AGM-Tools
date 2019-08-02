import { Injectable } from "@angular/core";
import { Feedback } from "nativescript-feedback";
import { SnackBar, SnackBarOptions } from "@nstudio/nativescript-snackbar";

@Injectable({ providedIn: "root" })
export class AlertService {
  private feedback: Feedback;
  constructor() {
    this.feedback = new Feedback();
  }

  success(message: string) {
    this.feedback.success({
      title: "Erfolg!",
      message: message,
      duration: 2000
    });
  }

  error(message: string) {
    this.feedback.error({
      title: "Fehler!",
      message: message,
      duration: 2000
    });
  }

  info(message: string) {
    this.feedback.info({
      title: "Information:",
      message: message,
      duration: 2000
    });
  }

  warning(message: string) {
    this.feedback.warning({
      title: "Warnung!",
      message: message,
      duration: 2000
    });
  }

  snackbar(message: string) {
    const snackbar = new SnackBar();

    const options: SnackBarOptions = {
      actionText: "Ok",
      actionTextColor: '#104b7d',
      snackText: message,
      textColor: '#ffffff',
      hideDelay: 3500,
      backgroundColor: '#428bca',
    };

    snackbar.action(options);
  }



}
