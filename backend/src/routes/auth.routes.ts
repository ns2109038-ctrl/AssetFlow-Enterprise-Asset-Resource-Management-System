import { Router } from "express";
import {
  signup,
  login,
  getProfile
} from "../controllers/auth.controller";

import {
  signupValidation,
  loginValidation
} from "../validators/auth.validator";

const router = Router();

router.post("/signup", signupValidation, signup);

router.post("/login", loginValidation, login);

router.get("/me", getProfile);

export default router;