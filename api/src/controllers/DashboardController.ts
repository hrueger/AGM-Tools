import { Request, Response } from "express";
import * as findUp from "find-up";
import * as fs from "fs";
import * as getFolderSize from "get-folder-size";
import * as http from "http";
import * as i18n from "i18n";
import { getRepository, MoreThan } from "typeorm";
import { config } from "../config/config";
import { Cache } from "../entity/Cache";
import { Event } from "../entity/Event";
import { Notification } from "../entity/Notification";
import { Task } from "../entity/Task";
import { User } from "../entity/User";
import { toInt } from "../utils/utils";

class DashboardController {

  public static whatsnew = async (req: Request, res: Response) => {
    res.send({
      changelog: [{
        changes: ["New v2 API!", "really cool!"],
        id: 0,
        version: "latest",
      }],
      lastUpdated: new Date("25.01.2020"),
    });
  }
  public static events = async (req: Request, res: Response) => {
    const eventRepository = getRepository(Event);
    const events = await eventRepository.find({
      select: ["creator", "headline", "start", "id", "location"],
      where: {
        limit: 5.,
        order: { start: "ASC"},
        start: MoreThan(new Date().toISOString()),
      },
    });
    res.send({
      events,
      lastUpdated: new Date(),
    });
  }
  public static version = async (req: Request, res: Response) => {
    try {
      let data = JSON.parse(await new Promise((resolve, reject) => {
        http.get("http://localhost:8314", (d) => {
          let body = "";
          d.on("data", (chunk) => {
            body += chunk;
          });
          d.on("end", () => {
            resolve(body);
          });
        }).on("error", (er) => {
          reject(er);
        });
      }));
      if (!data) {
        data = {};
        data.data = {};
      }
      data.data.currentVersion = "1.0.0";
      // JSON.parse(fs.readFileSync(await findUp("package.json")).toString()).version;
      res.send(data);
    } catch (e) {
      res.status(500).send({message: e.toString()});
    }
  }
  public static notifications = async (req: Request, res: Response) => {
    const notificationRepository = getRepository(Notification);
    try {
      let notifications = await notificationRepository.find({
        order: {createdAt: "DESC"},
        relations: ["receivers", "creator", "seenBy"],
      });
      notifications = notifications.filter((n) => {
        if (!n.seenBy) {
          return true;
        }
        return !n.seenBy.some((r) => {
          return r.id === res.locals.jwtPayload.userId;
        });
      });
      res.send({notifications, lastUpdated: new Date()});
    } catch (e) {
      res.status(500).send({message: `${i18n.__("errors.errorWhileLoadingMessages")}` + e.toString()});
      return;
    }
  }

  public static notificationSeen = async (req: Request, res: Response) => {
    const notificationRepository = getRepository(Notification);
    try {
      const notification = await notificationRepository.findOneOrFail(req.params.id);
      if (!notification.seenBy) {
        notification.seenBy = [];
      }
      notification.seenBy.push(await getRepository(User).findOneOrFail(res.locals.jwtPayload.userId));
      await notificationRepository.save(notification);
    } catch (e) {
      res.status(500).send({message: `${i18n.__("errors.error")} ${e.toString()}`});
      return;
    }
    res.send({status: true});
  }

  public static tasks = async (req: Request, res: Response) => {
    res.send({
      lastUpdated: new Date(),
      tasks: (await getRepository(Task).find({relations: ["users", "creator", "project"]})).filter((t) =>
        t.users.filter((u) => u.id == res.locals.jwtPayload.userId).length > 0),
    });
  }

  public static spaceChartData = async (req: Request, res: Response) => {
    await DashboardController.sendSpaceChartData(res);
  }

  public static updateSpaceChartData = async (req: Request, res: Response) => {
    await DashboardController.sendSpaceChartData(res, true);
  }

  public static daysBetween(d1: Date, d2: Date) {
    const diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
  }
  private static async sendSpaceChartData(res: Response, update = false) {
    const cacheRepository = getRepository(Cache);
    let diskSpaceUsed = await cacheRepository.findOne({
      where: {
        name: "DiskSpaceUsed",
      },
    });
    let lastUpdated;
    if (update || !diskSpaceUsed || !diskSpaceUsed.value ||
      DashboardController.daysBetween(diskSpaceUsed.updatedAt, new Date()) >
        toInt(config.cacheExpireDays)) {
      const size = await new Promise<number>((resolve, reject) => {
        getFolderSize(config.storagePath, (err, s) => {
          if (err) {
            reject(err);
          } else {
            resolve(s);
          }
        });
      });
      diskSpaceUsed = {
        id: (diskSpaceUsed && diskSpaceUsed.id ? diskSpaceUsed.id : undefined),
        name: "DiskSpaceUsed",
        random: Math.floor(Math.random() * 10000),
        updatedAt: new Date(),
        value: size.toString(),
      };
      await cacheRepository.save(diskSpaceUsed);
      lastUpdated = new Date();
    } else {
      lastUpdated = diskSpaceUsed.updatedAt;
    }
    res.send({
      free: (toInt(config.avalibleDiskSpaceInGB) * 1024) -
        Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
      lastUpdated,
      system: 0,
      total: toInt(config.avalibleDiskSpaceInGB) * 1024,
      used: Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
    });
  }
}

export default DashboardController;
