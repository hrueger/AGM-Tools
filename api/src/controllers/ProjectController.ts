import { validate } from "class-validator";
import { Request, Response } from "express";
import * as fs from "fs";
import * as i18n from "i18n";
import * as path from "path";
import { getRepository } from "typeorm";
import config from "../config/config";
import { File } from "../entity/File";
import { Message } from "../entity/Message";
import { Project } from "../entity/Project";
import { Tutorial } from "../entity/Tutorial";
import { User } from "../entity/User";
import { getStoragePath, howLongAgo } from "../utils/utils";

class ProjectController {
  public static listAll = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const messageRepository = getRepository(Message);
    const fileRepository = getRepository(File);
    const projects = await projectRepository.find({relations: ["users", "tutorials", "linkedFiles"]}) as any;
    for (const project of projects) {
      const options: any = {
        order: {
          date: "ASC",
        },
        relations: ["sender"],
        where: {
          toProject: project,
        },
      };
      let lastMessage = await messageRepository.findOne(options);
      const messageCount = await messageRepository.count({
        order: {
          date: "ASC",
        },
        relations: ["sender"],
        where: {
          toProject: project,
        },
      });
      if (!lastMessage) {
        lastMessage = new Message();
        lastMessage.content = i18n.__("errors.noMessagesSent");
      } else {
        lastMessage.content = Buffer.from(lastMessage.content, "base64").toString("utf8");
      }

      project.tips = [];
      if (!await ProjectController.getProjectImageStoragePath(project.id, true)) {
        project.tips.push(i18n.__("tips.addProjectLogo"));
      }

      project.chat = {
        data: [(lastMessage.sender ? `${lastMessage.sender.username}: ` : "") + lastMessage.content],
        lastUpdated: lastMessage.date ? howLongAgo(lastMessage.date) : undefined,
      };
      project.tasks = {
        data: [],
        lastUpdated: howLongAgo(new Date()),
      };
      project.tutorials = {
        data: project.tutorials,
        lastUpdated: howLongAgo(new Date()),
      };

      project.files = {
        data: project.linkedFiles,
        lastUpdated: howLongAgo(new Date()),
      };
      project.linkedFiles = undefined;
    }
    res.send(projects);
  }

  public static newProject = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const { users, name, description } = req.body;
    if (!(description && name && users)) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    const project = new Project();
    project.description = description;
    project.name = name;
    project.users = [];
    try {
      for (const userId of users) {
        const u = await getRepository(User).findOneOrFail(parseInt(userId, undefined));
        project.users.push(u);
      }
    } catch {
      res.status(500).send({message: i18n.__("errors.errorWhileAddingUser")});
    }

    let id;
    try {
      id = (await projectRepository.save(project)).id;
    } catch (e) {
      res.status(500).send({message: i18n.__("errors.errorWhileSavingProject")});
      return;
    }

    fs.mkdirSync(path.join(config.storagePath, id.toString()));
    res.status(200).send({status: true});
  }

  public static updateProject = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const { description, name, users } = req.body;
    if (!(description && name && users)) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    let project: Project;
    try {
      project = await projectRepository.findOneOrFail(req.params.id, {relations: ["users"]});
    } catch {
      res.status(404).send({message: i18n.__("errors.projectNotFound")});
      return;
    }
    project.description = description;
    for (const userId of users) {
      const u = await getRepository(User).findOneOrFail(parseInt(userId, undefined));
      project.users.push(u);
    }
    project.name = name;

    const errors = await validate(project);
    if (errors.length > 0) {
      const ers = errors.map((e) => e.toString);
      res.status(400).send({message: ers.join(", ")});
      return;
    }

    try {
      await projectRepository.save(project);
    } catch (e) {
      res.status(500).send({message: i18n.__("errors.errorWhileSavingProject")});
      return;
    }

    res.status(200).send({status: true});
  }

  public static linkTutorials = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const { tutorials } = req.body;
    if (!tutorials) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    let project: Project;
    try {
      project = await projectRepository.findOneOrFail(req.params.id, {relations: ["tutorials"]});
    } catch {
      res.status(404).send({message: i18n.__("errors.projectNotFound")});
      return;
    }
    for (const tutorialId of tutorials) {
      const t = await getRepository(Tutorial).findOneOrFail(parseInt(tutorialId, undefined));
      project.tutorials.push(t);
    }
    try {
      await projectRepository.save(project);
    } catch (e) {
      res.status(500).send({message: i18n.__("errors.errorWhileSavingProject")});
      return;
    }

    res.status(200).send({status: true});
  }

  public static linkFiles = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const { files } = req.body;
    if (!files) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    let project: Project;
    try {
      project = await projectRepository.findOneOrFail(req.params.id, {relations: ["linkedFiles"]});
    } catch {
      res.status(404).send({message: i18n.__("errors.projectNotFound")});
      return;
    }
    for (const fileId of files) {
      const f = await getRepository(File).findOneOrFail(parseInt(fileId, undefined));
      project.linkedFiles.push(f);
    }
    try {
      await projectRepository.save(project);
    } catch (e) {
      res.status(500).send({message: i18n.__("errors.errorWhileSavingProject")});
      return;
    }

    res.status(200).send({status: true});
  }

  public static deleteProject = async (req: Request, res: Response) => {
    const id = req.params.id;
    const projectRepository = getRepository(Project);
    try {
      await projectRepository.delete(id);
    } catch (e) {
      res.status(500).send({message: i18n.__("errors.errorWhileDeletingProject")});
      return;
    }

    res.status(200).send({status: true});
  }

  public static getProjectImage = async (req: Request, res: Response) => {
    const id = req.params.id;
    let file = await ProjectController.getProjectImageStoragePath(id);
    if (!file) {
      file = path.resolve("./assets/imgPlaceholder.png");
    }
    res.sendFile(file);
  }

  private static async getProjectImageStoragePath(id, falseIfNotFound = false) {
    const fileRepository = getRepository(File);
    const projectRepository = getRepository(Project);
    try {
      const project = await projectRepository.findOne(id);
      const file = await fileRepository.findOne({where: {isFolder: false,
        name: "logo.jpg", project}}); // ToDo: allow png, too
      if (file) {
        const p = await getStoragePath(file, parseInt(id, undefined));
        if (p && fs.existsSync(p)) {
          return p;
        }
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log(e);
    }
    return false;
  }
}

export default ProjectController;
