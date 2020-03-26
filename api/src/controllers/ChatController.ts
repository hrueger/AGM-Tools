import { Request, Response } from "express";
import * as i18n from "i18n";
import fetch from "node-fetch";
import { Brackets, getRepository } from "typeorm";
import { config } from "../config/config";
import { Message } from "../entity/Message";
import { Project } from "../entity/Project";
import { User } from "../entity/User";
import { getFirstname } from "../utils/utils";

class ChatController {
    public static listAll = async (req: Request, res: Response) => {
        const projectRepository = getRepository(Project);
        const userRepository = getRepository(User);
        const messageRepository = getRepository(Message);
        let users = await userRepository.find({ select: ["username", "id", "lastOnline"] });
        users = users.filter((user) => user.id != res.locals.jwtPayload.userId);
        let projects = await projectRepository.find({ select: ["name", "id"], relations: ["users"] });
        projects = projects.filter((project) => project.users.map(
            (user) => user.id,
        ).includes(res.locals.jwtPayload.userId));
        let chats = [];
        for (const user of users) {
            const latestMessage = await messageRepository.createQueryBuilder("message")
                .innerJoinAndSelect("message.toUser", "toUser")
                .innerJoinAndSelect("message.sender", "sender")
                .where(new Brackets((qb) => {
                    qb.where("toUser.id = :toUserId1", { toUserId1: res.locals.jwtPayload.userId })
                        .andWhere("sender.id = :senderId1", { senderId1: user.id });
                }))
                .orWhere(new Brackets((qb) => {
                    qb.where("sender.id = :senderId2", { senderId2: res.locals.jwtPayload.userId })
                        .andWhere("toUser.id = :toUserId2", { toUserId2: user.id });
                }))
                .orderBy("message.date", "DESC")
                .getOne();
            chats.push({
                name: user.username,
                id: user.id,
                isUser: true,
                lastOnline: user.lastOnline ? user.lastOnline : undefined,
                latestMessage: latestMessage ? `${latestMessage.sender.id != res.locals.jwtPayload.userId ? `${getFirstname(latestMessage.sender.username)}: ` : ""}${ChatController.decodeMessage(latestMessage).content}` : "Noch keine Nachrichten gesendet!",
                // if message from current user
                latestMessageStatus: latestMessage && latestMessage.sender.id == res.locals.jwtPayload.userId ? "sent" : undefined,
                when: latestMessage ? latestMessage.date : undefined,
            });
        }
        for (const project of projects) {
            const latestMessage = await messageRepository.find({
                take: 1,
                order: { date: "DESC" },
                where: { toProject: project },
                relations: ["sender"],
            });
            chats.push({
                id: project.id,
                isUser: false,
                name: project.name,
                users: project.users.map((user) => user.username).join(", "),
                latestMessage: latestMessage && latestMessage[0] ? `${latestMessage[0].sender.id != res.locals.jwtPayload.userId ? `${latestMessage[0].sender.username}: ` : ""}${ChatController.decodeMessage(latestMessage[0]).content}` : "Noch keine Nachrichten gesendet!",
                // if message from current user
                latestMessageStatus: latestMessage && latestMessage[0] && latestMessage[0].sender.id == res.locals.jwtPayload.userId ? "sent" : undefined,
                when: latestMessage && latestMessage[0] ? latestMessage[0].date : undefined,
            });
        }
        const chatsWithoutDate = chats.filter((c) => !c.when);
        chats = chats.filter((c) => c.when);

        chats = chats.sort((a, b) => {
            if (a.when > b.when) {
                return -1;
            }
            if (a.when < b.when) {
                return 1;
            }
            if (a.when == b.when) {
                return 0;
            }
            return undefined;
        });
        chats.push(...chatsWithoutDate);
        res.send(chats);
    }

    public static getUserChat = async (req: Request, res: Response) => {
        const messageRepository = getRepository(Message);
        let messages = await messageRepository.createQueryBuilder("message")
            .innerJoinAndSelect("message.toUser", "toUser")
            .innerJoinAndSelect("message.sender", "sender")
            .where(new Brackets((qb) => {
                qb.where("toUser.id = :toUserId1", { toUserId1: res.locals.jwtPayload.userId })
                    .andWhere("sender.id = :senderId1", { senderId1: req.params.id });
            }))
            .orWhere(new Brackets((qb) => {
                qb.where("sender.id = :senderId2", { senderId2: res.locals.jwtPayload.userId })
                    .andWhere("toUser.id = :toUserId2", { toUserId2: req.params.id });
            }))
            .orderBy("message.date", "ASC")
            .getMany();
        messages = ChatController.addFromMeAttr(messages, res);
        messages = ChatController.decodeMessages(messages);
        res.send(messages);
    }

    public static getProjectChat = async (req: Request, res: Response) => {
        const messageRepository = getRepository(Message);
        let messages = await messageRepository.createQueryBuilder("message")
            .innerJoinAndSelect("message.toProject", "toProject")
            .innerJoinAndSelect("message.sender", "sender")
            .where("toProject.id = :toProjectId", { toProjectId: req.params.id })
            .orderBy("message.date", "ASC")
            .getMany();
        messages = ChatController.addFromMeAttr(messages, res);
        messages = ChatController.decodeMessages(messages);
        res.send(messages);
    }

    public static sendUserMessage = async (req: Request, res: Response) => {
        await ChatController.sendMessage(req, res, true, false);
    }

    public static sendProjectMessage = async (req: Request, res: Response) => {
        await ChatController.sendMessage(req, res, false, false);
    }

    public static sendAttachmentUserMessage = async (req: Request, res: Response) => {
        await ChatController.sendMessage(req, res, true, true);
    }

    public static sendAttachmentProjectMessage = async (req: Request, res: Response) => {
        await ChatController.sendMessage(req, res, false, true);
    }

    public static mapProxy = async (req: Request, res: Response) => {
        const parts = req.params.location.split(",");
        const location = `${parts[1]},${parts[0]}`;
        fetch(`https://api.mapbox.com/v4/mapbox.streets/pin-l-marker+ff0000(\
        ${location})/${location},15/600x300.png?access_token=${config.mapboxApiKey}`).then((r) => r.body.pipe(res));
    }

    private static sendMessage = async (req: Request,
        res: Response, toUser: boolean, withAttachment: boolean) => {
        const { message } = req.body;
        if (!message && !withAttachment) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
            return;
        }
        try {
            const messageRepository = getRepository(Message);
            const userRepository = getRepository(User);
            const projectRepository = getRepository(Project);
            const msg = new Message();
            if (!withAttachment) {
                msg.content = Buffer.from(message).toString("base64");
            } else if (message.locationLat && message.locationLong) {
                msg.locationLat = message.locationLat;
                msg.locationLong = message.locationLong;
            }
            msg.sender = await userRepository.findOneOrFail(res.locals.jwtPayload.userId);
            if (toUser) {
                msg.toUser = await userRepository.findOneOrFail(req.params.id);
            } else {
                msg.toProject = await projectRepository.findOneOrFail(req.params.id);
            }
            messageRepository.save(msg);
            res.send({ status: true });
        } catch (e) {
            res.status(500).send({ message: `${i18n.__("errors.errorWhileSendingMessage")} ${e.toString()}` });
        }
    }

    private static addFromMeAttr(messages: Message[], res: Response) {
        for (const message of messages) {
            message.fromMe = (message.sender.id == res.locals.jwtPayload.userId);
        }
        return messages;
    }

    private static decodeMessages(messages: Message[]) {
        for (const message of messages) {
            this.decodeMessage(message);
        }
        return messages;
    }
    private static decodeMessage(message: Message) {
        message.content = Buffer.from(message.content, "base64").toString("utf8");
        return message;
    }
}

export default ChatController;
