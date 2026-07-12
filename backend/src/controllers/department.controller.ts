import { Request, Response } from "express";
import prisma from "../config/prisma";

// Create Department
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const exists = await prisma.department.findUnique({
      where: { name },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = await prisma.department.create({
      data: {
        name,
      },
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Departments
export const getDepartments = async (_req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Department By ID
export const getDepartmentById = async (
  req: Request,
  res: Response
) => {
  try {
    const department = await prisma.department.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.json({
      success: true,
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update Department
export const updateDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    const department = await prisma.department.update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    });

    res.json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Department
export const deleteDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    await prisma.department.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};