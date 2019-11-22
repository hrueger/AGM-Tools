import { Request, Response } from "express";
import * as getFolderSize from "get-folder-size";
import { getRepository, MoreThan } from "typeorm";
import config from "../config/config";
import { Cache } from "../entity/Cache";
import { Event } from "../entity/Event";
import { User } from "../entity/User";
import { howLongAgo } from "../utils/utils";

class DashboardController {

  public static whatsnew = async (req: Request, res: Response) => {
    res.send({
      changelog: [{
        changes: ["New v2 API!", "really cool!"],
        id: 0,
        version: "latest",
      }],
      lastUpdated: "vor einer Woche",
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
      lastUpdated: "gerade eben",
    });
  }
  public static version = async (req: Request, res: Response) => {
    res.send({
      lastUpdated: "vor einer Woche",
      version: "latest ;-)",
    });
  }
  public static notifications = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    try {
      const notifications = await userRepository.find({
        relations: ["notification"],
        where: {
          start: MoreThan(Date.now()),
        },
      });
      res.send({notifications, lastUpdated: "gerade eben"});
    } catch {
      res.send({
        lastUpdated: "gerade eben",
        notifications: [],
      });
    }

  }
  public static notificationSeen = async (req: Request, res: Response) => {
    res.send("hi");
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
      DashboardController.daysBetween(diskSpaceUsed.updatedAt, new Date()) > config.cacheExpireDays) {
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
        random: Math.random(),
        updatedAt: new Date(),
        value: size.toString(),
      };
      await cacheRepository.save(diskSpaceUsed);
      lastUpdated = "gerade eben";
    } else {
      lastUpdated = howLongAgo(diskSpaceUsed.updatedAt);
    }
    res.send({
      free: (config.avalibleDiskSpaceInGB * 1024) - Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
      lastUpdated,
      system: 0,
      total: config.avalibleDiskSpaceInGB * 1024,
      used: Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
    });
  }
}

export default DashboardController;
