import { Component, OnInit } from "@angular/core";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";
import {
    CFAlertDialog,
    DialogOptions,
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertStyle
} from "nativescript-cfalert-dialog";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-dashboard",
    templateUrl: "./dashboard.component.html",
    styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
    spaceChartData: { name: string; amount: string }[] = [];
    whatsnew;
    dates;
    selectedIndexes = [0, 3];
    items: any = [];
    version: string;
    notifications: any[] = [];
    cfalertDialog: CFAlertDialog;

    constructor(
        private remoteService: RemoteService,
        private NavbarService: NavbarService,
        private alertService: AlertService
    ) {
        this.cfalertDialog = new CFAlertDialog();
    }

    ngOnInit() {
        this.initChart();
    }
    initChart() {
        this.remoteService.get("dashboardGetSpaceChartData").subscribe(data => {
            //console.log("Bekommene Daten: " + data);
            //console.log(data);
            if (data) {
                this.spaceChartData = [
                    { name: "Verfügbar", amount: data[0] },
                    { name: "Vom System belegt", amount: data[1] },
                    { name: "Von Daten belegt", amount: data[2] }
                ];
            }

        });
        this.remoteService.get("dashboardGetWhatsnew").subscribe(data => {
            this.whatsnew = data;
        });
        this.remoteService.get("dashboardGetDates").subscribe(data => {
            this.dates = data;
        });
        this.remoteService.get("dashboardGetVersion").subscribe(data => {
            this.version = data;
        });
        this.remoteService
            .getNoCache("dashboardGetNotifications")
            .subscribe(data => {
                this.notifications = data.notifications;
                this.notifications.forEach(notification => {
                    let type;

                    if (notification.type == "alert-success") {
                        type = "Erfolg: ";
                    } else if (notification.type == "alert-warning") {
                        type = "Warnung: ";
                    } else if (notification.type == "alert-error") {
                        type = "Fehler: ";
                    } else if (notification.type == "alert-info") {
                        type = "Info: ";
                    } else {
                        type = "";
                    }

                    const options: DialogOptions = {
                        dialogStyle: CFAlertStyle.NOTIFICATION,
                        title: type + notification.headline,
                        message: notification.content + "\n\n" + notification.sender + " am " + notification.date + " um " + notification.time + " Uhr",
                        backgroundBlur: true,
                        onDismiss: dialog => { },
                        buttons: [{
                            text: "Gelesen",
                            buttonStyle: CFAlertActionStyle.POSITIVE,
                            buttonAlignment: CFAlertActionAlignment.END,
                            textColor: "#eee",
                            backgroundColor: "#5cb85c",
                            onClick: response => {
                                this.remoteService
                                    .getNoCache("dashboardMakeNotificationSeen", {
                                        id: notification.id
                                    })
                                    .subscribe(data => {
                                        if (data.status != true) {
                                            //console.log("Fehler, Benachrichtigung konnte nicht als gelesen markiert werden...");
                                        }
                                    });
                            }
                        }]
                    };
                    this.cfalertDialog.show(options);

                });
            });

        this.NavbarService.setHeadline("Dashboard");
    }
}
