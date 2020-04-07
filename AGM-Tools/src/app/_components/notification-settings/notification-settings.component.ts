import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-notification-settings",
    styleUrls: ["./notification-settings.component.scss"],
    templateUrl: "./notification-settings.component.html",
})
export class NotificationSettingsComponent implements OnInit {
    public devices: any[] = [];
    constructor(private remoteService: RemoteService) {}
    public ngOnInit() {
        this.remoteService.get("get", "push/devices").subscribe((data) => {
            if (data) {
                this.devices = data;
            }
        });
    }
}
