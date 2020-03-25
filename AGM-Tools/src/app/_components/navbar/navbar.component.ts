import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Output,
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
    public headline = "";
    @Output() public toggleNav = new EventEmitter<any>();

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
                    this.cdr.markForCheck();
                } finally {
                    //
                }
            });
        } finally {
            //
        }
    }
    public toggleNavOnMobile(event) {
        event.preventDefault();
        event.stopPropagation();
        this.toggleNav.emit(Math.random());
    }
}
