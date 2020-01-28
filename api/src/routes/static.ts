import { Router } from "express";
import StaticController from "../controllers/StaticController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/3rdPartyLicenses", [checkJwt], StaticController.thirdPartyLicenses);

export default router;
