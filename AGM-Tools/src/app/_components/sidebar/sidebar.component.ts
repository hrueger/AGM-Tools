import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-sidebar",
    templateUrl: "./sidebar.component.html",
    styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {
    navLinks = [
        { name: "Dashboard", icon: "tachometer-alt", target: "dashboard" },
        { name: "Benutzer", icon: "user", target: "users" },
        { name: "Chat", icon: "comments", target: "chat" },
        {
            name: "Benachrichtigungen",
            icon: "envelope",
            target: "notifications"
        },
        { name: "Kalender", icon: "calendar", target: "calendar" },
        { name: "Projekte", icon: "folder", target: "projects" },
        { name: "Dateien", icon: "image", target: "files" },
        { name: "Vorlagen", icon: "portrait", target: "templates" },
        {
            name: "Fehler / Verbesserungen",
            icon: "bug",
            target: "bugs"
        },
        { name: "Fertig", icon: "check", target: "done" },
        { name: "Client-Software", icon: "mobile", target: "clientsoftware" }
    ];
    constructor() {}

    ngOnInit() {}
}
