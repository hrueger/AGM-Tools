import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { Page } from "tns-core-modules/ui/page";
import { RemoteService } from "../../_services/remote.service";
import { EnvironmentService } from "../../_services/environment.service";

@Component({
    selector: "app-settings",
    styleUrls: ["./settings.component.scss"],
    templateUrl: "./settings.component.html",
})
export class SettingsComponent implements OnInit {
    public displayItems: any[] = [];
    public sub = false;
    public mainIndex: number;
    public currentHeadline = "Einstellungen";
    public displayingFull = false;
    public settings: any[] = [];

    constructor(
        private page: Page,
        private remoteService: RemoteService,
        private environmentService: EnvironmentService,
    ) { }

    public ngOnInit() {
        this.page.actionBarHidden = true;
        this.remoteService.get("get", "settings").subscribe((settings: []) => {
            this.settings = settings;
            this.displayItems = this.settings;
        });
    }

    public getIcon(icon): string {
        return String.fromCharCode(icon);
    }

    public goTo(index) {
        if (!this.sub) {
            this.displayItems = this.settings[index].children.map((s) => {
                if (typeof s.value == "string" && s.type == "webview") {
                    s.value = s.value.replace("{{apiUrl}}", this.environmentService.environment.apiUrl);
                }
                return s;
            });
            this.sub = true;
            this.mainIndex = index;
            this.currentHeadline = this.settings[index].name;
        } else if (this.settings[this.mainIndex].children[index].type == "switch") {
            this.updateSwitch(index);
        } else {
            this.displayingFull = this.settings[this.mainIndex].children[index];
            this.currentHeadline = this.settings[this.mainIndex].children[index].name;
        }
    }
    public back() {
        if (this.displayingFull) {
            this.displayingFull = false;
            this.currentHeadline = this.settings[this.mainIndex].name;
        } else {
            this.displayItems = this.settings;
            this.sub = false;
            this.currentHeadline = "Einstellungen";
        }
    }
    public updateSwitch(index: number) {
        this.settings[this.mainIndex]
            .children[index].value = !this.settings[this.mainIndex].children[index].value;
    }
    public onDrawerButtonTap(): void {
        // @ts-ignore
        const sideDrawer = app.getRootView() as RadSideDrawer;
        sideDrawer.showDrawer();
    }
}
