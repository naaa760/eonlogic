const express = require("express");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  businessType: z.string().min(1),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  businessType: z.string().min(1).optional(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "PUBLISHED"]).optional(),
});

// Get all projects for user
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { businessType: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        websites: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true,
            isPublished: true,
            updatedAt: true,
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
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.project.count({ where });

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get single project
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        websites: {
          include: {
            pages: {
              select: {
                id: true,
                name: true,
                slug: true,
                isHomePage: true,
                isPublished: true,
                updatedAt: true,
              },
            },
            template: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
              },
            },
          },
        },
        aiContent: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            websites: true,
            aiContent: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create new project
router.post("/", async (req, res) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        userId: req.user.id,
      },
      include: {
        _count: {
          select: {
            websites: true,
            aiContent: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Failed to create project:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateProjectSchema.parse(req.body);

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = await prisma.project.update({
      where: { id },
      data: validatedData,
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
    });

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Failed to update project:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        _count: {
          select: { websites: true },
        },
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if project has websites
    if (existingProject._count.websites > 0) {
      return res.status(400).json({
        error: "Cannot delete project with websites. Delete websites first.",
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Duplicate project
router.post("/:id/duplicate", async (req, res) => {
  try {
    const { id } = req.params;

    // Get original project
    const originalProject = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        websites: {
          include: {
            pages: true,
          },
        },
      },
    });

    if (!originalProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Create duplicate project
    const duplicatedProject = await prisma.project.create({
      data: {
        name: `${originalProject.name} (Copy)`,
        description: originalProject.description,
        businessType: originalProject.businessType,
        userId: req.user.id,
        status: "DRAFT",
      },
    });

    // Duplicate websites if any
    for (const website of originalProject.websites) {
      const duplicatedWebsite = await prisma.website.create({
        data: {
          name: `${website.name} (Copy)`,
          subdomain: `${website.subdomain}-copy-${Date.now()}`,
          status: "BUILDING",
          isPublished: false,
          theme: website.theme,
          primaryColor: website.primaryColor,
          metaTitle: website.metaTitle,
          metaDescription: website.metaDescription,
          keywords: website.keywords,
          navigation: website.navigation,
          footer: website.footer,
          userId: req.user.id,
          projectId: duplicatedProject.id,
          templateId: website.templateId,
        },
      });

      // Duplicate pages
      for (const page of website.pages) {
        await prisma.page.create({
          data: {
            name: page.name,
            slug: page.slug,
            title: page.title,
            content: page.content,
            isHomePage: page.isHomePage,
            isPublished: false,
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
            websiteId: duplicatedWebsite.id,
          },
        });
      }
    }

    // Fetch the complete duplicated project
    const completeProject = await prisma.project.findUnique({
      where: { id: duplicatedProject.id },
      include: {
        websites: {
          include: {
            pages: true,
          },
        },
        _count: {
          select: {
            websites: true,
            aiContent: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: completeProject,
    });
  } catch (error) {
    console.error("Failed to duplicate project:", error);
    res.status(500).json({ error: "Failed to duplicate project" });
  }
});

// Get project analytics/stats
router.get("/:id/analytics", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get analytics data
    const analytics = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            websites: true,
            aiContent: true,
          },
        },
        websites: {
          include: {
            _count: {
              select: { pages: true },
            },
          },
        },
        aiContent: {
          select: {
            type: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate stats
    const stats = {
      totalWebsites: analytics._count.websites,
      totalAiGenerations: analytics._count.aiContent,
      publishedWebsites: analytics.websites.filter((w) => w.isPublished).length,
      totalPages: analytics.websites.reduce(
        (sum, w) => sum + w._count.pages,
        0
      ),
      recentActivity: analytics.aiContent.filter((ai) => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 7);
        return ai.createdAt > dayAgo;
      }).length,
      aiContentByType: analytics.aiContent.reduce((acc, ai) => {
        acc[ai.type] = (acc[ai.type] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Failed to fetch project analytics:", error);
    res.status(500).json({ error: "Failed to fetch project analytics" });
  }
});

module.exports = router;
