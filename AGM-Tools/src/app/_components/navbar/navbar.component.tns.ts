import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import * as app from "tns-core-modules/application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { AuthenticationService } from "../../_services/authentication.service";

@Component({
    selector: "navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit {
    @Input() headline: string;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }
    logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    ngOnInit() {

    }
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
}
