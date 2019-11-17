import { validate } from "class-validator";
import { Request, Response } from "express";
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
    const { username, pw, pw2, email } = req.body;

    if (!(username && email && pw && pw2)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
      return;
    }
    if (pw != pw2) {
      res.status(400).send({message: "Die beiden Passwörter stimmen nicht überein!"});
      return;
    }

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = pw;
    user.usergroup = await getRepository(Usergroup).findOne({where: { name: "Standard"}});

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
      res.status(409).send({message: "Der Benutzername ist bereits vorhanden!"});
      return;
    }

    res.status(200).send({status: true});
  }

  public static editCurrent = async (req: Request, res: Response) => {
    const id = req.params.id;

    const { username, email, pwNew, pwNew2, pwOld } = req.body;

    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: "Benutzer nicht gefunden!"});
      return;
    }

    if (!(username && email && pwOld)) {
      res.status(400).send({message: "Nicht alle Daten wurden angegeben!"});
    }

    if (pwNew != pwNew2) {
      res.status(400).send({message: "Die beiden neuen Passwörter stimmen nicht überein!"});
      return;
    }

    if (!user.checkIfUnencryptedPasswordIsValid(pwOld)) {
      res.status(401).send({message: "Altes Passwort stimmt nicht!"});
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
      res.status(409).send({message: "Benutzername bereits vorhanden!"});
      return;
    }

    res.status(200).send({status: true});
  }

  public static deleteUser = async (req: Request, res: Response) => {

    const id = req.params.id;

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: "Benutzer nicht gefunden!"});
      return;
    }
    userRepository.delete(id);

    res.status(200).send({status: true});
  }
}

export default UserController;
