import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Event } from "../entity/Event";
import { User } from "../entity/User";

class EventController {
  public static listAll = async (req: Request, res: Response) => {
    const eventRepository = getRepository(Event);
    const events = await eventRepository.find({relations: ["creator"]});
    res.send(events);
  }

  public static newEvent = async (req: Request, res: Response) => {
    const eventRepository = getRepository(Event);
    const { startDate, endDate, headline, description, location, important} = req.body;
    if (!(description && headline && location && startDate && endDate)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
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
      res.status(400).send({message: ers.join(", ")});
      return;
    }
    let id;
    try {
      id = (await eventRepository.save(event)).id;
    } catch (e) {
      res.status(500).send({message: "Fehler beim Speichern des Events!"});
      return;
    }

    res.status(200).send({status: true, id});
  }

  public static updateEvent = async (req: Request, res: Response) => {
    const eventRepository = getRepository(Event);
    const { description, headline, location, startDate, endDate } = req.body;
    if (!(description && headline && location && startDate && endDate)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
      return;
    }
    let event: Event;
    try {
      event = await eventRepository.findOneOrFail(req.params.id, {relations: ["creator"]});
    } catch {
      res.status(404).send({message: "Event nicht gefunden!"});
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
      res.status(400).send({message: ers.join(", ")});
      return;
    }

    try {
      await eventRepository.save(event);
    } catch (e) {
      res.status(500).send({message: "Fehler beim Aktualisieren des Events!"});
      return;
    }

    res.status(200).send({status: true});
  }

  public static deleteEvent = async (req: Request, res: Response) => {
    const id = req.params.id;

    const eventRepository = getRepository(Event);
    let event: Event;
    try {
      event = await eventRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: "Event nicht gefunden!"});
      return;
    }
    eventRepository.delete(id);

    res.status(200).send({status: true});
  }
}

export default EventController;
