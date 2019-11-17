import { Router } from "express";
import DashboardController from "../controllers/DashboardController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/spaceChartData", [checkJwt], DashboardController.spaceChartData);
router.get("/whatsnew", [checkJwt], DashboardController.whatsnew);
router.get("/events", [checkJwt], DashboardController.events);
router.get("/version", [checkJwt], DashboardController.version);
router.get("/notification/", [checkJwt], DashboardController.notifications);
router.post("/notification/:id([0-9]+)", [checkJwt], DashboardController.notificationSeen);

export default router;