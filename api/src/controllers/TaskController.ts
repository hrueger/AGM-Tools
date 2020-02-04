import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { config } from "../config/config";
import { Project } from "../entity/Project";
import { Task } from "../entity/Task";
import { User } from "../entity/User";
import { sendMultipleMails } from "../utils/mailer";

class TaskController {
  public static newTask = async (req: Request, res: Response) => {
    const taskRepository = getRepository(Task);
    const { title, description, users, due} = req.body;
    if (!(title && description && users && due)) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    const task = new Task();
    task.description = description;
    task.title = title;
    task.due = new Date(due);
    task.users = [];
    try {
      for (const userId of users) {
        const u = await getRepository(User).findOneOrFail(parseInt(userId, undefined));
        task.users.push(u);
      }
    } catch {
      res.status(500).send({message: i18n.__("errors.errorWhileAddingUser")});
    }
    task.creator = await getRepository(User).findOne(res.locals.jwtPayload.userId);
    task.project = await getRepository(Project).findOne(req.query.pid);

    try {
      await taskRepository.save(task);
    } catch (e) {
      res.status(500).send({message: i18n.__("errors.errorWhileSavingTask")});
      return;
    }

    sendMultipleMails(task.users.map((u) => u.email), {
      btnText: i18n.__("tasks.viewTask"),
      btnUrl: `${config.url}projects/${task.project.id}`,
      cardSubtitle: "",
      cardTitle: i18n.__("tasks.dueOn").replace("%s", task.due.toLocaleDateString()),
      content: task.description.replace(new RegExp("\n", "g"), "<br>"),
      secondTitle: i18n.__("tasks.project").replace("%s", task.project.name),
      subject: i18n.__("tasks.newTask").replace("%s", task.title),
      subtitle: i18n.__("tasks.by").replace("%s", task.creator.username),
      summary: i18n.__("tasks.newTaskBy").replace("%s", task.title).replace("%s", task.creator.username),
      title: i18n.__("tasks.newTask").replace("%s", task.title),
    });

    res.status(200).send({status: true});
  }

  /*public static deleteTask = async (req: Request, res: Response) => {
    const id = req.params.id;
    const taskRepository = getRepository(Task);
    try {
      await taskRepository.delete(id);
    } catch (e) {
      res.status(500).send({message: i18n.__("errors.errorWhileDeletingTask")});
      return;
    }

    res.status(200).send({status: true});
  }*/
}

export default TaskController;
