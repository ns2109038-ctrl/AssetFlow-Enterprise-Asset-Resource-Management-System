import { Router } from "express";
import { getAssets, createAsset } from "../controllers/asset.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Apply auth middleware to all asset routes
router.use(authenticate as any);

router.get("/", getAssets);
router.post("/", createAsset);

export default router;
