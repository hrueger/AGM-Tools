import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";

@Component({
    selector: "navbar",
    styleUrls: ["./navbar.component.scss"],
    templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
    public headline: string = "Nix";

    constructor(
        private router: Router,
        private navbarService: NavbarService,
        private authenticationService: AuthenticationService,
        private cdr: ChangeDetectorRef,
    ) { }
    public logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    public ngAfterViewChecked() {
        try {
            this.navbarService.change.subscribe((headline) => {
                try {
                    this.headline = headline;
                    this.cdr.detectChanges();
                    // tslint:disable-next-line: no-empty
                } finally {
                }
            });
            // tslint:disable-next-line: no-empty
        } finally {
        }
    }
}
