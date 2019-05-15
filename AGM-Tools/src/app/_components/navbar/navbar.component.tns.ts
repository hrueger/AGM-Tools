import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as app from "tns-core-modules/application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit {
    headline: string = "AGM-Tools";

    constructor(
        private router: Router,
        private NavbarService: NavbarService,
        private authenticationService: AuthenticationService
    ) {}
    logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    ngOnInit() {
        this.NavbarService.change.subscribe(headline => {
            this.headline = headline;
            console.log("Changed Headline to " + this.headline);
        });
    }
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
}
