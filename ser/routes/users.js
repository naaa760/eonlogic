const express = require("express");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
});

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            projects: true,
            websites: true,
            templates: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            projects: true,
            websites: true,
            templates: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// Get user dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user stats
    const stats = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            projects: true,
            websites: true,
            templates: true,
          },
        },
      },
    });

    // Get recent projects
    const recentProjects = await prisma.project.findMany({
      where: { userId },
      include: {
        websites: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true,
            isPublished: true,
          },
        },
        _count: {
          select: {
            websites: true,
            aiContent: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // Get recent websites
    const recentWebsites = await prisma.website.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            pages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // Get AI generation activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const aiActivity = await prisma.aIContent.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        OR: [
          {
            project: {
              userId: userId,
            },
          },
          {
            website: {
              userId: userId,
            },
          },
        ],
      },
      select: {
        type: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate additional stats
    const publishedWebsites = await prisma.website.count({
      where: {
        userId,
        isPublished: true,
      },
    });

    const totalPages = await prisma.page.count({
      where: {
        website: {
          userId,
        },
      },
    });

    const dashboardData = {
      user: stats,
      stats: {
        totalProjects: stats._count.projects,
        totalWebsites: stats._count.websites,
        publishedWebsites,
        totalPages,
        totalTemplates: stats._count.templates,
        recentAiGenerations: aiActivity.length,
      },
      recentProjects,
      recentWebsites,
      aiActivity,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Get user activity feed
router.get("/activity", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Get recent AI generations
    const aiActivity = await prisma.aIContent.findMany({
      where: {
        OR: [
          {
            project: {
              userId: userId,
            },
          },
          {
            website: {
              userId: userId,
            },
          },
        ],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        website: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.aIContent.count({
      where: {
        OR: [
          {
            project: {
              userId: userId,
            },
          },
          {
            website: {
              userId: userId,
            },
          },
        ],
      },
    });

    res.json({
      success: true,
      data: aiActivity,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Failed to fetch user activity:", error);
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
});

// Delete user account
router.delete("/account", async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has any published websites
    const publishedWebsites = await prisma.website.count({
      where: {
        userId,
        isPublished: true,
      },
    });

    if (publishedWebsites > 0) {
      return res.status(400).json({
        error:
          "Cannot delete account with published websites. Please unpublish all websites first.",
      });
    }

    // Delete user and cascade delete all related data
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete user account:", error);
    res.status(500).json({ error: "Failed to delete user account" });
  }
});

// Get user preferences (placeholder for future features)
router.get("/preferences", async (req, res) => {
  try {
    // For now, return default preferences
    // In the future, this could be stored in a separate preferences table
    const preferences = {
      theme: "system",
      language: "en",
      notifications: {
        email: true,
        aiGeneration: true,
        websitePublished: true,
      },
      dashboard: {
        showRecentProjects: true,
        showActivityFeed: true,
        projectsPerPage: 10,
      },
    };

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Failed to fetch user preferences:", error);
    res.status(500).json({ error: "Failed to fetch user preferences" });
  }
});

module.exports = router;
