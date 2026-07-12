import { Request, Response } from "express";
import prisma from "../config/prisma";

// Helper to seed some initial categories and assets if DB is completely empty
async function ensureSeedData() {
  const categoryCount = await prisma.assetCategory.count();
  if (categoryCount === 0) {
    // Create categories
    const catLaptops = await prisma.assetCategory.create({ data: { name: "Laptops" } });
    const catFurniture = await prisma.assetCategory.create({ data: { name: "Furniture" } });
    const catNetwork = await prisma.assetCategory.create({ data: { name: "Network Hardware" } });

    // Create seed assets
    await prisma.asset.createMany({
      data: [
        {
          assetTag: "AST-2026-001",
          name: "MacBook Pro M3 Max",
          serialNumber: "C02X8747L98Y",
          location: "San Francisco HQ - Tech Lab",
          status: "ALLOCATED",
          categoryId: catLaptops.id,
        },
        {
          assetTag: "AST-2026-002",
          name: "Dell XPS 15",
          serialNumber: "D98S12L74K29",
          location: "New York Office - Sales Dept",
          status: "AVAILABLE",
          categoryId: catLaptops.id,
        },
        {
          assetTag: "AST-2026-003",
          name: "Ergonomic Office Chair",
          serialNumber: "CH-987-1234",
          location: "Chicago Office - Room 402",
          status: "AVAILABLE",
          categoryId: catFurniture.id,
        },
        {
          assetTag: "AST-2026-004",
          name: "Cisco Enterprise Router",
          serialNumber: "CS-NET-9911",
          location: "Server Room 1A",
          status: "UNDER_MAINTENANCE",
          categoryId: catNetwork.id,
        },
      ],
    });
  }
}

export const getAssets = async (_req: Request, res: Response) => {
  try {
    await ensureSeedData();
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.json({
      success: true,
      assets,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching assets",
    });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const { name, assetTag, serialNumber, location, status, categoryName } = req.body;

    if (!name || !assetTag || !serialNumber || !location || !categoryName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find or create category
    let category = await prisma.assetCategory.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      category = await prisma.assetCategory.create({
        data: { name: categoryName },
      });
    }

    // Check if assetTag or serialNumber already exists
    const existingTag = await prisma.asset.findFirst({
      where: {
        OR: [
          { assetTag },
          { serialNumber },
        ]
      }
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "Asset Tag or Serial Number already exists",
      });
    }

    const newAsset = await prisma.asset.create({
      data: {
        name,
        assetTag,
        serialNumber,
        location,
        status: status || "AVAILABLE",
        categoryId: category.id,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({
      success: true,
      asset: newAsset,
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while creating asset",
    });
  }
};
