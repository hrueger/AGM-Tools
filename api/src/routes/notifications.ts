import { Router } from "express";
import NotificationController from "../controllers/NotificationController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], NotificationController.listAll);
router.post("/", [checkJwt], NotificationController.newNotification);
router.post("/:id([0-9]+)", [checkJwt], NotificationController.seenNotification);
router.delete("/:id([0-9]+)", [checkJwt], NotificationController.deleteNotification);

export default router;
