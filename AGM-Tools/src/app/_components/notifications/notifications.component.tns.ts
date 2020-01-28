import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import {
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertDialog,
    CFAlertStyle,
} from "nativescript-cfalert-dialog";
import { ListViewEventData } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular/listview-directives";
import { View } from "tns-core-modules/ui/core/view/view";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { Notification } from "../../_models/notification.model";
import { AlertService } from "../../_services/alert.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { RemoteService } from "../../_services/remote.service";
import { NewNotificationModalComponent } from "../_modals/new-notification.modal.tns";

@Component({
    selector: "app-notifications",
    styleUrls: ["./notifications.component.scss"],
    templateUrl: "./notifications.component.html",
})
export class NotificationsComponent implements OnInit {
    public notifications: Notification[] = [];
    public itemsSelected: boolean = false;
    @ViewChild("notificationsListView", { read: RadListViewComponent, static: false })
    public notificationsListView: RadListViewComponent;
    constructor(private remoteService: RemoteService, private modal: ModalDialogService,
                private vcRef: ViewContainerRef, private alertService: AlertService,
                private fts: FastTranslateService) { }

    public ngOnInit() {
        this.remoteService
            .get("get", "notifications")
            .subscribe((data) => {
                this.notifications = data;
            });
    }

    public openNewModal() {
        const options = {
            animated: true,
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef,
        };
        this.modal.showModal(NewNotificationModalComponent, options).then((newNotification) => {
            if (newNotification) {
                this.remoteService
                    .getNoCache("post", "notifications", {
                        content: newNotification.content,
                        headline: newNotification.headline,
                        receivers: newNotification.receivers,
                        theme: newNotification.theme,
                    })
                    .subscribe(async (data) => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                await this.fts.t("notifications.notificationCreatedSuccessfully"));
                            this.remoteService
                                .get("get", "notifications")
                                .subscribe((res) => {
                                    this.notifications = res;
                                });
                        }
                    });
            }
        });
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args.object;
        const rightItem = swipeView.getViewById<View>("delete-view");
        swipeLimits.right = rightItem.getMeasuredWidth();
    }

    public async onRightSwipeClick(args) {
        const id = args.object.bindingContext.id;

        this.notificationsListView.listView.notifySwipeToExecuteFinished();
        if (await dialogs.confirm(await this.fts.t("notifications.confirmDelete"))) {
            this.remoteService
                .getNoCache("delete", `notifications/${id}`, {
                    id,
                })
                .subscribe(async (data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            await this.fts.t("notifications.notificationDeletedSuccessfully"),
                        );
                        this.remoteService.get("get", "notifications").subscribe((res) => {
                            this.notifications = res;
                        },
                        );
                    }
                });
        }
    }
}
