import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { User } from "./_models/user.model";
import { AuthenticationService } from "./_services/authentication.service";
import { RemoteService } from "./_services/remote.service";
import { ElectronService } from "./_services/electron.service";

@Component({
    selector: "app-root",
    styleUrls: ["./app.component.css"],
    templateUrl: "./app.component.html",
})
export class AppComponent {
    public currentUser: User;
    public pushMessage: any;
    public showNav = false;
    public navToHide = false;
    public isShare: boolean;
    public showEverything = true;
    public isElectron = false;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        // private pushService: PushService,
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
        // const userId = Math.round(Math.random() * 10000);
        // this.pushService.requestPermission(userId);
        // this.pushService.receiveMessage();
        // this.pushMessage = this.pushService.currentMessage;
        this.router.events.subscribe((event: any) => {
            if (event.url) {
                if (event.url.startsWith("/share/")) {
                    this.isShare = true;
                } else {
                    this.isShare = false;
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
