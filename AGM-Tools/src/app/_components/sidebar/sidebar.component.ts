import { Component, Input } from "@angular/core";

@Component({
    selector: "app-sidebar",
    styleUrls: ["./sidebar.component.scss"],
    templateUrl: "./sidebar.component.html",
})
export class SidebarComponent {
    @Input() public changed: any;
    public showNav: boolean = true;
    public navLinks = [
        { name: "Dashboard", icon: "tachometer-alt", target: "dashboard" },
        { name: "Projekte", icon: "folder", target: "projects" },
        { name: "Kalender", icon: "calendar", target: "calendar" },
        { seperator: true},
        { name: "Chat", icon: "comments", target: "chat" },
        { name: "Benachrichtigungen", icon: "envelope", target: "notifications" },
        { seperator: true},
        { name: "Tutorials", icon: "book", target: "tutorials" },
        { name: "Vorlagen", icon: "portrait", target: "templates" },
        { seperator: true},
        { name: "Fertig", icon: "check", target: "done" },
    ];

    public hideNav() {
        this.showNav = false;
    }
    public ngOnChanges(changes) {
        this.showNav = !this.showNav;
    }

}
