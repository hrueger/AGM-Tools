import { RemoteService } from "../../_services/remote.service";
import { Notification } from "../../_models/notification.model";
import { Component, OnInit, ViewContainerRef, ViewChild } from "@angular/core";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { AlertService } from "../../_services/alert.service";
import { NewNotificationModalComponent } from "../_modals/new-notification.modal.tns"
import {
    CFAlertDialog,
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertStyle
} from 'nativescript-cfalert-dialog';
import { RadListViewComponent } from "nativescript-ui-listview/angular/listview-directives";
import { ListViewEventData } from "nativescript-ui-listview";
import { View } from "tns-core-modules/ui/core/view/view";

@Component({
    selector: "app-notifications",
    templateUrl: "./notifications.component.html",
    styleUrls: ["./notifications.component.scss"]
})
export class NotificationsComponent implements OnInit {
    notifications: Notification[] = [];
    itemsSelected: boolean = false;
    @ViewChild("notificationsListView", { read: RadListViewComponent, static: false }) notificationsListView: RadListViewComponent;
    constructor(private remoteService: RemoteService, private modal: ModalDialogService,
        private vcRef: ViewContainerRef, private alertService: AlertService) { }

    ngOnInit() {
        this.remoteService
            .get("notificationsGetNotifications")
            .subscribe(data => {
                this.notifications = data;
            });
    }



    public openNewModal() {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(NewNotificationModalComponent, options).then(newNotification => {
            if (newNotification) {
                this.remoteService
                    .getNoCache("notificationsNewNotification", {
                        headline: newNotification.headline,
                        content: newNotification.content,
                        receivers: newNotification.receivers,
                        type: newNotification.importance
                    })
                    .subscribe(data => {
                        if (data && data.status == true) {
                            this.alertService.success(
                                "Benachrichtigung erfolgreich gesendet!"
                            );
                            this.remoteService
                                .get("notificationsGetNotifications")
                                .subscribe(data => {
                                    this.notifications = data;
                                });
                        }
                    });
            }
        });
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args['object'];
        const rightItem = swipeView.getViewById<View>('delete-view');
        swipeLimits.right = rightItem.getMeasuredWidth();
    }


    public onRightSwipeClick(args) {
        var id = args.object.bindingContext.id;
        let cfalertDialog = new CFAlertDialog();
        const onNoPressed = response => {
            console.log("nein");
            this.notificationsListView.listView.notifySwipeToExecuteFinished();
        };
        const onYesPressed = response => {
            console.log("ja");
            this.notificationsListView.listView.notifySwipeToExecuteFinished();
            this.remoteService
                .getNoCache("notificationsDeleteNotification", {
                    id: id
                })
                .subscribe(data => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Benachrichtigungs erfolgreich gelöscht"
                        );
                        this.remoteService.get("notificationsGetNotifications").subscribe(data => {
                            this.notifications = data;
                        }
                        )
                    } else {
                        console.log(data);
                    }
                });

        };
        cfalertDialog.show({
            dialogStyle: CFAlertStyle.BOTTOM_SHEET,
            title: "Bestätigung",
            message: "Soll diese Benachrichtigung wirklich gelöscht werden?",
            buttons: [
                {
                    text: "Ja",
                    buttonStyle: CFAlertActionStyle.POSITIVE,
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    onClick: onYesPressed


                },
                {
                    text: "Nein",
                    buttonStyle: CFAlertActionStyle.NEGATIVE,
                    buttonAlignment: CFAlertActionAlignment.JUSTIFIED,
                    onClick: onNoPressed
                }]
        });
    }
}
