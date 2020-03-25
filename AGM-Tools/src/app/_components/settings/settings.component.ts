import { ChangeDetectorRef, Component, NgZone } from "@angular/core";
import { environment } from "../../../environments/environment";
import { AlertService } from "../../_services/alert.service";
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
        private cdr: ChangeDetectorRef,
        private alertService: AlertService,
        private zone: NgZone,
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
        return `${url.replace("{{apiUrl}}", environment.apiUrl)
        }?authorization=${this.authenticationService.currentUserValue.token}`;
    }

    public getNameFromValue(options, value) {
        return options.filter((o) => o.value == value)[0].name;
    }

    public updateLang(lang: string) {
        this.fts.setLang(lang);
        this.cdr.detectChanges();
        localStorage.setItem("language", lang);
    }

    public async save(id: string, value: any, langChanged = false) {
        if (value === true) {
            value = "true";
        } else if (value === false) {
            value = "false";
        }
        this.remoteService.getNoCache("post", `settings/${id}`, {
            value,
        }).subscribe(async (data) => {
            if (data && data.status) {
                this.alertService.success(await this.fts.t("settings.settingSavedSuccessfully"));
                if (langChanged && data.settings) {
                    this.settings = data.settings;
                }
            }
        });
    }
}
