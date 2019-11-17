import { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import dashboard from "./dashboard";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/dashboard", dashboard);

export default routes;