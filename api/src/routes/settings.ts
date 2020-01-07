import { Router } from "express";
import SettingsController from "../controllers/SettingsController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], SettingsController.listSettings);
router.post("/", [checkJwt], SettingsController.saveSettings);

export default router;
