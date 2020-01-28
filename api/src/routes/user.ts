import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkPermission } from "../middlewares/checkPermission";

const router = Router();

// Get all users
router.get("/", [checkJwt], UserController.listAll);

// Create a new user
router.post("/", [checkJwt, checkPermission(["CREATE_USER"])], UserController.newUser);

// Create a new user
router.post("/editCurrent", [checkJwt, checkPermission(["CREATE_USER"])], UserController.editCurrent);

// Delete one user
router.delete(
  "/:id([0-9]+)",
  [checkJwt, checkPermission(["DELETE_USER"])],
  UserController.deleteUser,
);

export default router;
