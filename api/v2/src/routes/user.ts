import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkPermission } from "../middlewares/checkPermission";

const router = Router();

//Get all users
router.get("/", [checkJwt], UserController.listAll);

// Get one user
router.get(
  "/:id([0-9]+)",
  [checkJwt],
  UserController.getOneById
);

//Create a new user
router.post("/", [checkJwt, checkPermission(["CREATE_USER"])], UserController.newUser);

//Edit one user
router.patch(
  "/:id([0-9]+)",
  [checkJwt, checkPermission(["EDIT_USER"])],
  UserController.editUser
);

//Delete one user
router.delete(
  "/:id([0-9]+)",
  [checkJwt, checkPermission(["DELETE_USER"])],
  UserController.deleteUser
);

export default router;