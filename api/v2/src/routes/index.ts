import { Request, Response, Router } from "express";
import auth from "./auth";
import dashboard from "./dashboard";
import events from "./events";
import tutorial from "./tutorial";
import user from "./user";

const routes = Router();

routes.use("/auth", auth);
routes.use("/users", user);
routes.use("/dashboard", dashboard);
routes.use("/tutorials", tutorial);
routes.use("/events", events);

export default routes;
