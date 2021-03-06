import {
    Component, ElementRef, ViewChild,
} from "@angular/core";

import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Downloader } from "nativescript-downloader";
import {
    DrawerTransitionBase,
    SlideInOnTopTransition,
} from "nativescript-ui-sidedrawer";
import { User } from "./_models/user.model";
import { AuthenticationService } from "./_services/authentication.service";
import { ShortcutsService } from "./_services/shortcuts.service";

@Component({
    selector: "app-root",
    styleUrls: ["./app.component.scss"],
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
        private translate: TranslateService,
        private shortcutsService: ShortcutsService,
    ) {
    }

    public logout() {
        this.hideDrawer();
        this.authenticationService.logout();
        this.router.navigate(["/login"]);
    }
    public ngOnInit() {
        this.shortcutsService.init();
        this.authenticationService.currentUser.subscribe((x) => {
            if (x) {
                this.currentUser = x;
                this.useremail = x.email;
                this.username = x.username;
                const a = x.username.split(" ");
                this.initials = (a.length == 1
                    ? a[0].charAt(0) : a[0].charAt(0) + a[a.length - 1].charAt(0));
            } else {
                this.currentUser = new User();
                this.useremail = "Email";
                this.username = "Benutzername";
                this.initials = "XX";
            }
        });
        this.translate.setDefaultLang("en");
        this.psideDrawerTransition = new SlideInOnTopTransition();
        Downloader.init();
    }
    public hideDrawer(): void {
        this.rSideDrawer.nativeElement.toggleDrawerState();
    }
}
