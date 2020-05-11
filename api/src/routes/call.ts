import { Router } from "express";
import CallController from "../controllers/CallController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.post("/call/:chatType/:id/:callType", [checkJwt], CallController.call);

export default router;
