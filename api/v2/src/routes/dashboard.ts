import { Router } from "express";
import DashboardController from "../controllers/DashboardController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/spaceChartData", [checkJwt], DashboardController.spaceChartData);
router.post("/spaceChartData", [checkJwt], DashboardController.updateSpaceChartData);
router.get("/whatsnew", [checkJwt], DashboardController.whatsnew);
router.get("/events", [checkJwt], DashboardController.events);
router.get("/version", [checkJwt], DashboardController.version);
router.get("/notifications/", [checkJwt], DashboardController.notifications);
router.post("/notifications/:id([0-9]+)", [checkJwt], DashboardController.notificationSeen);

export default router;
