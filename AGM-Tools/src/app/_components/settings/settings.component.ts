import { Component, OnInit } from "@angular/core";
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../../_services/authentication.service";
import { FastTranslateService } from "../../_services/fast-translate.service";
import { NavbarService } from "../../_services/navbar.service";
import { RemoteService } from "../../_services/remote.service";

@Component({
  selector: "app-settings",
  styleUrls: ["./settings.component.scss"],
  templateUrl: "./settings.component.html",
})
export class SettingsComponent {
  public settings: any[] = [];

  constructor(
    private remoteService: RemoteService,
    private navbarService: NavbarService,
    private fts: FastTranslateService,
    private authenticationService: AuthenticationService,
  ) {}

  public async ngOnInit() {
    this.navbarService.setHeadline(await this.fts.t("settings.settings"));
    this.remoteService.get("get", "settings").subscribe((settings: []) => {
      this.settings = settings;
    });
  }

  public getIcon(icon): string {
    return String.fromCharCode(icon);
  }

  public replaceAPIUrl(url: string) {
    return url.replace("{{apiUrl}}", environment.apiUrl) +
     "?authorization=" + this.authenticationService.currentUserValue.token;
  }
}
