import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import * as path from "path";
import { getRepository } from "typeorm";
import { PATHS } from "..";
import { Template } from "../entity/Template";
import { User } from "../entity/User";
import { RequestWithFiles } from "../utils/iRequestWithFiles";
import { genID } from "../utils/utils";

class TemplateController {
    public static listAll = async (req: Request, res: Response) => {
        const templateRepository = getRepository(Template);
        const templates = await templateRepository.find({ relations: ["creator"] });
        res.send(templates);
    }

    public static getFile = async (req: RequestWithFiles, res: Response) => {
        res.sendFile(path.join(PATHS.templates, req.params.filename));
    }

    public static newTemplate = async (req: RequestWithFiles, res: Response) => {
        const templateRepository = getRepository(Template);
        const { name, description, group } = req.body;
        const filenameparts = req.files.file.name.split(".");
        const filename = `${genID(15)}.${filenameparts[filenameparts.length - 1]}`;
        req.files.file.mv(path.join(PATHS.templates, filename));
        if (!(description && name && group)) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
            return;
        }
        const template = new Template();
        template.description = description;
        template.name = name;
        template.group = group;
        template.filename = filename;
        template.creator = await getRepository(User).findOne(res.locals.jwtPayload.userId);

        const errors = await validate(template);
        if (errors.length > 0) {
            const ers = errors.map((e) => e.toString);
            res.status(400).send({ message: ers.join(", ") });
            return;
        }
        try {
            await templateRepository.save(template);
        } catch (e) {
            res.status(500).send({ message: i18n.__("errors.errorWhileSavingTemplate") });
            return;
        }
        res.status(200).send({ status: true });
    }

    public static deleteTemplate = async (req: Request, res: Response) => {
        const { id } = req.params;
        const templateRepository = getRepository(Template);
        try {
            await templateRepository.delete(id);
        } catch (e) {
            res.status(500).send({ message: i18n.__("errors.errorWhileDeletingTemplate") });
            return;
        }

        res.status(200).send({ status: true });
    }
}

export default TemplateController;
