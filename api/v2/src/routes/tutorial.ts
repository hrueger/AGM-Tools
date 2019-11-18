import { Router } from "express";
import TutorialController from "../controllers/TutorialController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], TutorialController.listAll);
router.post("/", [checkJwt], TutorialController.newTutorial);

router.get("/:id([0-9]+)", TutorialController.getTutorial);
router.post("/:id([0-9]+)", TutorialController.updateTutorial);

router.post("/:tutorialId([0-9]+)/step", TutorialController.createStep);
router.post("/:tutorialId([0-9]+)/step/:id([0-9]+)", TutorialController.updateStep);
router.delete("/:tutorialId([0-9]+)/step/:id([0-9]+)", TutorialController.deleteStep);
router.post("/:tutorialId([0-9]+)/step/:id([0-9]+)/image", TutorialController.uploadImage);
router.get("/image/:filename", TutorialController.viewImage);

export default router;
