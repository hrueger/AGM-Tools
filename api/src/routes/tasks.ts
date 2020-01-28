import { Router } from "express";
import TaskController from "../controllers/TaskController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.post("/:pid", [checkJwt], TaskController.newTask);

export default router;
