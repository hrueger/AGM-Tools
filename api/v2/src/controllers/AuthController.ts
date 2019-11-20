import { validate } from "class-validator";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as nodemailer from "nodemailer";
import { getRepository } from "typeorm";
import config from "../config/config";
import { User } from "../entity/User";
import { genID } from "../utils";

class AuthController {

  public static login = async (req: Request, res: Response) => {
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
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).end(JSON.stringify({message: "Falsches Passwort!"}));
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

    // Send the jwt in the response
    res.send(response);
  }

  public static sendPasswordResetMail = async (req: Request, res: Response) => {
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({where: { email: req.params.email}});
    } catch {
      res.status(404).send({message: "Email-Adresse nicht gefunden!"});
      return;
    }

    const transporter = nodemailer.createTransport(config.emailSettings);
    const token = genID(32);
    user.passwordResetToken = token;
    try {
      await userRepository.save(user);
    } catch {
      res.status(500).send({message: "Fehler beim Speichern des Tokens!"});
      return;
    }
    const link = `${config.urlSettings.url}resetPassword/${token}`;
    transporter.sendMail({
      from: config.emailSender,
      html: `<h1>Hi ${user.username},</h1><br>Ein Link zum Zurücksetzen des Passworts wurde angefordert. \
      Falls dies nicht beabsichtigt war, ignorieren Sie einfach diese E-Mail. Ihr Password wird nicht geändert.<br><br>\
      Wenn Sie ein neues Passwort setzen möchten, klicken Sie jetzt auf diesen Link:<br><br>\
      <a href='${link}'>${link}</a><br><br><br><br>Mit freundlichen Grüßen,<br><br>Das AGM-Tools Team<br><br><br><hr>Diese Email wurde automatisch erstellt. \
      Antworten können leider nicht bearbeitet werden!`,
      subject: "Reset password - AGM-Tools",
      to: req.params.email,
    }, (err) => {
      if (err) {
          res.status(500).send({message: "Fehler beim Senden der Email: " + err.toString()});
          return;
      }
      res.send({status: true});
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
      user = await userRepository.findOneOrFail({where: { passwordResetToken: req.params.resetToken}});
    } catch (id) {
      res.status(404).send({message: "Benutzer nicht gefunden, fehlerhafter Link!"});
    }
    if (password1 != password2) {
      res.status(401).send({message: "Die beiden Passwörter stimmen nicht überein!"});
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
