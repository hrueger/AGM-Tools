import { Request, Response } from "express";
import * as path from "path";

class StaticController {
  public static thirdPartyLicenses = async (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../assets/3rdpartylicenses.html"));
  }
}

export default StaticController;
