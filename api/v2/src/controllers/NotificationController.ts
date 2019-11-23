import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Notification } from "../entity/Notification";
import { User } from "../entity/User";
import { howLongAgo } from "../utils/utils";

class NotificationController {
  public static listAll = async (req: Request, res: Response) => {
    const notificationRepository = getRepository(Notification);
    const me = await getRepository(User).findOneOrFail(res.locals.jwtPayload.userId);
    const notifications = await notificationRepository.find({
      order: {createdAt: "DESC"},
      relations: ["creator", "receivers", "seenBy"],
      where: {creator: me},
    });
    res.send(notifications);
  }

  public static newNotification = async (req: Request, res: Response) => {
    const notificationRepository = getRepository(Notification);
    const { content, headline, receivers, theme } = req.body;
    if (!(headline && content && receivers)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
      return;
    }
    const userRepo = getRepository(User);
    const notification = new Notification();
    notification.content = content;
    notification.headline = headline;
    notification.theme = theme;
    notification.receivers = [];
    try {
      for (const userId of receivers) {
        notification.receivers.push(await userRepo.findOne(userId));
      }
    } catch (e) {
      res.status(500).send({message: "Fehler beim Senden der Nachricht: " + e.toString()});
      return;
    }
    notification.creator = await userRepo.findOne(res.locals.jwtPayload.userId);

    const errors = await validate(notification);
    if (errors.length > 0) {
      const ers = errors.map((e) => e.toString);
      res.status(400).send({message: ers.join(", ")});
      return;
    }
    let id;
    try {
      id = (await notificationRepository.save(notification)).id;
    } catch (e) {
      res.status(500).send({message: "Fehler beim Speichern der Nachricht: " + e.toString()});
      return;
    }

    res.status(200).send({status: true, id});
  }

  public static seenNotification = async (req: Request, res: Response) => {
    const id = req.params.id;
    return;
    const notificationRepository = getRepository(Notification);
    let notification: Notification;
    try {
      notification = await notificationRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: "Notification nicht gefunden!"});
      return;
    }
    notificationRepository.delete(id);

    res.status(200).send({status: true});
  }

  public static deleteNotification = async (req: Request, res: Response) => {
    const id = req.params.id;

    const notificationRepository = getRepository(Notification);
    let notification: Notification;
    try {
      notification = await notificationRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: "Notification nicht gefunden!"});
      return;
    }
    notificationRepository.delete(id);

    res.status(200).send({status: true});
  }
}

export default NotificationController;
