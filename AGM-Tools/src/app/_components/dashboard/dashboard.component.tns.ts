import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import * as appversion from "nativescript-appversion";
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
    public gotSpaceChartData: boolean;
    public gotWhatsNew: boolean;
    public gotVersion: boolean;
    public gotDates: boolean;
    public gotNotifications: boolean;
    public gotUpdates: boolean;
    public currentVersion: string;

    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
        private pushService: PushService,
        private router: RouterExtensions,
    ) {
        this.cfalertDialog = new CFAlertDialog();
    }

    public refresh(event) {
        const pullRefresh = event.object;
        this.getData(pullRefresh);
    }

    public ngOnInit() {

        this.currentVersion = appversion.getVersionNameSync();
        this.getData();
        this.pushService.init();
    }
    public getData(obj = false) {
        this.gotSpaceChartData = false;
        this.gotWhatsNew = false;
        this.gotVersion = false;
        this.gotDates = false;
        this.gotNotifications = false;
        this.remoteService.get("post", "dashboardGetSpaceChartData").subscribe((data) => {
            // console.log("Bekommene Daten: " + data);
            // console.log(data);
            if (data) {
                this.spaceChartData = [
                    { name: "Verfügbar", amount: data[0] },
                    { name: "Vom System belegt", amount: data[1] },
                    { name: "Von Daten belegt", amount: data[2] },
                ];
            }
            this.gotSpaceChartData = true;
            this.checkForRefreshDone(obj);

        });
        this.remoteService.get("post", "dashboardGetWhatsnew").subscribe((data) => {
            this.whatsnew = data;
            this.gotWhatsNew = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService.get("post", "dashboardGetDates").subscribe((data) => {
            this.dates = data;
            this.gotDates = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService.get("post", "dashboardGetVersion").subscribe((data) => {
            this.version = data;
            this.gotVersion = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService.get("post", "dashboardGetUpdates", { version: this.currentVersion }).subscribe((data) => {
            if (data.update) {
                this.router.navigate(["updater"]);
            }
            this.gotUpdates = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService
            .getNoCache("post", "dashboardGetNotifications")
            .subscribe((data) => {
                this.gotNotifications = true;
                this.checkForRefreshDone(obj);
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
                                    .getNoCache("post", "dashboardMakeNotificationSeen", {
                                        id: notification.id,
                                    })
                                    .subscribe();
                            },
                            text: "Gelesen",
                            textColor: "#eee",
                        }],
                        dialogStyle: CFAlertStyle.NOTIFICATION,
                        message: notification.content.replace("<br>", "\n") + "\n\n" + notification.sender + " am " +
                            notification.date + " um " + notification.time + " Uhr",
                        onDismiss: (dialog) => { /* dismiss */ },
                        title: type + notification.headline,
                    };
                    this.cfalertDialog.show(options);

                });
            });

        this.navbarService.setHeadline("Dashboard");
    }
    private checkForRefreshDone(obj: any) {
        if (obj
            && this.gotDates
            && this.gotNotifications
            && this.gotSpaceChartData
            && this.gotVersion
            && this.gotWhatsNew) {
            obj.refreshing = false;
        }
    }
}
