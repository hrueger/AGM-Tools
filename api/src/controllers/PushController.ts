import { Request, Response } from "express";
import { getRepository } from "typeorm";
import * as i18n from "i18n";
import { User } from "../entity/User";
import { Device } from "../entity/Device";

class PushController {
    public static updateToken = async (req: Request, res: Response) => {
        // Get parameters from the body
        const {
            token, device, os, software,
        } = req.body;

        if (!(token && device && os && software)) {
            res.status(400).send({ message: i18n.__("errors.notAllFieldsProvided") });
            return;
        }
        const userRepository = getRepository(User);
        const deviceRepository = getRepository(Device);
        try {
            const user = await userRepository.findOneOrFail(res.locals.jwtPayload.userId);
            let pushToken = await deviceRepository.findOne({ where: { token } });
            if (!pushToken) {
                pushToken = new Device();
                pushToken.device = device;
                pushToken.os = os;
                pushToken.software = software;
                pushToken.token = token;
                pushToken.user = user;
                await deviceRepository.save(pushToken);
            }
        } catch (e) {
            res.status(500).send({ message: i18n.__("errors.error") });
            return;
        }

        res.status(200).send({ status: true });
    }

    public static getDevices = async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const deviceRepository = getRepository(Device);
        try {
            const user = await userRepository.findOneOrFail(res.locals.jwtPayload.userId);
            const devices = await deviceRepository.find({ where: { user } });
            for (const device of devices) {
                delete device.token;
            }
            res.send(devices);
        } catch (e) {
            res.status(500).send({ message: i18n.__("errors.error") });
        }
    }
}

export default PushController;
