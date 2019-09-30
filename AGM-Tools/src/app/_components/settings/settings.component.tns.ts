import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-settings",
  styleUrls: ["./settings.component.scss"],
  templateUrl: "./settings.component.html",
})
export class SettingsComponent {
  public displayItems: any[] = [];
  public sub: boolean = false;
  public settings: any[] = [
    {
      description: "Tägliche Updates, Geräte verwalten, ...",
      icon: 0xf2f5,
      name: "Push-Nachrichten",
      children: [
        {
          description: "Täglich eine Tageszusammenfassung per Mail erhalten.",
          icon: 0xf2f5,
          name: "Per E-Mail",
          type: "switch",
        },
        {
          description: "Benachrichtigungen in der App",
          icon: 0xf2f5,
          name: "In der App",
          type: "switch",
        },
        {
          description: "Benachrichtigungen im Webinterface",
          icon: 0xf2f5,
          name: "Im Webinterface",
          type: "switch",
        },
      ],
    },
    {
      description: "Zuletzt online, ...",
      icon: 0xf2f5,
      name: "Datenschutz",
      children: [
        {
          description: "Den anderen Benutzern Informatioen über den online Status zur Verfügung stellen.",
          icon: 0xf2f5,
          name: "Gerade online",
          type: "switch",
        },
        {
          description: "Zuletzt online",
          icon: 0xf2f5,
          name: "Den anderen Benutzern Informatioen über den zuletzt online Zeitpunkt zur Verfügung stellen.",
          type: "switch",
        },
        {
          description: "Email-Adresse verbergen",
          icon: 0xf2f5,
          name: "Email-Adresse nur für Administratoren sichtbar.",
          type: "switch",
        },
      ],
    },
    {
      description: "Impressum, Lizenzen, ...",
      icon: 0xf2f5,
      name: "Über",
    },
  ];

  public ngOnInit() {
    this.displayItems = this.settings;
  }

  public getIcon(icon): string {
    return String.fromCharCode(icon);
  }

  public goTo(index) {
    if (!this.sub) {
      this.displayItems = this.settings[index].children;
      this.sub = true;
    } else {
      console.log("Sub!");
    }
  }
}
