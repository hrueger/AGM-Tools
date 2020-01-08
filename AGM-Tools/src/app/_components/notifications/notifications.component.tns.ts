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
            .get("post", "notificationsGetNotifications")
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
                    .getNoCache("post", "notificationsNewNotification", {
                        content: newNotification.content,
                        headline: newNotification.headline,
                        receivers: newNotification.receivers,
                        type: newNotification.importance,
                    })
                    .subscribe(async (data) => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                await this.fts.t("notifications.notificationCreatedSuccessfully"));
                            this.remoteService
                                .get("post", "notificationsGetNotifications")
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
        // @ts-ignore
        const rightItem = swipeView.getViewById<View>("delete-view");
        swipeLimits.right = rightItem.getMeasuredWidth();
    }

    public onRightSwipeClick(args) {
        const id = args.object.bindingContext.id;
        const cfalertDialog = new CFAlertDialog();
        const onNoPressed = (response) => {
            this.notificationsListView.listView.notifySwipeToExecuteFinished();
        };
        const onYesPressed = (response) => {
            this.notificationsListView.listView.notifySwipeToExecuteFinished();
            this.remoteService
                .getNoCache("post", "notificationsDeleteNotification", {
                    id,
                })
                .subscribe((data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Benachrichtigungs erfolgreich gelöscht",
                        );
                        this.remoteService.get("post", "notificationsGetNotifications").subscribe((res) => {
                            this.notifications = res;
                        },
                        );
                    }
                });

        };
        cfalertDialog.show({
            buttons: [
                {
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    buttonStyle: CFAlertActionStyle.POSITIVE,
                    onClick: onYesPressed,
                    text: "Ja",

                },
                {
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    buttonStyle: CFAlertActionStyle.NEGATIVE,
                    onClick: onNoPressed,
                    text: "Nein",
                }],
            dialogStyle: CFAlertStyle.BOTTOM_SHEET,
            message: "Soll diese Benachrichtigung wirklich gelöscht werden?",
            title: "Bestätigung",
        });
    }
}
