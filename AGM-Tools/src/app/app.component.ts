import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { User } from "./_models/user.model";
import { AuthenticationService } from "./_services/authentication.service";
import { RemoteService } from "./_services/remote.service";
import { ElectronService } from "./_services/electron.service";
import { PushService } from "./_services/push.service";

@Component({
    selector: "app-root",
    styleUrls: ["./app.component.scss"],
    templateUrl: "./app.component.html",
})
export class AppComponent {
    public currentUser: User;
    public showNav = false;
    public navToHide = false;
    public isFullscreenPage: boolean;
    public showEverything = true;
    public isElectron = false;
    public routesWithFullscreenPages: string[] = ["share", "upload", "login"]

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private pushService: PushService,
        private translateService: TranslateService,
        private remoteService: RemoteService,
        private electronService: ElectronService,
    ) {
        translateService.setDefaultLang("en");
        this.authenticationService.currentUser.subscribe((x) => {
            this.currentUser = x;
        });
    }

    public logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    public ngOnInit() {
        const userId = Math.round(Math.random() * 10000);
        this.pushService.requestPermission(userId);
        this.pushService.receiveMessage();

        this.router.events.subscribe((event: any) => {
            if (event.url) {
                this.isFullscreenPage = false;
                for (const route of this.routesWithFullscreenPages) {
                    if (event.url.startsWith(route) || event.url.startsWith(`/${route}`)) {
                        this.isFullscreenPage = true;
                    }
                }
            }
        });
        this.translateService.setDefaultLang(
            localStorage.getItem("language")
                ? localStorage.getItem("language")
                : this.translateService.getBrowserLang(),
        );
        this.translateService.onLangChange.subscribe(() => {
            this.showEverything = false;
            setTimeout(() => {
                this.showEverything = true;
            }, 0);
        });
        this.isElectron = this.electronService.isElectron;
    }
    public hideNav() {
        this.navToHide = !this.navToHide;
    }
}
