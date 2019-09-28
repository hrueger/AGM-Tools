import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-settings",
  styleUrls: ["./settings.component.scss"],
  templateUrl: "./settings.component.html",
})
export class SettingsComponent {
  public settings: any[] = [
    {
      description: "Tägliche Updates, Geräte verwalten, ...",
      icon: 0xf2f5,
      name: "Push-Nachrichten",
    },
    {
      description: "Zuletzt online, ...",
      icon: 0xf2f5,
      name: "Datenschutz",
    },
    {
      description: "Impressum, Lizenzen, ...",
      icon: 0xf2f5,
      name: "Über",
    },
  ];

  public getIcon(icon): string {
    return String.fromCharCode(icon);
  }

}
