import { Component } from "@angular/core";
import { Router } from "@angular/router";
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

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private oneSignalService: PushService,
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
