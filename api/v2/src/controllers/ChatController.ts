import { validate } from "class-validator";
import { Request, Response } from "express";
import { Brackets, getRepository } from "typeorm";
import { Message } from "../entity/Message";
import { Project } from "../entity/Project";
import { User } from "../entity/User";

class ChatController {
  public static listAll = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const userRepository = getRepository(User);
    let users = await userRepository.find({select: ["username", "id"]});
    users = users.filter((user) => user.id != res.locals.jwtPayload.userId);
    let projects = await projectRepository.find({select: ["name", "id"], relations: ["users"]});
    projects = projects.filter((project) =>
      project.users.map((user) => user.id).includes(res.locals.jwtPayload.userId));
    const chats = [];
    users.forEach((user) => {
      chats.push({name: user.username, id: user.id, isUser: true, lastSeen: "Unbekannt"});
    });
    projects.forEach((project) => {
      chats.push({
        id: project.id,
        isUser: false,
        name: project.name,
        users: project.users.map((user) => user.username).join(", "),
      });
    });
    res.send(chats);
  }

  public static getUserChat = async (req: Request, res: Response) => {
    const messageRepository = getRepository(Message);
    const messages = await messageRepository.createQueryBuilder("message")
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
    ChatController.addFromMeAttr(messages, res);
    ChatController.decodeMessage(messages);
    res.send(messages);
  }

  public static getProjectChat = async (req: Request, res: Response) => {
    const messageRepository = getRepository(Message);
    const messages = await messageRepository.createQueryBuilder("message")
    .innerJoinAndSelect("message.toProject", "toProject")
    .innerJoinAndSelect("message.sender", "sender")
    .where("toProject.id = :toProjectId", { toProjectId: req.params.id })
    .orderBy("message.date", "ASC")
    .getMany();
    ChatController.addFromMeAttr(messages, res);
    ChatController.decodeMessage(messages);
    res.send(messages);
  }

  public static sendUserMessage = async (req: Request, res: Response) => {
    await ChatController.sendMessage(req, res, true);
  }

  public static sendProjectMessage = async (req: Request, res: Response) => {
    await ChatController.sendMessage(req, res, false);
  }

  private static sendMessage = async (req: Request, res: Response, toUser: boolean) => {
    const { message } = req.body;
    if (!message) {
      res.status(400).send({message: "Nicht alle Daten angegeben!"});
      return;
    }
    try {
      const messageRepository = getRepository(Message);
      const userRepository = getRepository(User);
      const projectRepository = getRepository(Project);
      const msg = new Message();
      msg.content = new Buffer(message).toString("base64");
      msg.sender = await userRepository.findOneOrFail(res.locals.jwtPayload.userId);
      if (toUser) {
        msg.toUser = await userRepository.findOneOrFail(req.params.id);
      } else {
        msg.toProject = await projectRepository.findOneOrFail(req.params.id);
      }
      messageRepository.save(msg);
      res.send({status: true});
    } catch (e) {
      res.status(500).send({message: "Fehler beim Senden der Nachricht!"});
      return;
    }
  }

  private static addFromMeAttr(messages: Message[], res: Response) {
    for (const message of messages) {
      message.fromMe = (message.sender.id == res.locals.jwtPayload.userId);
    }
  }

  private static decodeMessage(messages: Message[]) {
    for (const message of messages) {
      message.content = new Buffer(message.content, "base64").toString("utf8");
    }
  }
}

export default ChatController;
