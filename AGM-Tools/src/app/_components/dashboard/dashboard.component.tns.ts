import { formatDate } from "@angular/common";
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
import { FastTranslateService } from "../../_services/fast-translate.service";
import { PushService } from "../../_services/push.service";
import { RemoteService } from "../../_services/remote.service";
import { dateDiff } from "./helpers";

@Component({
    selector: "app-dashboard",
    styleUrls: ["./dashboard.component.css"],
    templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
    public spaceChartData: { name: string; amount: string }[] = [];
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
    public lastUpdated: any = {
        changelog: "",
        events: "",
        space: "",
        version: "",
    };
    public countdownInterval: any;

    constructor(
        private remoteService: RemoteService,
        private pushService: PushService,
        private router: RouterExtensions,
        private fts: FastTranslateService,
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

    public ngOnDestroy() {
        clearInterval(this.countdownInterval);
    }

    public getData(obj = false) {
        this.gotSpaceChartData = false;
        this.gotWhatsNew = false;
        this.gotVersion = false;
        this.gotDates = false;
        this.gotNotifications = false;
        this.remoteService.get("get", "dashboard/spaceChartData").subscribe(async (data) => {
            if (data) {
                this.lastUpdated.space = data.lastUpdated;
                this.spaceChartData = [
                    { name: await this.fts.t("dashboard.remainingDiskSpace"), amount: data.free },
                    { name: await this.fts.t("dashboard.diskSpaceUsedBySystem"), amount: data.system },
                    { name: await this.fts.t("dashboard.diskSpaceUsedByData"), amount: data.used },
                ];
            }
            this.gotSpaceChartData = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService.get("get", "dashboard/whatsnew").subscribe((data) => {
            this.whatsnew = data.changelog;
            this.lastUpdated.changelog = data.lastUpdated;
            this.gotWhatsNew = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService.get("get", "dashboard/events").subscribe((data) => {
            this.dates = data.events;
            const that = this;
            this.countdownInterval = setInterval(() => {
                for (const event of that.dates) {
                    const d = dateDiff(new Date().getTime(), new Date(event.start).getTime());
                    const a = [];
                    if (d.months) { a.push(`${d.months} Monat${(d.months > 1 ? "e" : "")}`); }
                    if (d.days) { a.push(`${d.days} Tag${(d.days > 1 ? "e" : "")}`); }
                    if (d.hours) { a.push(`${d.hours} Stunde${(d.hours > 1 ? "n" : "")}`); }
                    if (d.minutes) { a.push(`${d.minutes} Minute${(d.minutes > 1 ? "n" : "")}`); }
                    if (d.seconds) { a.push(`${d.seconds} Sekunde${(d.seconds > 1 ? "n" : "")}`); }
                    event.countdownTime = a.join(", ");
                }
            }, 900);
            this.lastUpdated.events = data.lastUpdated;
            this.gotDates = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService.get("get", "dashboard/version").subscribe((data) => {
            this.version = data.version;
            this.lastUpdated.version = data.lastUpdated;
            this.gotVersion = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService.get("get", `update/check/${this.currentVersion}`).subscribe((data) => {
            if (data.update) {
                this.router.navigate(["updater"]);
            }
            this.gotUpdates = true;
            this.checkForRefreshDone(obj);
        });
        this.remoteService
            .getNoCache("get", "dashboard/notifications/")
            .subscribe((data) => {
                this.gotNotifications = true;
                this.checkForRefreshDone(obj);
                this.notifications = data.notifications;
                this.lastUpdated.notifications = data.lastUpdated;
                this.notifications.forEach(async (notification) => {
                    let type;

                    if (notification.theme == "success") {
                        type = "Erfolg: ";
                    } else if (notification.theme == "warning") {
                        type = "Warnung: ";
                    } else if (notification.theme == "error") {
                        type = "Fehler: ";
                    } else if (notification.theme == "info") {
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
                            onClick: () => {
                                this.remoteService
                                    .getNoCache("post", `dashboard/notifications/${notification.id}`)
                                    .subscribe();
                            },
                            text: await this.fts.t("general.read"),
                            textColor: "#eee",
                        }],
                        dialogStyle: CFAlertStyle.NOTIFICATION,
                        message: `${notification.content.replace("<br>", "\n")}\n\n${notification.creator.username}, ${formatDate(notification.createdAt, "short", "de")}`,
                        onDismiss: () => { /* dismiss */ },
                        title: type + notification.headline,
                    };
                    this.cfalertDialog.show(options);
                });
            });
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
