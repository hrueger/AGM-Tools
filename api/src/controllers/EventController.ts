import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { Event } from "../entity/Event";
import { User } from "../entity/User";

class EventController {
    public static listAll = async (req: Request, res: Response) => {
        const eventRepository = getRepository(Event);
        const events = await eventRepository.find({ relations: ["creator"] });
        res.send(events);
    }

    public static newEvent = async (req: Request, res: Response) => {
        const eventRepository = getRepository(Event);
        const {
            startDate, endDate, headline, description, location, important,
        } = req.body;
        if (!(description && headline && location && startDate && endDate)) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
            return;
        }
        const event = new Event();
        event.description = description;
        event.end = endDate;
        event.start = startDate;
        event.headline = headline;
        event.location = location;
        event.creator = await getRepository(User).findOne(res.locals.jwtPayload.userId);

        const errors = await validate(event);
        if (errors.length > 0) {
            const ers = errors.map((e) => e.toString);
            res.status(400).send({ message: ers.join(", ") });
            return;
        }
        let id;
        try {
            id = (await eventRepository.save(event)).id;
        } catch (e) {
            res.status(500).send({ message: i18n.__("errors.errorWhileSavingEvent") });
            return;
        }

        if (important) {
            // ToDo
        }

        res.status(200).send({ status: true, id });
    }

    public static updateEvent = async (req: Request, res: Response) => {
        const eventRepository = getRepository(Event);
        const {
            description, headline, location, startDate, endDate,
        } = req.body;
        if (!(description && headline && location && startDate && endDate)) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
            return;
        }
        let event: Event;
        try {
            event = await eventRepository.findOneOrFail(req.params.id, { relations: ["creator"] });
        } catch {
            res.status(404).send({ message: i18n.__("errors.eventNotFound") });
            return;
        }
        event.description = description;
        event.headline = headline;
        event.start = startDate;
        event.end = endDate;
        event.location = location;

        const errors = await validate(event);
        if (errors.length > 0) {
            const ers = errors.map((e) => e.toString);
            res.status(400).send({ message: ers.join(", ") });
            return;
        }

        try {
            await eventRepository.save(event);
        } catch (e) {
            res.status(500).send({ message: i18n.__("errors.errorWhileUpdatingEvent") });
            return;
        }

        res.status(200).send({ status: true });
    }

    public static deleteEvent = async (req: Request, res: Response) => {
        const { id } = req.params;
        const eventRepository = getRepository(Event);
        try {
            await eventRepository.delete(id);
        } catch (e) {
            res.status(500).send({ message: i18n.__("errors.errorWhileDeletingEvent") });
            return;
        }

        res.status(200).send({ status: true });
    }
}

export default EventController;
