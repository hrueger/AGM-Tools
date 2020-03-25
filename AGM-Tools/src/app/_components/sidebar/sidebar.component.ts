import { Component, Input } from "@angular/core";
import { FastTranslateService } from "../../_services/fast-translate.service";

@Component({
    selector: "app-sidebar",
    styleUrls: ["./sidebar.component.scss"],
    templateUrl: "./sidebar.component.html",
})
export class SidebarComponent {
    @Input() public changed: any;
    public showNav = true;
    public navLinks;

    constructor(private fts: FastTranslateService) {}

    public async ngOnInit() {
        this.navLinks = [
            { name: await this.fts.t("dashboard.dashboard"), icon: "tachometer-alt", target: "dashboard" },
            { name: await this.fts.t("projects.projects"), icon: "folder", target: "projects" },
            { name: await this.fts.t("calendar.calendar"), icon: "calendar", target: "calendar" },
            { separator: true },
            { name: await this.fts.t("chat.chat"), icon: "comments", target: "chat" },
            { name: await this.fts.t("notifications.notifications"), icon: "envelope", target: "notifications" },
            { separator: true },
            { name: await this.fts.t("tutorials.tutorials"), icon: "book", target: "tutorials" },
            { name: await this.fts.t("templates.templates"), icon: "portrait", target: "templates" },
            { separator: true },
            { name: await this.fts.t("done.done"), icon: "check", target: "done" },
        ];
    }

    public hideNav() {
        this.showNav = false;
    }
    public ngOnChanges() {
        this.showNav = !this.showNav;
    }
}
