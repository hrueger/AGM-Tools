import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { Usergroup } from "../entity/Usergroup";

class UserController {
  public static listAll = async (req: Request, res: Response) => {
    // Get users from database
    const userRepository = getRepository(User);
    const users = await userRepository.find({
      relations: ["usergroup"],
      select: ["id", "username", "usergroup", "email"],
    });

    // Send the users object
    res.send(users);
  }

  public static newUser = async (req: Request, res: Response) => {
    // Get parameters from the body
    const { username, pw, pw2, email, usergroup } = req.body;

    if (!(username && email && pw && pw2 && usergroup)) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    if (pw != pw2) {
      res.status(400).send({message: i18n.__("errors.passwordsDontMatch")});
      return;
    }

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = pw;
    try {
      user.usergroup = await getRepository(Usergroup).findOne({where: { name: usergroup}});
    } catch {
      res.status(400).send({message: i18n.__("errors.usergroupDoesNotExist")});
      return;
    }

    // Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    user.hashPassword();

    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send({message: i18n.__("errors.existingUsername")});
      return;
    }

    res.status(200).send({status: true});
  }

  public static editCurrent = async (req: Request, res: Response) => {
    const id = res.locals.jwtPayload.userId;

    const { username, email, pwNew, pwNew2, pwOld } = req.body;

    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.createQueryBuilder("user")
        .addSelect("user.password")
        .where("user.id = :id", { id })
        .getOne();
    } catch (error) {
      res.status(404).send({message: i18n.__("errors.userNotFound")});
      return;
    }

    if (!(username && email && pwOld)) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
    }

    if (pwNew != pwNew2) {
      res.status(400).send({message: i18n.__("errors.passwordsDontMatch")});
      return;
    }

    if (!user.checkIfUnencryptedPasswordIsValid(pwOld)) {
      res.status(401).send({message: i18n.__("errors.oldPasswordWrong")});
      return;
    }

    // Validate the new values on model
    user.username = username;
    user.email = email;
    if (pwNew && pwNew2) {
      user.password = pwNew;
      user.hashPassword();
    }
    const errors = await validate(user);
    if (errors.length > 0) {
      const ers = errors.map((e) => e.toString);
      res.status(400).send({message: ers.join(", ")});
      return;
    }

    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send({message: i18n.__("errors.existingUsername")});
      return;
    }

    res.status(200).send({status: true});
  }

  public static deleteUser = async (req: Request, res: Response) => {

    const id = req.params.id;

    const userRepository = getRepository(User);
    try {
      await userRepository.delete(id);
    } catch (e) {
      res.status(500).send({message: i18n.__("errors.errorWhileDeletingUser")});
      return;
    }

    res.status(200).send({status: true});
  }
}

export default UserController;
