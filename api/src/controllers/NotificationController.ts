import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import * as Markdown from "markdown-it";
import { getRepository } from "typeorm";
import { Notification } from "../entity/Notification";
import { User } from "../entity/User";
import { sendMultipleMails } from "../utils/mailer";

class NotificationController {
    public static listAll = async (req: Request, res: Response) => {
        const notificationRepository = getRepository(Notification);
        const me = await getRepository(User).findOneOrFail(res.locals.jwtPayload.userId);
        const notifications = await notificationRepository.find({
            order: { createdAt: "DESC" },
            relations: ["creator", "receivers", "seenBy"],
            where: { creator: me },
        });
        res.send(notifications);
    }

    public static newNotification = async (req: Request, res: Response) => {
        const notificationRepository = getRepository(Notification);
        const {
            content, headline, receivers, theme,
        } = req.body;
        if (!(headline && content && receivers)) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
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
            res.status(500).send({ message: `${i18n.__("errors.errorWhileSendingMessage")} ${e.toString()}` });
            return;
        }
        notification.creator = await userRepo.findOne(res.locals.jwtPayload.userId);

        const errors = await validate(notification);
        if (errors.length > 0) {
            const ers = errors.map((e) => e.toString);
            res.status(400).send({ message: ers.join(", ") });
            return;
        }
        let id;
        try {
            id = (await notificationRepository.save(notification)).id;
            const md = new Markdown();
            sendMultipleMails(req.app.locals.config, notification.receivers.map((u) => u.email), {
                btnText: i18n.__("notifications.viewNotification"),
                btnUrl: `${res.app.locals.config.URL}`,
                cardSubtitle: i18n.__("notifications.goToDashboard"),
                cardTitle: "",
                content: md.render(notification.content),
                secondTitle: notification.headline,
                subject: i18n.__("notifications.newNotification").replace("%s", notification.headline),
                subtitle: i18n.__("notifications.by").replace("%s", notification.creator.username),
                summary: i18n.__("notifications.newNotificationBy")
                    .replace("%s", notification.headline).replace("%s", notification.creator.username),
                title: i18n.__("notifications.newNotification"),
            });
        } catch (e) {
            res.status(500).send({ message: `${i18n.__("errors.errorWhileSendingMessage")} ${e.toString()}` });
            return;
        }

        res.status(200).send({ status: true, id });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static seenNotification = async (req: Request, res: Response) => {
        // const { id } = req.params;
        /* const notificationRepository = getRepository(Notification);
        let notification: Notification;
        try {
            notification = await notificationRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send({ message: i18n.__("errors.notificationNotFound") });
        }
        notificationRepository.delete(id);
        res.status(200).send({ status: true }); */
    }

    public static deleteNotification = async (req: Request, res: Response) => {
        const { id } = req.params;

        const notificationRepository = getRepository(Notification);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let notification: Notification;
        try {
            notification = await notificationRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send({ message: i18n.__("errors.notificationNotFound") });
            return;
        }
        notificationRepository.delete(id);

        res.status(200).send({ status: true });
    }
}

export default NotificationController;
