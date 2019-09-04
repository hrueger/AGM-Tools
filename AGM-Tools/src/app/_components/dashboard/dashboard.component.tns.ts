import { Component, OnInit } from "@angular/core";
import {
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertDialog,
    CFAlertStyle,
    DialogOptions,
} from "nativescript-cfalert-dialog";
import { NavbarService } from "../../_services/navbar.service";
import { PushService } from "../../_services/push.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-dashboard",
    styleUrls: ["./dashboard.component.css"],
    templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
    public spaceChartData: Array<{ name: string; amount: string }> = [];
    public whatsnew;
    public dates;
    public selectedIndexes = [0, 3];
    public items: any = [];
    public version: string;
    public notifications: any[] = [];
    public cfalertDialog: CFAlertDialog;

    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
        private pushService: PushService,
    ) {
        this.cfalertDialog = new CFAlertDialog();
    }

    public ngOnInit() {
        this.initChart();
        this.pushService.init();
    }
    public initChart() {
        this.remoteService.get("dashboardGetSpaceChartData").subscribe((data) => {
            // console.log("Bekommene Daten: " + data);
            // console.log(data);
            if (data) {
                this.spaceChartData = [
                    { name: "Verfügbar", amount: data[0] },
                    { name: "Vom System belegt", amount: data[1] },
                    { name: "Von Daten belegt", amount: data[2] },
                ];
            }

        });
        this.remoteService.get("dashboardGetWhatsnew").subscribe((data) => {
            this.whatsnew = data;
        });
        this.remoteService.get("dashboardGetDates").subscribe((data) => {
            this.dates = data;
        });
        this.remoteService.get("dashboardGetVersion").subscribe((data) => {
            this.version = data;
        });
        this.remoteService
            .getNoCache("dashboardGetNotifications")
            .subscribe((data) => {
                this.notifications = data.notifications;
                this.notifications.forEach((notification) => {
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
                        backgroundBlur: true,
                        buttons: [{
                            backgroundColor: "#5cb85c",
                            buttonAlignment: CFAlertActionAlignment.END,
                            buttonStyle: CFAlertActionStyle.POSITIVE,
                            onClick: (response) => {
                                this.remoteService
                                    .getNoCache("dashboardMakeNotificationSeen", {
                                        id: notification.id,
                                    })
                                    .subscribe();
                            },
                            text: "Gelesen",
                            textColor: "#eee",
                        }],
                        dialogStyle: CFAlertStyle.NOTIFICATION,
                        message: notification.content + "\n\n" + notification.sender + " am " +
                            notification.date + " um " + notification.time + " Uhr",
                        onDismiss: (dialog) => { /* dismiss */ },
                        title: type + notification.headline,
                    };
                    this.cfalertDialog.show(options);

                });
            });

        this.navbarService.setHeadline("Dashboard");
    }
}
