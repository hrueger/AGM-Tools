import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // Get the jwt token from the head
  let token = req.headers.authorization as string;
  token = token.replace("Bearer ", "");
  let jwtPayload;

  // Try to validate the token and get data
  try {
    jwtPayload = ( jwt.verify(token, config.jwtSecret) as any);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    // If token is not valid, respond with 401 (unauthorized)
    res.status(401).send({message: "Sitzung abgelaufen. Bitte erneut einloggen!", logout: true});
    return;
  }

  // The token is valid for 1 hour
  // We want to send a new token on every request
  const { userId, username } = jwtPayload;
  const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
    expiresIn: "1h",
  });
  res.setHeader("Authorization", newToken);

  // Call the next middleware or controller
  next();
};
