import { Router } from "express";
import ProjectController from "../controllers/ProjectController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], ProjectController.listAll);
router.post("/", [checkJwt], ProjectController.newProject);
router.post("/:id([0-9]+)", [checkJwt], ProjectController.updateProject);
router.delete("/:id([0-9]+)", [checkJwt], ProjectController.deleteProject);

export default router;
