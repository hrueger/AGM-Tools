/* eslint-disable @typescript-eslint/camelcase */
import { Request, Response } from "express";
import { config } from "../config/config";

class EnvironmentController {
    public static getEnvironment = async (req: Request, res: Response) => {
        res.send({
            apiUrl: config.apiUrl,
            appUrl: config.appUrl,
            defaultLanguage: config.defaultLanguage,
            documentServerUrl: config.documentServerUrl,
        });
    }
}

export default EnvironmentController;
