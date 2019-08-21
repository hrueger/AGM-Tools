import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "./_models/user.model";
import { AuthenticationService } from "./_services/authentication.service";
import { OneSignalService } from "./_services/onesignal.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {
    public currentUser: User;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private oneSignalService: OneSignalService,
    ) {
        this.authenticationService.currentUser.subscribe(
            (x) => (this.currentUser = x),
        );
    }

    public logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    public ngOnInit() {
        // this.oneSignalService.init();
    }
}
