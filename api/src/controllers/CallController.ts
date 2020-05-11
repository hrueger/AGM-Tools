import { Request, Response } from "express";


class CallController {
    public static call = async (req: Request, res: Response) => {
        const socket = res.app.locals.rtcSockets.find((es) => es.userId == req.params.id);
        if (socket) {
            socket.emit("incoming-call", {
                chatType: req.params.chatType,
                callType: req.params.callType,
                id: req.params.id,
                user: {
                    username: res.locals.jwtPayload.username, id: res.locals.jwtPayload.userId,
                },
            });
        }
    }
}

export default CallController;
