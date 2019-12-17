import { Router } from "express";
import ProjectController from "../controllers/ProjectController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], ProjectController.listAll);
router.post("/", [checkJwt], ProjectController.newProject);
router.get("/:id([0-9]+)", [checkJwt], ProjectController.getProjectImage);
router.post("/:id([0-9]+)", [checkJwt], ProjectController.updateProject);
router.post("/:id([0-9]+)/linkTutorials", [checkJwt], ProjectController.linkTutorials);
router.delete("/:id([0-9]+)", [checkJwt], ProjectController.deleteProject);

export default router;
