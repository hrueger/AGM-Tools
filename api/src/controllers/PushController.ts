import { Request, Response } from "express";
class PushController {
  public static updateToken = async (req: Request, res: Response) => {
    res.send({status: true});
  }
}

export default PushController;
