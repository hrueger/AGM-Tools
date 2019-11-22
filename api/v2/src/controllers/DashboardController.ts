import { Request, Response } from "express";
import * as getFolderSize from "get-folder-size";
import { getRepository, MoreThan } from "typeorm";
import config from "../config/config";
import { Cache } from "../entity/Cache";
import { Event } from "../entity/Event";
import { Notification } from "../entity/Notification";
import { User } from "../entity/User";

class DashboardController {

  public static whatsnew = async (req: Request, res: Response) => {
    res.send([{
      changes: ["New v2 API!", "really cool!"],
      id: 0,
      version: "latest",
    }]);
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
    res.send(events);
  }
  public static version = async (req: Request, res: Response) => {
    res.send({
      version: "latest ;-)",
    });
  }
  public static notifications = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    try {
      const notifications = await userRepository.find({
        relations: ["notification"],
        select: ["receivedNotifications"],
        where: {
          start: MoreThan(Date.now()),
        },
      });
      res.send(notifications);
    } catch {
      res.send([]);
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
        updatedAt: new Date(),
        value: size.toString(),
      };
      cacheRepository.save(diskSpaceUsed);
    }
    res.send({
      free: (config.avalibleDiskSpaceInGB * 1024) - Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
      system: 0,
      total: config.avalibleDiskSpaceInGB * 1024,
      used: Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
    });
  }
}

export default DashboardController;
