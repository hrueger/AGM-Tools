import { Router } from "express";
import PushController from "../controllers/PushController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/devices", [checkJwt], PushController.getDevices);
router.post("/devices", [checkJwt], PushController.updateToken);

export default router;
