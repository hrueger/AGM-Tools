import { Component, ElementRef } from "@angular/core";
import { User } from "./_models/user.model";
import { Router } from "@angular/router";
import { AuthenticationService } from "./_services/authentication.service";
import { OnInit, ViewChild } from "@angular/core";
import * as app from "tns-core-modules/application";
import { RouterExtensions } from "nativescript-angular/router";
import {
    DrawerTransitionBase,
    RadSideDrawer,
    SlideInOnTopTransition
} from "nativescript-ui-sidedrawer";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent {
    private _sideDrawerTransition: DrawerTransitionBase;
    @ViewChild("rsd", { static: false }) rSideDrawer: ElementRef;
    currentUser: User;
    username = "";
    useremail = "";
    initials = "";
    navItems = [{
        link: "['/dashboard']", icon: "&#xf3fd;", text: "Dashboard"
    }, {
        link: "/dashboard", icon: "&#xf3fd;", text: "Dashboard"
    }, {
        link: "/dashboard", icon: "&#xf3fd;", text: "Dashboard"
    }, {
        link: "/dashboard", icon: "&#xf3fd;", text: "Dashboard"
    }, {
        link: "/dashboard", icon: "&#xf3fd;", text: "Dashboard"
    }];

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
        this.authenticationService.currentUser.subscribe(x => {
            if (x) {
                this.currentUser = x;
                this.useremail = "Email";
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

    logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    ngOnInit() {
        this._sideDrawerTransition = new SlideInOnTopTransition();
    }
    get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }
    public hideDrawer(): void {
        this.rSideDrawer.nativeElement.toggleDrawerState();
    }
}
