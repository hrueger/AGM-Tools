import { Request, Response } from "express";
import { getRepository, MoreThan } from "typeorm";
import * as getFolderSize from "get-folder-size";
import { Cache } from "../entity/Cache";
import { Event } from "../entity/Event";
import { Notification } from "../entity/Notification";
import { User } from "../entity/User";
import config from "../config/config";

class DashboardController {
  static whatsnew = async (req: Request, res: Response) => {
    res.send([{
      id: 0,
      version: "latest",
      changes: ["New v2 API!", "really cool!"],
    }]);
  }
  static events = async (req: Request, res: Response) => {
    const eventRepository = getRepository(Event);
    const events = await eventRepository.find({
      select: ["creator", "headline", "start", "id", "location"],
      where: {
        start: MoreThan(Date.now()),
        order: {
          start: "ASC"
        },
        limit: 5.
      },
    });
    res.send(events);
  }
  static version = async (req: Request, res: Response) => {
    res.send({
      version: "latest ;-)"
    });
  }
  static notifications = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    try {
      const notifications = await userRepository.find({
        select: ["receivedNotifications"],
        relations: ["notification"],
        where: {
          start: MoreThan(Date.now()),
        },
      });
      res.send(notifications);
    } catch {
      res.send([]);
    }
    
  }
  static notificationSeen = async (req: Request, res: Response) => {
    res.send("hi");
  }
  static spaceChartData = async (req: Request, res: Response) => {
    await DashboardController.sendSpaceChartData(res);
  };

  static updateSpaceChartData = async (req: Request, res: Response) => {
    await DashboardController.sendSpaceChartData(res, true);
  };

  private static async sendSpaceChartData(res: Response, update = false) {
    const cacheRepository = getRepository(Cache);
    let diskSpaceUsed = await cacheRepository.findOne({
      where: {
        name: "DiskSpaceUsed",
      },
    });
    if (update || !diskSpaceUsed || !diskSpaceUsed.value || DashboardController.daysBetween(diskSpaceUsed.updatedAt, new Date()) > config.cacheExpireDays) {
      console.log("--- not from cache served");
      const size = await new Promise<number>((resolve, reject) => {
        getFolderSize(config.storagePath, (err, size) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(size);
          }
        });
      });
      diskSpaceUsed = {
        value: size.toString(),
        id: (diskSpaceUsed && diskSpaceUsed.id ? diskSpaceUsed.id : undefined),
        name: "DiskSpaceUsed",
        updatedAt: new Date(),
      };
      cacheRepository.save(diskSpaceUsed);
    }
    else {
      console.log("--- served from cache");
    }
    console.log("spaceChartData with", diskSpaceUsed);
    res.send({
      system: 0,
      used: Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
      free: (config.avalibleDiskSpaceInGB * 1024) - Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
      total: config.avalibleDiskSpaceInGB * 1024,
    });
  }

  static daysBetween(d1: Date, d2: Date) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
  };
}

export default DashboardController;
