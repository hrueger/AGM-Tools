import { validate } from "class-validator";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { getRepository } from "typeorm";
import config from "../config/config";
import { Project } from "../entity/Project";
import { User } from "../entity/User";

class ProjectController {
  public static listAll = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const projects = await projectRepository.find({relations: ["users"]});
    res.send(projects);
  }

  public static newProject = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const { users, name, description } = req.body;
    if (!(description && name && users)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
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
      res.status(500).send({message: "Fehler beim Hinzufügen der Benutzer!"});
    }

    let id;
    try {
      id = (await projectRepository.save(project)).id;
    } catch (e) {
      res.status(500).send({message: "Fehler beim Speichern des Projects!"});
      return;
    }

    fs.mkdirSync(path.join(config.storagePath, id.toString()));
    res.status(200).send({status: true});
  }

  public static updateProject = async (req: Request, res: Response) => {
    const projectRepository = getRepository(Project);
    const { description, name, users } = req.body;
    if (!(description && name && users)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
      return;
    }
    let project: Project;
    try {
      project = await projectRepository.findOneOrFail(req.params.id, {relations: ["users"]});
    } catch {
      res.status(404).send({message: "Project nicht gefunden!"});
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
      res.status(500).send({message: "Fehler beim Aktualisieren des Projects!"});
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
      res.status(500).send({message: "Fehler beim Löschen!"});
      return;
    }

    res.status(200).send({status: true});
  }
}

export default ProjectController;
