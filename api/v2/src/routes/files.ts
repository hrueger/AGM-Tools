import { Router } from "express";
import FileController from "../controllers/FileController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/projects/:pid([0-9]+)", [checkJwt], FileController.listAll);
router.get("/tags", [checkJwt], FileController.listTags);
router.post("/:id([0-9]+)/tags", [checkJwt], FileController.toggleTag);
router.post("/", [checkJwt], FileController.newFolder);
router.get("/:fid([0-9]+)", [checkJwt], FileController.showElement);
router.get("/:fid([0-9]+)/download", [checkJwt], FileController.downloadElement);
router.post("/upload", [checkJwt], FileController.uploadFile);
router.post("/:id([0-9]+)", [checkJwt], FileController.renameElement);
router.delete("/:id([0-9]+)", [checkJwt], FileController.deleteFile);

export default router;
