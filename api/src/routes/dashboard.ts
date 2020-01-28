import { Router } from "express";
import DashboardController from "../controllers/DashboardController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/events", [checkJwt], DashboardController.events);
router.get("/notifications/", [checkJwt], DashboardController.notifications);
router.get("/spaceChartData", [checkJwt], DashboardController.spaceChartData);
router.get("/tasks", [checkJwt], DashboardController.tasks);
router.get("/version", [checkJwt], DashboardController.version);
router.get("/whatsnew", [checkJwt], DashboardController.whatsnew);
router.post("/notifications/:id([0-9]+)", [checkJwt], DashboardController.notificationSeen);
router.post("/spaceChartData", [checkJwt], DashboardController.updateSpaceChartData);

export default router;
