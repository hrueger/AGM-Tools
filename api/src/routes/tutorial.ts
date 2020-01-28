import { Router } from "express";
import TutorialController from "../controllers/TutorialController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], TutorialController.listAll);
router.get("/project/:pid", [checkJwt], TutorialController.forProject);
router.post("/", [checkJwt], TutorialController.newTutorial);

router.get("/:id([0-9]+)", [checkJwt], TutorialController.getTutorial);
router.post("/:id([0-9]+)", [checkJwt], TutorialController.updateTutorial);

router.post("/:tutorialId([0-9]+)/steps", [checkJwt], TutorialController.createStep);
router.post("/:tutorialId([0-9]+)/steps/:id([0-9]+)", [checkJwt], TutorialController.updateStep);
router.delete("/:tutorialId([0-9]+)/steps/:id([0-9]+)", [checkJwt], TutorialController.deleteStep);
router.post("/:tutorialId([0-9]+)/steps/:id([0-9]+)/files", [checkJwt], TutorialController.uploadFile);
router.get("/files/:filename", [checkJwt], TutorialController.viewFile);

export default router;
