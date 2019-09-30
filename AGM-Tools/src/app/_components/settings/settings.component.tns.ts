import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { Page } from "tns-core-modules/ui/page";

@Component({
  selector: "app-settings",
  styleUrls: ["./settings.component.scss"],
  templateUrl: "./settings.component.html",
})
export class SettingsComponent implements OnInit {
  public displayItems: any[] = [];
  public sub: boolean = false;
  public mainIndex: number;
  public currentHeadline: string = "Einstellungen";
  public displayingFull: boolean = false;
  public settings: any[] = [
    {
      description: "Tägliche Updates, Geräte verwalten, ...",
      icon: 0xf0f3,
      name: "Push-Nachrichten",
      children: [
        {
          description: "Täglich eine Tageszusammenfassung per Mail erhalten.",
          icon: 0xf0e0,
          name: "Per E-Mail",
          type: "switch",
          value: false,
        },
        {
          description: "Benachrichtigungen in der App",
          icon: 0xf10b,
          name: "In der App",
          type: "switch",
          value: false,
        },
        {
          description: "Benachrichtigungen im Webinterface",
          icon: 0xf109,
          name: "Im Webinterface",
          type: "switch",
          value: false,
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
          icon: 0xf012,
          name: "Gerade online",
          type: "switch",
          value: false,
        },
        {
          description: "Den anderen Benutzern Informatioen über den zuletzt online Zeitpunkt zur Verfügung stellen.",
          icon: 0xf017,
          name: "Zuletzt online",
          type: "switch",
          value: false,
        },
        {
          description: "Email-Adresse nur für Administratoren sichtbar.",
          icon: 0xf070,
          name: "Email-Adresse verbergen",
          type: "switch",
          value: false,
        },
      ],
    },
    {
      description: "Impressum, Lizenzen, ...",
      icon: 0xf249,
      name: "Über",
      children: [
        {
          description: "",
          icon: 0xf070,
          name: "Impressum",
          type: "displayText",
          value: "Haufenweise Text...",
        },
        {
          description: "",
          icon: 0xf070,
          name: "OpenSource Lizenzen",
          type: "webview",
          value: "https://agmtools.allgaeu-gymnasium.de/AGM-Tools/3rdpartylicenses.txt",
        },
        {
          description: "",
          icon: 0xf070,
          name: "Über",
          type: "displayText",
          value: `© ${new Date().getFullYear()}, Hannes Rüger`,
        },
      ],
    },
  ];

  constructor( private page: Page) {}

  public ngOnInit() {
    this.page.actionBarHidden = true;
    this.displayItems = this.settings;
  }

  public getIcon(icon): string {
    return String.fromCharCode(icon);
  }

  public goTo(index) {
    if (!this.sub) {
      this.displayItems = this.settings[index].children;
      this.sub = true;
      this.mainIndex = index;
      this.currentHeadline = this.settings[index].name;
    } else {
      if (this.settings[this.mainIndex].children[index].type == "switch") {
        this.updateSwitch(index);
      } else {
        this.displayingFull = this.settings[this.mainIndex].children[index];
      }
    }
  }
  public back() {
    if (this.displayingFull) {
      this.displayingFull = false;
    } else {
      this.displayItems = this.settings;
      this.sub = false;
      this.currentHeadline = "Einstellungen";
    }
  }
  public updateSwitch(index: number) {
    this.settings[this.mainIndex].children[index].value = !this.settings[this.mainIndex].children[index].value;
  }
  public onDrawerButtonTap(): void {
    const sideDrawer =  app.getRootView() as RadSideDrawer;
    sideDrawer.showDrawer();
  }
}
