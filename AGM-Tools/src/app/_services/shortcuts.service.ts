import { Injectable } from "@angular/core";
import { AppShortcuts } from "nativescript-app-shortcuts";
import { AlertService } from "./alert.service";
import { FastTranslateService } from "./fast-translate.service";

@Injectable({ providedIn: "root" })
export class ShortcutsService {
    constructor(private fts: FastTranslateService, private alertService: AlertService) {}
    public init() {
        const appShortcuts = new AppShortcuts();
        appShortcuts.available().then(async (available) => {
            if (available) {
                appShortcuts.configureQuickActions([
                    {
                        iconTemplate: "menu",
                        title: await this.fts.t("projects.projects"),
                        type: "projects",
                    },
                    {
                        iconTemplate: "ic_comment",
                        title: await this.fts.t("chat.chat"),
                        type: "chat",
                    },
                    {
                        iconTemplate: "ic_view_info",
                        title: await this.fts.t("calendar.calendar"),
                        type: "calendar",
                    },
                ]).then(() => undefined, (errorMessage) => {
                    this.alertService.error(errorMessage);
                });
            }
        });
    }
}
