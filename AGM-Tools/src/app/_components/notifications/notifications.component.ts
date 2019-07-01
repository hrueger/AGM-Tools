import { Component, OnInit } from "@angular/core";
import { RemoteService } from "../../_services/remote.service";
import { Notification } from "../../_models/notification.model";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AlertService } from "../../_services/alert.service";
import { User } from "../../_models/user.model";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "app-notifications",
    templateUrl: "./notifications.component.html",
    styleUrls: ["./notifications.component.scss"]
})
export class NotificationsComponent implements OnInit {
    notifications: Notification[] = [];
    headline: string;
    content: string;
    receivers: number[];
    allusers: User[] = [];
    importance: number;
    invalidMessage: boolean = false;
    newNotificationForm: FormGroup;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private NavbarService: NavbarService
    ) {}

    ngOnInit() {
        this.NavbarService.setHeadline("Benachrichtigungen");
        this.remoteService
            .get("notificationsGetNotifications")
            .subscribe(data => {
                this.notifications = data;
            });
        this.newNotificationForm = this.fb.group({
            headline: [this.headline, [Validators.required]],
            content: [this.content, [Validators.required]],
            receivers: [this.receivers, [Validators.required]],
            importance: [this.importance, [Validators.required]]
        });
        this.remoteService.get("usersGetUsers").subscribe(data => {
            this.allusers = data;
        });
    }
    openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                result => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("notificationsNewNotification", {
                            headline: this.newNotificationForm.get("headline")
                                .value,
                            content: this.newNotificationForm.get("content")
                                .value,
                            receivers: this.newNotificationForm.get("receivers")
                                .value,
                            type: this.newNotificationForm.get("importance")
                                .value
                        })
                        .subscribe(data => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Benachrichtigung erfolgreich erstellt!"
                                );
                                this.remoteService
                                    .get("notificationsGetNotifications")
                                    .subscribe(data => {
                                        this.notifications = data;
                                    });
                            }
                        });
                },
                reason => {}
            );
    }
    deleteNotification(notification: Notification) {
        if (
            confirm("Möchten Sie diese Benachrichtigung wirklich löschen?") ==
            true
        ) {
            this.remoteService
                .getNoCache("notificationsDeleteNotification", {
                    id: notification.id
                })
                .subscribe(data => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Benachrichtigung erfolgreich gelöscht"
                        );
                        this.remoteService
                            .get("notificationsGetNotifications")
                            .subscribe(data => {
                                this.notifications = data;
                            });
                    }
                });
        }
    }
}
