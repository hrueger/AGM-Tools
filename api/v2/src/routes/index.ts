import { Router } from "express";
import auth from "./auth";
import dashboard from "./dashboard";
import events from "./events";
import projects from "./projects";
import tutorial from "./tutorial";
import user from "./user";

const routes = Router();

routes.use("/auth", auth);
routes.use("/users", user);
routes.use("/dashboard", dashboard);
routes.use("/tutorials", tutorial);
routes.use("/events", events);
routes.use("/projects", projects);

export default routes;
