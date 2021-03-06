import { Router } from "express";
import auth from "./auth";
import chat from "./chat";
import call from "./call";
import dashboard from "./dashboard";
import events from "./events";
import files from "./files";
import notifications from "./notifications";
import projects from "./projects";
import push from "./push";
import settings from "./settings";
import staticFiles from "./static";
import tasks from "./tasks";
import templates from "./templates";
import tutorial from "./tutorial";
import user from "./user";
import vfs from "./vfs";

const routes = Router();

routes.use("/auth", auth);
routes.use("/call", call);
routes.use("/chats", chat);
routes.use("/dashboard", dashboard);
routes.use("/events", events);
routes.use("/files", files);
routes.use("/notifications", notifications);
routes.use("/projects", projects);
routes.use("/push", push);
routes.use("/settings", settings);
routes.use("/static", staticFiles);
routes.use("/tasks", tasks);
routes.use("/templates", templates);
routes.use("/tutorials", tutorial);
routes.use("/users", user);
routes.use("/vfs", vfs);

export default routes;
