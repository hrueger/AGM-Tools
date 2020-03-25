import { Router } from "express";
import AuthController from "../controllers/AuthController";

const router = Router();
// Login route
router.post("/login", AuthController.login);
router.get("/passwordReset/:email", AuthController.sendPasswordResetMail);
router.post("/passwordReset/:resetToken", AuthController.resetPassword);

export default router;
