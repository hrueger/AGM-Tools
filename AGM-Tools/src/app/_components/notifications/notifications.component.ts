import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { Notification } from "../../_models/notification.model";

import { ListViewEventData, RadListView } from "nativescript-ui-listview";

@Component({
    selector: "app-notifications",
    templateUrl: "./notifications.component.html",
    styleUrls: ["./notifications.component.scss"]
})
export class NotificationsComponent implements OnInit {
    notifications: Notification[] = [];
    itemsSelected: boolean = false;
    constructor(private remoteService: RemoteService) {}

    ngOnInit() {
        this.remoteService
            .get("notificationsGetNotifications")
            .subscribe(data => {
                this.notifications = data;
            });
    }
    onNotificationTap(notification: Notification) {
        alert({
            title: notification.headline,
            message: notification.content.replace("<br>", "\n"),
            okButtonText: "Fertig"
        });
    }
    public itemSelected(args: ListViewEventData) {
        const item = this.notifications[args.index];
        item.selected = true;
        console.log("selected");
    }

    public itemDeselected(args: ListViewEventData) {
        const item = this.notifications[args.index];
        item.selected = false;
        console.log("deselected");
    }
}
