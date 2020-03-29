import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../_services/authentication.service";
import { NavbarService } from "../../_services/navbar.service";
import { ElectronService } from "../../_services/electron.service";

@Component({
    selector: "navbar",
    styleUrls: ["./navbar.component.scss"],
    templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
    public headline = "";
    public isElectron: boolean;
    public isMaximized = true;

    @Output() public toggleNav = new EventEmitter<any>();

    constructor(
        private router: Router,
        private navbarService: NavbarService,
        private authenticationService: AuthenticationService,
        private cdr: ChangeDetectorRef,
        private electronService: ElectronService,
    ) { }
    public logout() {
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    public ngOnInit() {
        this.isElectron = this.electronService.isElectron;
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

    public minWindow() {
        this.electronService.runIfElectron((_, currentWindow) => {
            currentWindow.minimize();
        });
    }

    public maxWindow() {
        this.isMaximized = !this.isMaximized;
        this.electronService.runIfElectron((_, currentWindow) => {
            if (currentWindow.isMaximized()) {
                currentWindow.unmaximize();
            } else {
                currentWindow.maximize();
            }
        });
    }
    public closeWindow() {
        this.electronService.runIfElectron((_, currentWindow) => {
            currentWindow.hide();
        });
    }
}
