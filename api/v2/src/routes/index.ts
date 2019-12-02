import { Router } from "express";
import auth from "./auth";
import chat from "./chat";
import dashboard from "./dashboard";
import events from "./events";
import files from "./files";
import notifications from "./notifications";
import projects from "./projects";
import templates from "./templates";
import tutorial from "./tutorial";
import user from "./user";

const routes = Router();

routes.use("/auth", auth);
routes.use("/dashboard", dashboard);
routes.use("/events", events);
routes.use("/files", files);
routes.use("/notifications", notifications);
routes.use("/projects", projects);
routes.use("/templates", templates);
routes.use("/tutorials", tutorial);
routes.use("/users", user);
routes.use("/chats", chat);

export default routes;
