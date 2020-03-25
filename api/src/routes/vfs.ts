import { Router } from "express";
import VirtualFileSystemController from "../controllers/VirtualFileSystemController";

const router = Router();

router.get("/drive", [], VirtualFileSystemController.drives);
router.get("/drive/:id", [], VirtualFileSystemController.drive);
router.get("/drive/:id/children", [], VirtualFileSystemController.children);
router.get("/drive/:id/folders", [], VirtualFileSystemController.folders);
router.get("/drive/:id/items", [], VirtualFileSystemController.items);
router.get("/drive/:id/content", [], VirtualFileSystemController.content); // ToDo: Auth!!!

export default router;
