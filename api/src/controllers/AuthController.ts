import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { config } from "../config/config";
import { User } from "../entity/User";
import { sendMail } from "../utils/mailer";
import { genID } from "../utils/utils";

class AuthController {

  public static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!(username && password)) {
      res.status(400).end(JSON.stringify({error: i18n.__("errors.usernameOrPasswordEmpty")}));
    }

    // Get user from database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.createQueryBuilder("user")
        .addSelect("user.password")
        .where("user.username = :username", { username })
        .getOne();
    } catch (error) {
      res.status(401).end(JSON.stringify({message: i18n.__("errors.wrongUsername")}));
    }

    if (!user) {
      res.status(401).end(JSON.stringify({message: i18n.__("errors.wrongUsername")}));
      return;
    }
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).end(JSON.stringify({message: i18n.__("errors.wrongPassword")}));
      return;
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: "1h" },
    );

    const response = {
      ...user,
      token,
    };
    response.password = undefined;

    // Send the jwt in the response
    res.send(response);
  }

  public static sendPasswordResetMail = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    let user: User;
    const token = genID(32);
    try {
      user = await userRepository.createQueryBuilder("user")
        .addSelect("user.passwordResetToken")
        .where("user.email = :email", { email: req.params.email })
        .getOne();
      user.passwordResetToken = token;
    } catch {
      res.status(404).send({message: i18n.__("errors.emailNotFound")});
      return;
    }
    try {
      await userRepository.save(user);
    } catch {
      res.status(500).send({message: i18n.__("errors.errorWhileSavingToken")});
      return;
    }
    const link = `${config.url}resetPassword/${token}`;
    sendMail(req.params.email, {
      btnText: i18n.__("resetPassword.resetPassword"),
      btnUrl: link,
      cardSubtitle: "",
      cardTitle: "",
      content: i18n.__("resetPassword.message").replace("%s", user.username),
      secondTitle: "",
      subject: i18n.__("resetPassword.resetPassword"),
      subtitle: i18n.__("resetPassword.at").replace("%s", new Date().toLocaleString()),
      summary: i18n.__("resetPassword.message").replace("%s", user.username),
      title: i18n.__("resetPassword.resetPassword"),
    }).then(() => {
      res.send({status: true});
    }).catch((err) => {
      // tslint:disable-next-line: no-console
      console.log(err);
      res.status(500).send({message: `${i18n.__("errors.errorWhileSendingEmail")}: ${err.toString()}`});
    });
  }
  public static resetPassword = async (req: Request, res: Response) => {
    // Get parameters from the body
    const { password1, password2 } = req.body;
    if (!(password1 && password2)) {
      res.status(400).send();
    }

    // Get user from the database
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.createQueryBuilder("user")
        .addSelect("user.password")
        .addSelect("user.passwordResetToken")
        .where("user.passwordResetToken = :passwordResetToken", { passwordResetToken: req.params.resetToken })
        .getOne();
    } catch (id) {
      res.status(404).send({message: i18n.__("errors.userNotFoundWrongLink")});
    }
    if (password1 != password2) {
      res.status(401).send({message: i18n.__("errors.passwordsDontMatch")});
      return;
    }
    user.password = password2;
    user.passwordResetToken = "";
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    user.hashPassword();
    userRepository.save(user);

    res.send({status: true});
  }
}
export default AuthController;
