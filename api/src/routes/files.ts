import { Router } from "express";
import FileController from "../controllers/FileController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/projects/:pid([0-9]+)", [checkJwt], FileController.listAll);
router.get("/tree/:pid([0-9]+)", [checkJwt], FileController.projectTree);
router.get("/tags", [checkJwt], FileController.listTags);
router.post("/:id([0-9]+)/tags", [checkJwt], FileController.toggleTag);
router.post("/:id([0-9]+)/share", [checkJwt], FileController.share);
router.post("/", [checkJwt], FileController.newFolder);
router.get("/:id([0-9]+)", [checkJwt], FileController.showElement);
router.get("/:id([0-9]+)/download", [checkJwt], FileController.downloadElement);
router.post("/:id([0-9]+)/move", [checkJwt], FileController.moveElement);
router.post("/:id([0-9]+)/moveToRoot", [checkJwt], FileController.moveElementToRoot);
router.post("/:id([0-9]+)/extract", [checkJwt], FileController.extract);
router.get("/share/:link", FileController.showShare);
router.get("/share/:link/download", FileController.downloadShare);
router.post("/upload", FileController.uploadFile);
router.post("/:id([0-9]+)", [checkJwt], FileController.renameElement);
router.delete("/:id([0-9]+)", [checkJwt], FileController.deleteFile);

router.post("/documents/save", FileController.trackDocument);

export default router;
