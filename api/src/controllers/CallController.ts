/* import { Request, Response } from "express";
import fetch from "node-fetch";
import * as https from "https";

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

class CallController {
    public static session = async (req: Request, res: Response) => {
        try {
            fetch(`${config.openViduUrl}api/sessions`, {
                method: "post",
                body: JSON.stringify({ customSessionId: req.body.customSessionId }),
                agent: httpsAgent,
                headers: {
                    Authorization: `Basic ${config.openViduSecret}`,
                    "Content-Type": "application/json",
                },
            }).then((d) => {
                if (d.status == 409) {
                    // that means, the session is already existing
                    res.send({ id: req.body.customSessionId });
                    return;
                }
                // eslint-disable-next-line consistent-return
                return d.json();
            }).then((d) => {
                res.send(d);
            });
        } catch (e) {
            res.status(500).send(e.toString());
        }
    }

    public static token = async (req: Request, res: Response) => {
        try {
            fetch(`${config.openViduUrl}api/tokens`, {
                method: "post",
                body: JSON.stringify({
                    session: req.body.session,
                }),
                agent: httpsAgent,
                headers: {
                    Authorization: "Basic T1BFTlZJRFVBUFA6amlvYWxlbjkyM2FsdXJub2xzcm4=",
                    "Content-Type": "application/json",
                },
            }).then((r) => r.json()).then((d) => {
                res.send(d);
            });
        } catch (e) {
            res.status(500).send(e.toString());
        }
    }
}

export default CallController;
*/
