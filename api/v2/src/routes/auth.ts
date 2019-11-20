import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();
// Login route
router.post("/login", AuthController.login);
router.get("/passwordReset/:email", AuthController.sendPasswordResetMail);
router.post("/passwordReset/:resetToken", AuthController.resetPassword);

export default router;
