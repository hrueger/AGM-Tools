import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { AuthenticationService } from "../../_services/authentication.service";

@Component({
    selector: "navbar",
    styleUrls: ["./navbar.component.scss"],
    templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
    @Input() public headline: string;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
    ) { }
    public logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }

    public onDrawerButtonTap(): void {
        // @ts-ignore
        const sideDrawer =  app.getRootView() as RadSideDrawer;
        sideDrawer.showDrawer();
    }
}
