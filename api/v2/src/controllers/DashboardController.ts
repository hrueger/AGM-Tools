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
      changes: ["New v2 API!"],
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
    const cacheRepository = getRepository(Cache);
    let diskSpaceUsed = await cacheRepository.findOne({
      select: ["value"],
      where: {
        name: "DiskSpaceUsed",
      },
    });

    if (!diskSpaceUsed || diskSpaceUsed.value) {
      const size = await new Promise<number>((resolve, reject) => {getFolderSize(config.storagePath, (err, size) => {
        if (err) {
          reject(err);
        } else {
          resolve(size);
        }
      })});
      diskSpaceUsed = {
        value: size.toString(),
        id: null,
        name: null,
      }
    }
    console.log("spaceChartData with", diskSpaceUsed);
    res.send({
      used: Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
      free: (300 * 1024)- Math.round(parseInt(diskSpaceUsed.value, undefined) / 1024 / 1024),
    });
  };
}

export default DashboardController;
