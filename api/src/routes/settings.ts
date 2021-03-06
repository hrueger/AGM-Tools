import { Router } from "express";
import SettingsController from "../controllers/SettingsController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], SettingsController.listSettings);
router.get("/language", [checkJwt], SettingsController.language);
router.post("/:setting", [checkJwt], SettingsController.saveSetting);
router.post("/devices/:deviceId/:setting", [checkJwt], SettingsController.saveDeviceSetting);

export default router;
