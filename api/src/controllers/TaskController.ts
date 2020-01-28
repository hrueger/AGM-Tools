import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { Project } from "../entity/Project";
import { Task } from "../entity/Task";
import { User } from "../entity/User";

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
      console.log(e);
      res.status(500).send({message: i18n.__("errors.errorWhileSavingTask")});
      return;
    }

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
