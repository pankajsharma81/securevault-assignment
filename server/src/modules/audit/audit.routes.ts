import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { listAuditHandler } from "./audit.controller";

const router = Router();

router.use(authMiddleware);
router.get("/:fileId", listAuditHandler);

export default router;