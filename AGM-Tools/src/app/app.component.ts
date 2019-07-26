import { Component } from "@angular/core";
import { User } from "./_models/user.model";
import { Router } from "@angular/router";
import { AuthenticationService } from "./_services/authentication.service";
import { OneSignalService } from "./_services/onesignal.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent {
    currentUser: User;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private oneSignalService: OneSignalService
    ) {
        this.authenticationService.currentUser.subscribe(
            x => (this.currentUser = x)
        );
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    ngOnInit() {
        //this.oneSignalService.init();
    }
}
