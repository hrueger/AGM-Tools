import { Injectable } from "@angular/core";
import { SnackBar, SnackBarOptions } from "@nstudio/nativescript-snackbar";
import { Feedback } from "nativescript-feedback";

@Injectable({ providedIn: "root" })
export class AlertService {
    private feedback: Feedback;
    public constructor() {
        this.feedback = new Feedback();
    }

    public success(message) {
        message = this.checkForObject(message);
        this.feedback.success({
            duration: 2000,
            message,
            title: "Erfolg!",
        });
    }

    public error(message) {
        message = this.checkForObject(message);
        this.feedback.error({
            duration: 2000,
            message,
            title: "Fehler!",
        });
    }

    public info(message) {
        message = this.checkForObject(message);
        this.feedback.info({
            duration: 2000,
            message,
            title: "Information:",
        });
    }

    public warning(message) {
        message = this.checkForObject(message);
        this.feedback.warning({
            duration: 2000,
            message,
            title: "Warnung!",
        });
    }

    public snackbar(message) {
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

    private checkForObject(message: any) {
        if (typeof message != "string") {
            message = `${message.message + message.stack}   ${message.toString()}`;
            // eslint-disable-next-line no-console
            console.log(message);
        }
        return message;
    }
}
