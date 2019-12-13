import { Router } from "express";
import TemplateController from "../controllers/TemplateController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], TemplateController.listAll);
router.get("/:filename", [checkJwt], TemplateController.getFile);
router.post("/", [checkJwt], TemplateController.newTemplate);
router.delete("/:id([0-9]+)", [checkJwt], TemplateController.deleteTemplate);

export default router;
