import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-sidebar",
    styleUrls: ["./sidebar.component.scss"],
    templateUrl: "./sidebar.component.html",
})
export class SidebarComponent {
    public navLinks = [
        { name: "Dashboard", icon: "tachometer-alt", target: "dashboard" },
        { name: "Benutzer", icon: "user", target: "users" },
        { name: "Chat", icon: "comments", target: "chat" },
        {
            icon: "envelope",
            name: "Benachrichtigungen",
            target: "notifications",
        },
        { name: "Kalender", icon: "calendar", target: "calendar" },
        { name: "Projekte", icon: "folder", target: "projects" },
        { name: "Dateien", icon: "image", target: "files" },
        { name: "Vorlagen", icon: "portrait", target: "templates" },
        {
            icon: "bug",
            name: "Fehler / Verbesserungen",
            target: "bugs",
        },
        { name: "Fertig", icon: "check", target: "done" },
        { name: "Client-Software", icon: "mobile", target: "clientsoftware" },
    ];

}
