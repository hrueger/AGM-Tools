import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Notification } from "../../_models/notification.model";
import { User } from "../../_models/user.model";
import { AlertService } from "../../_services/alert.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
    selector: "app-notifications",
    styleUrls: ["./notifications.component.scss"],
    templateUrl: "./notifications.component.html",
})
export class NotificationsComponent implements OnInit {
    public notifications: Notification[] = [];
    public headline: string;
    public content: string;
    public receivers: number[];
    public allusers: User[] = [];
    public importance: number;
    public invalidMessage: boolean = false;
    public newNotificationForm: FormGroup;
    constructor(
        private remoteService: RemoteService,
        private modalService: NgbModal,
        private fb: FormBuilder,
        private alertService: AlertService,
        private navbarService: NavbarService,
    ) { }

    public ngOnInit() {
        this.navbarService.setHeadline("Benachrichtigungen");
        this.remoteService
            .get("post", "notificationsGetNotifications")
            .subscribe((data) => {
                this.notifications = data;
            });
        this.newNotificationForm = this.fb.group({
            content: [this.content, [Validators.required]],
            headline: [this.headline, [Validators.required]],
            importance: [this.importance, [Validators.required]],
            receivers: [this.receivers, [Validators.required]],
        });
        this.remoteService.get("post", "usersGetUsers").subscribe((data) => {
            this.allusers = data;
        });
    }
    public openNewModal(content) {
        this.modalService
            .open(content, { ariaLabelledBy: "modal-basic-title" })
            .result.then(
                (result) => {
                    this.invalidMessage = false;

                    this.remoteService
                        .getNoCache("post", "notificationsNewNotification", {
                            content: this.newNotificationForm.get("content").value,
                            headline: this.newNotificationForm.get("headline").value,
                            receivers: this.newNotificationForm.get("receivers").value,
                            type: this.newNotificationForm.get("importance").value,
                        })
                        .subscribe((data) => {
                            if (data && data.status == true) {
                                this.alertService.success(
                                    "Benachrichtigung erfolgreich erstellt!",
                                );
                                this.remoteService
                                    .get("post", "notificationsGetNotifications")
                                    .subscribe((res) => {
                                        this.notifications = res;
                                    });
                            }
                        });
                },
            );
    }
    public deleteNotification(notification: Notification) {
        if (
            confirm("Möchten Sie diese Benachrichtigung wirklich löschen?") ==
            true
        ) {
            this.remoteService
                .getNoCache("post", "notificationsDeleteNotification", {
                    id: notification.id,
                })
                .subscribe((data) => {
                    if (data && data.status == true) {
                        this.alertService.success(
                            "Benachrichtigung erfolgreich gelöscht",
                        );
                        this.remoteService
                            .get("post", "notificationsGetNotifications")
                            .subscribe((res) => {
                                this.notifications = res;
                            });
                    }
                });
        }
    }
}
