import { Request, Response } from "express";
import * as http from "http";

class UpdateController {
    public static checkVersion = async (req: Request, res: Response) => {
        res.send({ update: false });
    }
    public static update = async (req: Request, res: Response) => {
        res.send(JSON.parse(await new Promise((resolve, reject) => {
            http.get("http://localhost:8314/update", (d) => {
                let body = "";
                d.on("data", (chunk) => {
                    body += chunk;
                });
                d.on("end", () => {
                    resolve(body);
                });
            }).on("error", (er) => {
                reject(er);
            });
        })));
    }
}

export default UpdateController;
