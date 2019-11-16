import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";

import { User } from "../entity/User";

export const checkPermission = (permissions: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Get the user ID from previous midleware
    const id = res.locals.jwtPayload.userId;

    //Get user role from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    //Check if array of authorized roles includes the user's role

    let allGranted = true;
    permissions.forEach((permission) => {
      if (!user.usergroup[permission]) {
        allGranted = false;
      }
    });
    
    if (allGranted) next();
    else res.status(401).send();
  };
};