import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Notification } from "../../_models/notification.model";
import { User } from "../../_models/user.model";
import { AlertService } from "../../_services/alert.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
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
        private fts: FastTranslateService,
    ) { }

    public async ngOnInit() {
        this.navbarService.setHeadline(await this.fts.t("notifications.notifications"));
        this.remoteService
            .get("get", "notifications")
            .subscribe((data) => {
                this.notifications = data;
            });
        this.newNotificationForm = this.fb.group({
            content: [this.content, [Validators.required]],
            headline: [this.headline, [Validators.required]],
            importance: [this.importance, [Validators.required]],
            receivers: [this.receivers, [Validators.required]],
        });
        this.remoteService.get("get", "users").subscribe((data) => {
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
                        .getNoCache("post", "notifications", {
                            content: this.newNotificationForm.get("content").value,
                            headline: this.newNotificationForm.get("headline").value,
                            receivers: this.newNotificationForm.get("receivers").value,
                            theme: this.newNotificationForm.get("importance").value,
                        })
                        .subscribe(async (data) => {
                            if (data && data.status == true) {
                                this.alertService.success(await this.fts.t("notifications.notificationCreatedSucessfully"));
                                this.remoteService
                                    .get("get", "notifications")
                                    .subscribe((res) => {
                                        this.notifications = res;
                                    });
                            }
                        });
                },
            );
    }
    public async deleteNotification(notification: Notification) {
        if (confirm(await this.fts.t("notifications.confirmDelete")) == true) {
            this.remoteService
                .getNoCache("delete", `notifications/${notification.id}`)
                .subscribe(async (data) => {
                    if (data && data.status == true) {
                        this.alertService.success(await this.fts.t("notifications.notificationDeletedSucessfully"));
                        this.remoteService
                            .get("get", "notifications")
                            .subscribe((res) => {
                                this.notifications = res;
                            });
                    }
                });
        }
    }
}
