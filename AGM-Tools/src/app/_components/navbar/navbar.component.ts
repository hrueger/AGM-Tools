import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent {
    headline: string = "Nix";

    constructor(
        private router: Router,
        private NavbarService: NavbarService,
        private authenticationService: AuthenticationService,
        private cdr: ChangeDetectorRef
    ) {}
    logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    ngAfterViewChecked() {
        try {
            this.NavbarService.change.subscribe(headline => {
                try {
                    this.headline = headline;
                    console.log("Changed Headline to " + this.headline);
                    this.cdr.detectChanges();
                } finally {
                }
            });
        } finally {
        }
    }
}
