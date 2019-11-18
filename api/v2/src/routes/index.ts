import { Request, Response, Router } from "express";
import auth from "./auth";
import dashboard from "./dashboard";
import tutorial from "./tutorial";
import user from "./user";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/dashboard", dashboard);
routes.use("/tutorial", tutorial);

export default routes;
