import { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
  try {
    res.status(201).json({
      success: true,
      message: "Signup API Working",
      data: req.body
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: "Login API Working",
      data: req.body
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const getProfile = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Protected Profile Route"
  });
};