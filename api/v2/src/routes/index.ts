import { Request, Response, Router } from "express";
import auth from "./auth";
import dashboard from "./dashboard";
import user from "./user";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/dashboard", dashboard);

export default routes;
