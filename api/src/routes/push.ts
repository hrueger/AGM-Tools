import { Router } from "express";
import PushController from "../controllers/PushController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.post("/token/update", [checkJwt], PushController.updateToken);

export default router;
