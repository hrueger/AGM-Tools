import { Component, NgZone, ViewChild } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { AShowType, MSOption, MultiSelect } from "nativescript-multi-select";
import { RadDataFormComponent } from "nativescript-ui-dataform/angular/dataform-directives";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { RemoteService } from "../../_services/remote.service";

export class Notification {
    public headline: string;
    public content: string;
    public theme: string;
    public receivers: any[];
    public constructor(headline: string, content: string, theme: string) {
        this.headline = headline;
        this.content = content;
        this.theme = theme;
    }
}

@Component({
    selector: "new-notification-modal",
    templateUrl: "new-notification.modal.tns.html",
})
export class NewNotificationModalComponent {
    public receivers: any[] = [];
    @ViewChild("dataform", { static: false }) public dataform: RadDataFormComponent;
    public dataFormConfig: any;
    public noReceiversSelectedErrorMessage = false;
    public noTypeSelectedErrorMessage = false;
    private notification: Notification;
    private multiSelect: MultiSelect;
    private users: any[] = [];

    public constructor(
        private params: ModalDialogParams, private remoteService: RemoteService,
        private zone: NgZone, private fts: FastTranslateService,
    ) {
        this.multiSelect = new MultiSelect();
        this.remoteService.get("get", "users").subscribe((data): void => {
            this.users = [];
            data.forEach((user): void => {
                this.users.push({ name: user.username, id: user.id });
            });
        });
    }

    public close(): void {
        this.dataform.dataForm.validateAll()
            .then(async (result): Promise<void> => {
                if (result == true) {
                    if (this.receivers.length && this.receivers.length > 0) {
                        if (this.notification.theme && this.notification.theme != ""
                        && this.notification.theme != await this.fts.t("general.choose")) {
                            if (this.notification.theme == await this.fts.t("general.colors.success")) {
                                this.notification.theme = "success";
                            } else if (this.notification.theme == await this.fts.t("general.colors.info")) {
                                this.notification.theme = "info";
                            } else if (this.notification.theme == await this.fts.t("general.colors.warning")) {
                                this.notification.theme = "warning";
                            } else if (this.notification.theme == await this.fts.t("general.colors.danger")) {
                                this.notification.theme = "danger";
                            } else {
                                this.notification.theme = "info";
                            }
                            this.notification.receivers = this.receivers;
                            this.params.closeCallback(this.notification);
                        } else {
                            this.noTypeSelectedErrorMessage = true;
                        }
                    } else {
                        this.noReceiversSelectedErrorMessage = true;
                    }
                }
            });
    }

    public async ngOnInit(): Promise<void> {
        this.notification = new Notification("", "", "");
        this.dataFormConfig = {
            commitMode: "Immediate",
            isReadOnly: false,
            propertyAnnotations:
                [
                    {
                        displayName: await this.fts.t("general.topic"),
                        index: 0,
                        name: "headline",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                    {
                        displayName: await this.fts.t("general.message"),
                        editor: "MultilineText",
                        index: 1,
                        name: "content",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                    },
                    {
                        displayName: await this.fts.t("general.importance"),
                        editor: "Picker",
                        index: 3,
                        name: "theme",
                        validators: [
                            { name: "NonEmpty" },
                        ],
                        valuesProvider: [
                            await this.fts.t("general.choose"),
                            await this.fts.t("general.colors.success"),
                            await this.fts.t("general.colors.info"),
                            await this.fts.t("general.colors.warning"),
                            await this.fts.t("general.colors.danger"),
                        ],
                    },
                ],
            validationMode: "Immediate",
        };
    }

    public goBack(): void {
        this.params.closeCallback(null);
    }

    public async openReceiversSelectMenu(): Promise<void> {
        const options: MSOption = {
            android: {
                cancelButtonTextColor: "#252323",
                confirmButtonTextColor: "#70798C",
                titleSize: 25,
            },
            bindValue: "id",
            cancelButtonText: await this.fts.t("general.cancel"),
            confirmButtonText: await this.fts.t("general.select"),
            displayLabel: "name",
            ios: {
                cancelButtonBgColor: "#252323",
                cancelButtonTextColor: "#ffffff",
                confirmButtonBgColor: "#70798C",
                confirmButtonTextColor: "#ffffff",
                showType: AShowType.TypeBounceIn,
            },
            items: this.users,
            onCancel: (): void => {
                // console.log('CANCEL');
            },
            onConfirm: (selectedItems): void => {
                this.zone.run((): void => {
                    this.receivers = selectedItems;
                    // this.users = selectedItems;
                    // console.log("SELECTED ITEMS => ", selectedItems);
                });
            },
            onItemSelected: (): void => {
                // console.log("SELECTED ITEM => ", selectedItem);
                this.zone.run((): void => {
                    this.noReceiversSelectedErrorMessage = false;
                });
            },
            selectedItems: this.users,
            title: await this.fts.t("notifications.chooseReceivers"),
        };

        this.multiSelect.show(options);
    }
}
