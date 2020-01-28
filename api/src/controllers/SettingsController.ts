import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { Usergroup } from "../entity/Usergroup";

class SettingsController {
  public static listSettings = async (req: Request, res: Response) => {
    const settings = [
      {
        children: [
          {
            description: "Täglich eine Zusammenfassung per Mail erhalten.",
            icon: 0xf0e0,
            iconName: "envelope",
            name: "Per E-Mail",
            type: "switch",
            value: true,
          },
          {
            description: "Benachrichtigungen in der App",
            icon: 0xf10b,
            iconName: "mobile",
            name: "In der App",
            type: "switch",
            value: true,
          },
          {
            description: "Benachrichtigungen im Webinterface",
            icon: 0xf108,
            iconName: "desktop",
            name: "Im Webinterface",
            type: "switch",
            value: true,
          },
        ],
        description: "Tägliche Updates, Geräte verwalten, ...",
        icon: 0xf0f3,
        iconName: "bell",
        name: "Push-Nachrichten",
      },
      {
        children: [
          {
            description: "Den anderen Benutzern Informatioen über den online Status zur Verfügung stellen.",
            icon: 0xf012,
            iconName: "wifi",
            name: "Gerade online",
            type: "switch",
            value: true,
          },
          {
            description: "Den anderen Benutzern Informatioen über den zuletzt online Zeitpunkt zur Verfügung stellen.",
            icon: 0xf017,
            iconName: "clock",
            name: "Zuletzt online",
            type: "switch",
            value: true,
          },
          {
            description: "Email-Adresse für alle Benutzer sichtbar.",
            icon: 0xf070,
            iconName: "user-secret",
            name: "Email-Adresse anzeigen",
            type: "switch",
            value: true,
          },
        ],
        description: "Zuletzt online, ...",
        icon: 0xf2f5,
        iconName: "eye",
        name: "Datenschutz",
      },
      {
        children: [
          {
            description: "",
            icon: 0xf129,
            iconName: "info",
            name: "Impressum",
            type: "html",
            value: "Haufenweise Text...",
          },
          {
            description: "",
            icon: 0xf121,
            iconName: "code",
            name: "OpenSource Lizenzen",
            type: "webview",
            value: "{{apiUrl}}static/3rdPartyLicenses",
          },
          {
            description: "",
            icon: 0xf2bb,
            iconName: "address-card",
            name: "Über",
            type: "html",
            value: `<h6>© ${new Date().getFullYear()}, Hannes Rüger</h6>`,
          },
        ],
        description: "Impressum, Lizenzen, ...",
        icon: 0xf05a,
        iconName: "info-circle",
        name: "Über",
      },
    ];
    res.send(settings);
  }

  public static saveSettings = async (req: Request, res: Response) => {
    res.status(500);
  }
}

export default SettingsController;
