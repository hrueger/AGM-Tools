import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { User } from "./_models/user.model";
import { AuthenticationService } from "./_services/authentication.service";
import { PushService } from "./_services/push.service";

@Component({
    selector: "app-root",
    styleUrls: ["./app.component.css"],
    templateUrl: "./app.component.html",
})
export class AppComponent {
    public currentUser: User;
    public pushMessage: any;
    public showNav: boolean = false;
    public navToHide: boolean = false;
    public isShare: boolean;
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private pushService: PushService,
        private translate: TranslateService,
    ) {
        translate.setDefaultLang("en");
        this.authenticationService.currentUser.subscribe(
            (x) => (this.currentUser = x),
        );
    }

    public logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    public ngOnInit() {
        const userId = Math.round(Math.random() * 10000);
        this.pushService.requestPermission(userId);
        this.pushService.receiveMessage();
        this.pushMessage = this.pushService.currentMessage;
        this.router.events.subscribe((event: any) => {
            if (event.url) {
                if (event.url.startsWith("/share/")) {
                    this.isShare = true;
                } else {
                    this.isShare = false;
                }
            }
        });
    }
    public hideNav() {
        this.navToHide = !this.navToHide;
    }
}
