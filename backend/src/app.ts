import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import assetRoutes from "./routes/asset.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "🚀 AssetFlow API Running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);

export default app;