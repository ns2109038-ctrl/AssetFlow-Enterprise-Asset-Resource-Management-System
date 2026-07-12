import { Router } from "express";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller";

import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, createDepartment);

router.get("/", protect, getDepartments);

router.get("/:id", protect, getDepartmentById);

router.put("/:id", protect, updateDepartment);

router.delete("/:id", protect, deleteDepartment);

export default router;