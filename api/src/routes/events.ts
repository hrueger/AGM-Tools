import { Router } from "express";
import EventController from "../controllers/EventController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], EventController.listAll);
router.post("/", [checkJwt], EventController.newEvent);
router.post("/:id([0-9]+)", [checkJwt], EventController.updateEvent);
router.delete("/:id([0-9]+)", [checkJwt], EventController.deleteEvent);

export default router;
