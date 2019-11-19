import { validate } from "class-validator";
import { Request, Response } from "express";
import { FindOperator, getRepository } from "typeorm";

import * as path from "path";
import config from "../config/config";
import { Tutorial } from "../entity/Tutorial";
import { TutorialStep } from "../entity/TutorialStep";
import { User } from "../entity/User";

class TutorialController {
  public static listAll = async (req: Request, res: Response) => {
    const tutorialRepository = getRepository(Tutorial);
    const tutorials = await tutorialRepository.find({relations: ["creator"]});
    tutorials.forEach((t) => {
      if (t.creator.id == res.locals.jwtPayload.userId) {
        t.editable = true;
      }
      t.creator = undefined;
    });
    res.send(tutorials);
  }
  public static getTutorial = async (req: Request, res: Response) => {
    const tutorialRepository = getRepository(Tutorial);
    let tutorial: Tutorial;
    try {
      tutorial = await tutorialRepository.findOneOrFail(req.params.id, { relations: ["steps"]});
    } catch {
      res.status(404).send({message: "Tutorial nicht gefunden!"});
      return;
    }
    res.send(tutorial);
  }

  public static newTutorial = async (req: Request, res: Response) => {
    const tutorialRepository = getRepository(Tutorial);
    const { description, title } = req.body;
    if (!(description && title)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
      return;
    }
    const tutorial = new Tutorial();
    tutorial.description = description;
    tutorial.title = title;
    tutorial.creator = await getRepository(User).findOne(res.locals.jwtPayload.userId);

    const errors = await validate(tutorial);
    if (errors.length > 0) {
      const ers = errors.map((e) => e.toString);
      res.status(400).send({message: ers.join(", ")});
      return;
    }

    try {
      await tutorialRepository.save(tutorial);
    } catch (e) {
      res.status(409).send({message: "Fehler beim Speichern des Tutorials!"});
      return;
    }

    res.status(200).send({status: true});
  }

  public static createStep = async (req: Request, res: Response) => {
    const stepRepository = getRepository(TutorialStep);
    const step = new TutorialStep();
    step.content = "";
    step.title = "Titel";
    step.tutorial = await getRepository(Tutorial).findOne(req.params.tutorialId);

    const errors = await validate(step);
    if (errors.length > 0) {
      const ers = errors.map((e) => e.toString);
      res.status(400).send({message: ers.join(", ")});
      return;
    }

    try {
      await stepRepository.save(step);
    } catch (e) {
      res.status(409).send({message: "Fehler beim Speichern des Schritts!"});
      return;
    }

    res.status(200).send({status: true});
  }

  public static updateTutorial = async (req: Request, res: Response) => {
    const tutorialRepository = getRepository(Tutorial);
    const { description, title } = req.body;
    if (!(description && title)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
      return;
    }
    let tutorial: Tutorial;
    try {
      tutorial = await tutorialRepository.findOneOrFail(req.params.id, {relations: ["creator"]});
    } catch {
      res.status(404).send({message: "Tutorial nicht gefunden!"});
      return;
    }
    if (tutorial.creator.id != res.locals.jwtPayload.userId) {
      res.status(401).send({message: "Diese Aktion ist nicht erlaubt!"});
      return;
    }
    tutorial.description = description;
    tutorial.title = title;

    const errors = await validate(tutorial);
    if (errors.length > 0) {
      const ers = errors.map((e) => e.toString);
      res.status(400).send({message: ers.join(", ")});
      return;
    }

    try {
      await tutorialRepository.save(tutorial);
    } catch (e) {
      res.status(409).send({message: "Fehler beim Aktualisieren des Tutorials!"});
      return;
    }

    res.status(200).send({status: true});
  }

  public static updateStep = async (req: Request, res: Response) => {
    const stepRepository = getRepository(TutorialStep);
    const { content, title, image1, image2, image3 } = req.body;
    if (!title) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
      return;
    }
    let step: TutorialStep;
    try {
      step = await stepRepository.findOneOrFail(req.params.id);
    } catch {
      res.status(404).send({message: "Schritt nicht gefunden!"});
      return;
    }
    step.content = content;
    step.title = title;
    step.image1 = image1;
    step.image2 = image2;
    step.image3 = image3;

    const errors = await validate(step);
    if (errors.length > 0) {
      const ers = errors.map((e) => e.toString);
      res.status(400).send({message: ers.join(", ")});
      return;
    }

    try {
      await stepRepository.save(step);
    } catch (e) {
      res.status(409).send({message: "Fehler beim Aktualisieren des Schritts!"});
      return;
    }

    res.status(200).send({status: true});
  }

  public static deleteStep = async (req: Request, res: Response) => {
    const id = req.params.id;

    const stepRepository = getRepository(TutorialStep);
    let step: TutorialStep;
    try {
      step = await stepRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: "Schritt nicht gefunden!"});
      return;
    }
    stepRepository.delete(id);

    res.status(200).send({status: true});
  }

  public static uploadFile = async (req: Request, res: Response) => {

    // @ts-ignore
    const newFilename = `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}${path.extname(req.files.file.name)}`;
    // @ts-ignore
    req.files.file.mv(path.join(config.tutorialFilesStoragePath, newFilename), (err) => {
      if (err) {
        res.status(500).send({message: `Fehler beim Speichern der Datei, Error: ${err.toString()}`});
      } else {
        res.send({status: true, image: newFilename});
      }
    });
  }

  public static viewFile = async (req: Request, res: Response) => {
    res.sendFile(path.join(config.tutorialFilesStoragePath, path.basename(req.params.filename)));
  }
}

export default TutorialController;
