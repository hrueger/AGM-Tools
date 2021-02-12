import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import * as path from "path";
import { getRepository } from "typeorm";
import * as fs from "fs";
import { Tutorial } from "../entity/Tutorial";
import { TutorialStep } from "../entity/TutorialStep";
import { User } from "../entity/User";
import { genID } from "../utils/utils";
import { PATHS } from "..";

class TutorialController {
    public static listAll = async (req: Request, res: Response) => {
        const tutorialRepository = getRepository(Tutorial);
        const tutorials = await tutorialRepository.find({ relations: ["creator"] });
        tutorials.forEach((t) => {
            if (t.creator.id == res.locals.jwtPayload.userId) {
                t.editable = true;
            }
            t.creator = undefined;
        });
        res.send(tutorials);
    }
    public static forProject = async (req: Request, res: Response) => {
        const pid = parseInt(req.params.pid, undefined);
        const tutorialRepository = getRepository(Tutorial);
        let tutorials = await tutorialRepository.find({ relations: ["creator", "projects"] });
        tutorials.forEach((t) => {
            if (t.creator.id == res.locals.jwtPayload.userId) {
                t.editable = true;
            }
            t.creator = undefined;
        });
        tutorials = tutorials.filter((tutorial) => (
            tutorial.projects.filter((project) => project.id == pid).length > 0));
        res.send(tutorials);
    }
    public static getTutorial = async (req: Request, res: Response) => {
        const tutorialRepository = getRepository(Tutorial);
        let tutorial: Tutorial;
        try {
            tutorial = await tutorialRepository.findOneOrFail(req.params.id, { relations: ["steps"] });
        } catch {
            res.status(404).send({ message: "Tutorial nicht gefunden!" });
            return;
        }
        res.send(tutorial);
    }

    public static newTutorial = async (req: Request, res: Response) => {
        const tutorialRepository = getRepository(Tutorial);
        const { description, title } = req.body;
        if (!(description && title)) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
            return;
        }
        const tutorial = new Tutorial();
        tutorial.description = description;
        tutorial.title = title;
        tutorial.creator = await getRepository(User).findOne(res.locals.jwtPayload.userId);

        const errors = await validate(tutorial);
        if (errors.length > 0) {
            const ers = errors.map((e) => e.toString);
            res.status(400).send({ message: ers.join(", ") });
            return;
        }

        try {
            await tutorialRepository.save(tutorial);
        } catch (e) {
            res.status(409).send({ message: i18n.__("errors.errorWhileSavingTutorial") });
            return;
        }

        res.status(200).send({ status: true });
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
            res.status(400).send({ message: ers.join(", ") });
            return;
        }

        try {
            await stepRepository.save(step);
        } catch (e) {
            res.status(409).send({ message: i18n.__("errors.errorWhileSavingTutorialStep") });
            return;
        }

        res.status(200).send({ status: true });
    }

    public static updateTutorial = async (req: Request, res: Response) => {
        const tutorialRepository = getRepository(Tutorial);
        const { description, title } = req.body;
        if (!(description && title)) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
            return;
        }
        let tutorial: Tutorial;
        try {
            tutorial = await tutorialRepository.findOneOrFail(req.params.id, { relations: ["creator"] });
        } catch {
            res.status(404).send({ message: i18n.__("errors.tutorialNotFound") });
            return;
        }
        if (tutorial.creator.id != res.locals.jwtPayload.userId) {
            res.status(401).send({ message: i18n.__("errors.notAllowed") });
            return;
        }
        tutorial.description = description;
        tutorial.title = title;

        const errors = await validate(tutorial);
        if (errors.length > 0) {
            const ers = errors.map((e) => e.toString);
            res.status(400).send({ message: ers.join(", ") });
            return;
        }

        try {
            await tutorialRepository.save(tutorial);
        } catch (e) {
            res.status(409).send({ message: i18n.__("errors.errorWhileUpdatingTutorial") });
            return;
        }

        res.status(200).send({ status: true });
    }

    public static updateStep = async (req: Request, res: Response) => {
        const stepRepository = getRepository(TutorialStep);
        const {
            content, title, image1, image2, image3,
        } = req.body;
        if (!title) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
            return;
        }
        let step: TutorialStep;
        try {
            step = await stepRepository.findOneOrFail(req.params.id);
        } catch {
            res.status(404).send({ message: i18n.__("errors.tutorialStepNotFound") });
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
            res.status(400).send({ message: ers.join(", ") });
            return;
        }

        try {
            await stepRepository.save(step);
        } catch (e) {
            res.status(409).send({ message: i18n.__("errors.errorWhileUpdatingTutorialStep") });
            return;
        }

        res.status(200).send({ status: true });
    }

    public static deleteStep = async (req: Request, res: Response) => {
        const { id } = req.params;

        const stepRepository = getRepository(TutorialStep);
        try {
            await stepRepository.delete(id);
        } catch (e) {
            res.status(500).send({ message: i18n.__("errors.errorWhileDeletingTutorialStep") });
            return;
        }

        res.status(200).send({ status: true });
    }

    public static uploadFile = async (req: Request, res: Response) => {
        if (!req.body.file) {
            res.status(400).send(i18n.__("errors.notAllFieldsProvided"));
            return;
        }

        const mimetypes = ["image/png", "image/jpg", "image/jpeg"];

        for (const mime of mimetypes) {
            const beginning = `data:${mime};base64,`;
            if (req.body.file.startsWith(beginning)) {
                const imageBuffer = Buffer.from(req.body.file.replace(beginning, ""), "base64");
                const ext = mime.split("/")[1];
                const newFilename = `${genID()}.${ext}`;
                fs.writeFileSync(path.join(PATHS.tutorials, newFilename),
                    imageBuffer);
                res.send({ status: true, image: newFilename });
                return;
            }
        }
        res.status(500).send({ message: i18n.__("errors.errorWhileSavingFile") });
    }

    public static viewFile = async (req: Request, res: Response) => {
        res.sendFile(path.join(
            PATHS.tutorials, path.basename(req.params.filename),
        ));
    }
}

export default TutorialController;
