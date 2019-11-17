import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { User } from "../entity/User";

class UserController {
  public static listAll = async (req: Request, res: Response) => {
    // Get users from database
    const userRepository = getRepository(User);
    const users = await userRepository.find({
      select: ["id", "username", "usergroup", "email"],
    });

    // Send the users object
    res.send(users);
  }

  public static newUser = async (req: Request, res: Response) => {
    // Get parameters from the body
    const { username, password, usergroup } = req.body;
    const user = new User();
    user.username = username;
    user.password = password;
    user.usergroup = usergroup;

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
      res.status(409).send({message: "Username already in use"});
      return;
    }

    res.status(204).send();
  }

  public static editCurrent = async (req: Request, res: Response) => {
    const id = req.params.id;

    const { username, role } = req.body;

    const userRepository = getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: "User not found"});
      return;
    }

    // Validate the new values on model
    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send({message: "username already in use"});
      return;
    }

    res.status(204).send();
  }

  public static deleteUser = async (req: Request, res: Response) => {

    const id = req.params.id;

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    userRepository.delete(id);

    res.status(204).send();
  }
}

export default UserController;
