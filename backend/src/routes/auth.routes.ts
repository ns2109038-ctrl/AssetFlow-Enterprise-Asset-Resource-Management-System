import { Router } from "express";

const router = Router();

// Test Route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API is working 🚀"
  });
});

export default router;