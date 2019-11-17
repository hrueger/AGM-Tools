import { validate } from "class-validator";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";

import config from "../config/config";
import { User } from "../entity/User";

class AuthController {
  public static login = async (req: Request, res: Response) => {
    // Check if username and password are set
    const { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).end(JSON.stringify({error: "Benutzername oder Passwort leer!"}));
    }

    // Get user from database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      res.status(401).end(JSON.stringify({message: "Falscher Benutzername!"}));
    }

    if (!user) {
      res.status(401).end(JSON.stringify({message: "Falscher Benutzername!"}));
      return;
    }

    // Check if encrypted password match
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).end(JSON.stringify({message: "Falsches Passwort!"}));
      return;
    }

    // Sing JWT, valid for 1 hour
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: "1h" },
    );

    const response = {
      ...user,
      token,
    };

    // Send the jwt in the response
    res.send(response);
  }

  public static changePassword = async (req: Request, res: Response) => {
    // Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    // Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    // Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      res.status(401).send();
    }

    // Check if old password matchs
    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    // Validate de model (password lenght)
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    // Hash the new password and save
    user.hashPassword();
    userRepository.save(user);

    res.status(204).send();
  }
}
export default AuthController;
