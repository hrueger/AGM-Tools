import { NextFunction, Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";

import { User } from "../entity/User";

export const checkPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.jwtPayload.userId;

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id, { relations: ["usergroup"]});
    } catch (id) {
      res.status(401).send({message: i18n.__("errors.userNotFound"), logout: true});
    }

    let allGranted = true;
    permissions.forEach((permission) => {
      if (!user.usergroup[permission]) {
        allGranted = false;
      }
    });

    if (allGranted) {
      next();
    } else {
      res.status(401).send({message: i18n.__("errors.notAllowed")});
    }
  };
};
