import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import * as path from "path";
class UpdateController {
  public static checkVersion = async (req: Request, res: Response) => {
    res.send({update: false});
  }
}

export default UpdateController;
