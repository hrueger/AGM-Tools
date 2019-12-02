import { Router } from "express";
import ChatController from "../controllers/ChatController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], ChatController.listAll);
router.get("/user/:id([0-9]+)", [checkJwt], ChatController.getUserChat);
router.get("/project/:id([0-9]+)", [checkJwt], ChatController.getProjectChat);
router.post("/user/:id([0-9]+)", [checkJwt], ChatController.sendUserMessage);
router.post("/project/:id([0-9]+)", [checkJwt], ChatController.sendProjectMessage);

export default router;
