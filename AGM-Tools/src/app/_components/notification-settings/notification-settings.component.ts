import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { NavbarService } from "../../_services/navbar.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { AlertService } from "../../_services/alert.service";

@Component({
    selector: "app-notification-settings",
    styleUrls: ["./notification-settings.component.scss"],
    templateUrl: "./notification-settings.component.html",
})
export class NotificationSettingsComponent implements OnInit {
    public devices: any[] = [];
    public props = [
        "chatMessages",
        "notifications",
        "newEvents",
        "upcomingEvents",
        "fileComments",
        "fileCommentReplys",
        "newTutorials",
        "newProjects",
        "newTemplates",
    ];
    constructor(
        private remoteService: RemoteService,
        private navbarService: NavbarService,
        private fts: FastTranslateService,
        private alertService: AlertService,
    ) {}
    public async ngOnInit() {
        this.navbarService.setHeadline(await this.fts.t("general.notificationSettings"));
        this.remoteService.get("get", "push/devices").subscribe((data) => {
            if (data) {
                this.devices = data;
            }
        });
    }
    public save(deviceId, prop: string, value: boolean) {
        this.remoteService.get("post", `settings/devices/${deviceId}/${prop}`, { value }).subscribe(async (data) => {
            if (data && data.status) {
                this.alertService.success(await this.fts.t("general.savedSuccessfully"));
            }
        });
    }
}
