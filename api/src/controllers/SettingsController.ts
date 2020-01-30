import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { config } from "../config/config";
import { Setting } from "../entity/Setting";
import { User } from "../entity/User";

class SettingsController {
  public static async getUserLanguage(res) {
    const s = await getRepository(Setting).find({
      where: {
        name: "language",
        user: await getRepository(User).findOne(res.locals.jwtPayload.userId),
      },
    });
    if (s && s[0] && s[0].value) {
      return s[0].value;
    } else {
      return config.defaultLanguage;
    }
  }
  public static listSettings = async (req: Request, res: Response) => {
    const settings = await SettingsController.getSettings(res);
    res.send(settings);
  }

  public static saveSetting = async (req: Request, res: Response) => {
    const {value} = req.body;
    if (!value) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    try {
      const currentUser = await getRepository(User).findOne(res.locals.jwtPayload.userId);
      const settingRepository = getRepository(Setting);
      const settings = await settingRepository.find({where: {user: currentUser, name: req.params.setting}});
      let setting: Setting;
      if (settings && settings[0]) {
        setting = settings[0];
      } else {
        setting = new Setting();
        setting.user = currentUser;
        setting.name = req.params.setting;
      }
      setting.value = value;
      await settingRepository.save(setting);
    } catch (e) {
      res.status(500).send({message: e.toString()});
      return;
    }
    if (req.params.setting == "language") {
      i18n.setLocale(value);
      res.send({status: true, settings: await SettingsController.getSettings(res)});
    } else {
      res.send({status: true});
    }
  }

  public static language = async (req: Request, res: Response) => {
    res.send({lang: await SettingsController.getUserLanguage(res)});
  }

  private static async getSettings(res: Response) {
    const data = {} as any;
    try {
      (await getRepository(Setting).find({
        where: {
          user: await getRepository(User).findOne(res.locals.jwtPayload.userId),
        },
      })).map((setting) => {
        data[setting.name] = setting.value;
      });
    } catch {
      //
    }
    const settings = [
      {
        children: [
          {
            description: i18n.__("settings.language.description"),
            icon: 0xf0ac,
            iconName: "globe",
            id: "language",
            name: i18n.__("settings.language.name"),
            options: [
              {
                name: "Deutsch",
                value: "de",
              },
              {
                name: "English",
                value: "en",
              },
            ],
            type: "language",
            value: data.language ? data.language : "en",
          },
        ],
        description: i18n.__("settings.personalization.description"),
        icon: 0xf4fe,
        iconName: "user-cog",
        id: "personalization",
        name: i18n.__("settings.personalization.name"),
      },
      {
        children: [
          {
            description: i18n.__("settings.summaryPerMail.description"),
            icon: 0xf0e0,
            iconName: "envelope",
            id: "summaryPerMail",
            name: i18n.__("settings.summaryPerMail.name"),
            type: "switch",
            value: data.summaryPerMail ? stringToBool(data.summaryPerMail) : true,
          },
          {
            description: i18n.__("settings.appNotifications.description"),
            icon: 0xf10b,
            iconName: "mobile",
            id: "appNotifications",
            name: i18n.__("settings.appNotifications.name"),
            type: "switch",
            value: data.appNotifications ? stringToBool(data.appNotifications) : true,
          },
          {
            description: i18n.__("settings.webNotifications.description"),
            icon: 0xf108,
            iconName: "desktop",
            id: "webNotifications",
            name: i18n.__("settings.webNotifications.name"),
            type: "switch",
            value: data.webNotifications ? stringToBool(data.webNotifications) : true,
          },
        ],
        description: i18n.__("settings.pushNotifications.description"),
        icon: 0xf0f3,
        iconName: "bell",
        id: "pushNotifications",
        name: i18n.__("settings.pushNotifications.name"),
      },
      {
        children: [
          {
            description: i18n.__("settings.online.description"),
            icon: 0xf012,
            iconName: "wifi",
            id: "online",
            name: i18n.__("settings.online.name"),
            type: "switch",
            value: data.online ? stringToBool(data.online) : true,
          },
          {
            description: i18n.__("settings.lastSeen.description"),
            icon: 0xf017,
            iconName: "clock",
            id: "lastSeen",
            name: i18n.__("settings.lastSeen.name"),
            type: "switch",
            value: data.lastSeen ? stringToBool(data.lastSeen) : true,
          },
          {
            description: i18n.__("settings.showEmail.description"),
            icon: 0xf070,
            iconName: "user-secret",
            id: "showEmail",
            name: i18n.__("settings.showEmail.name"),
            type: "switch",
            value: data.showEmail ? stringToBool(data.showEmail) : true,
          },
        ],
        description: i18n.__("settings.dataPrivacy.description"),
        icon: 0xf2f5,
        iconName: "eye",
        id: "dataPrivacy",
        name: i18n.__("settings.dataPrivacy.name"),
      },
      {
        children: [
          {
            description: "",
            icon: 0xf129,
            iconName: "info",
            id: "imprint",
            name: i18n.__("settings.imprint.name"),
            type: "html",
            value: "ToDo",
          },
          {
            description: "",
            icon: 0xf121,
            iconName: "code",
            id: "licenses",
            name: i18n.__("settings.licenses.name"),
            type: "webview",
            value: "{{apiUrl}}static/3rdPartyLicenses",
          },
          {
            description: "",
            icon: 0xf2bb,
            iconName: "address-card",
            id: "about",
            name: i18n.__("settings.about.name"),
            type: "html",
            value: `<h6>© ${new Date().getFullYear()}, Hannes Rüger</h6>`,
          },
        ],
        description: i18n.__("settings.about.description"),
        icon: 0xf05a,
        iconName: "info-circle",
        name: i18n.__("settings.about.name"),
      },
    ];
    return settings;
  }
}

export default SettingsController;

function stringToBool(s: string): boolean {
  if (s == "true") {
    return true;
  } else {
    return false;
  }
}
