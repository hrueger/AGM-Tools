import { Router } from "express";
import UpdateController from "../controllers/UpdateController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/check/:version", [checkJwt], UpdateController.checkVersion);
router.post("/", [checkJwt], UpdateController.update);

export default router;
