import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { Page } from "tns-core-modules/ui/page";
import { environment } from "../../../environments/environment";
import { RemoteService } from "../../_services/remote.service";

@Component({
  selector: "app-settings",
  styleUrls: ["./settings.component.scss"],
  templateUrl: "./settings.component.html",
})
export class SettingsComponent implements OnInit {
  public displayItems: any[] = [];
  public sub: boolean = false;
  public mainIndex: number;
  public currentHeadline: string = "Einstellungen";
  public displayingFull: boolean = false;
  public settings: any[] = [];

  constructor( private page: Page, private remoteService: RemoteService) {}

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
          s.value = s.value.replace("{{apiUrl}}", environment.apiUrl);
        }
        return s;
      });
      this.sub = true;
      this.mainIndex = index;
      this.currentHeadline = this.settings[index].name;
    } else {
      if (this.settings[this.mainIndex].children[index].type == "switch") {
        this.updateSwitch(index);
      } else {
        this.displayingFull = this.settings[this.mainIndex].children[index];
        this.currentHeadline = this.settings[this.mainIndex].children[index].name;
      }
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
    this.settings[this.mainIndex].children[index].value = !this.settings[this.mainIndex].children[index].value;
  }
  public onDrawerButtonTap(): void {
    // @ts-ignore
    const sideDrawer =  app.getRootView() as RadSideDrawer;
    sideDrawer.showDrawer();
  }
}
