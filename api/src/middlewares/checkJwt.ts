import { NextFunction, Request, Response } from "express";
import * as i18n from "i18n";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { config } from "../config/config";
import SettingsController from "../controllers/SettingsController";
import { User } from "../entity/User";

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    // Get the jwt token from the head
    let token = req.headers.authorization as string;
    if (!token) {
        token = req.query.authorization;
    }
    if (!token) {
        res.status(401).send({ message: i18n.__("errors.unauthorized") });
        return;
    }
    token = token.replace("Bearer ", "");
    let jwtPayload;

    // Try to validate the token and get data
    try {
        jwtPayload = (jwt.verify(token, config.jwtSecret) as any);
        res.locals.jwtPayload = jwtPayload;
        res.locals.jwtPayload.userId = parseInt(res.locals.jwtPayload.userId, undefined);
        const userRepository = getRepository(User);
        const user = await userRepository.findOne(res.locals.jwtPayload.userId);
        if (user) {
            user.lastOnline = new Date();
            await userRepository.save(user);
        }
        res.locals.language = await SettingsController.getUserLanguage(res);
        i18n.setLocale(res.locals.language);
    } catch (error) {
    // If token is not valid, respond with 401 (unauthorized)
        res.status(401).send({ message: i18n.__("errors.sessionExpired"), logout: true });
        return;
    }

    // The token is valid for 12 hours, because of long uploads
    // We want to send a new token on every request
    const { userId, username } = jwtPayload;
    const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
        expiresIn: "12h",
    });
    res.setHeader("Authorization", newToken);

    // Call the next middleware or controller
    next();
};
