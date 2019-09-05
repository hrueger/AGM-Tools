import { Component, ElementRef } from "@angular/core";
import { OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import {
    DrawerTransitionBase,
    RadSideDrawer,
    SlideInOnTopTransition,
} from "nativescript-ui-sidedrawer";
import { User } from "./_models/user.model";
import { AuthenticationService } from "./_services/authentication.service";

@Component({
    selector: "app-root",
    styleUrls: ["./app.component.css"],
    templateUrl: "./app.component.html",
})
export class AppComponent {
    get sideDrawerTransition(): DrawerTransitionBase {
        return this.psideDrawerTransition;
    }
    @ViewChild("rsd", { static: false }) public rSideDrawer: ElementRef;
    public currentUser: User;
    public username = "";
    public useremail = "";
    public initials = "";
    private psideDrawerTransition: DrawerTransitionBase;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
    ) {
        this.authenticationService.currentUser.subscribe((x) => {
            if (x) {
                this.currentUser = x;
                this.useremail = x.email;
                this.username = x.firstName + " " + x.lastName;
                this.initials = x.firstName.charAt(0) + " " + x.lastName.charAt(0);
            } else {
                this.currentUser = new User();
                this.useremail = "Email";
                this.username = "Benutzername";
                this.initials = "XX";
            }

        });
    }

    public logout() {
        this.rSideDrawer.nativeElement.toggleDrawerState();
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    public ngOnInit() {
        this.psideDrawerTransition = new SlideInOnTopTransition();
    }
    public hideDrawer(): void {
        this.rSideDrawer.nativeElement.toggleDrawerState();
    }
}
