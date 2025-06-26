const express = require("express");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: z.string().min(1),
  businessType: z.string().min(1),
  thumbnail: z.string().url(),
  structure: z.any(),
  isPublic: z.boolean().default(true),
});

// Get all public templates
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, category, businessType, search } = req.query;

    const where = {
      isPublic: true,
    };

    if (category) {
      where.category = category;
    }

    if (businessType) {
      where.businessType = businessType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            websites: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.template.count({ where });

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Get template categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.template.groupBy({
      by: ["category"],
      where: { isPublic: true },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          _all: "desc",
        },
      },
    });

    const formattedCategories = categories.map((cat) => ({
      name: cat.category,
      count: cat._count._all,
    }));

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get business types
router.get("/business-types", async (req, res) => {
  try {
    const businessTypes = await prisma.template.groupBy({
      by: ["businessType"],
      where: { isPublic: true },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          _all: "desc",
        },
      },
    });

    const formattedTypes = businessTypes.map((type) => ({
      name: type.businessType,
      count: type._count._all,
    }));

    res.json({
      success: true,
      data: formattedTypes,
    });
  } catch (error) {
    console.error("Failed to fetch business types:", error);
    res.status(500).json({ error: "Failed to fetch business types" });
  }
});

// Get single template
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        websites: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            isPublished: true,
          },
          take: 5,
        },
        _count: {
          select: {
            websites: true,
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Failed to fetch template:", error);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});

// Create new template (protected route - requires auth)
router.post("/", async (req, res) => {
  try {
    // Check if user is authenticated (middleware should have set req.user)
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = createTemplateSchema.parse(req.body);

    const template = await prisma.template.create({
      data: {
        ...validatedData,
        createdBy: req.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            websites: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Failed to create template:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to create template" });
  }
});

// Get popular templates
router.get("/featured/popular", async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const popularTemplates = await prisma.template.findMany({
      where: { isPublic: true },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            websites: true,
          },
        },
      },
      orderBy: {
        websites: {
          _count: "desc",
        },
      },
      take: parseInt(limit),
    });

    res.json({
      success: true,
      data: popularTemplates,
    });
  } catch (error) {
    console.error("Failed to fetch popular templates:", error);
    res.status(500).json({ error: "Failed to fetch popular templates" });
  }
});

// Get latest templates
router.get("/featured/latest", async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const latestTemplates = await prisma.template.findMany({
      where: { isPublic: true },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            websites: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    res.json({
      success: true,
      data: latestTemplates,
    });
  } catch (error) {
    console.error("Failed to fetch latest templates:", error);
    res.status(500).json({ error: "Failed to fetch latest templates" });
  }
});

// Use template to create website (protected route)
router.post("/:id/use", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const { projectId, websiteName, subdomain } = req.body;

    // Validate required fields
    if (!projectId || !websiteName || !subdomain) {
      return res.status(400).json({
        error: "Missing required fields: projectId, websiteName, subdomain",
      });
    }

    // Check if template exists
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Check if project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check subdomain availability
    const existingWebsite = await prisma.website.findUnique({
      where: { subdomain },
    });

    if (existingWebsite) {
      return res.status(400).json({ error: "Subdomain already taken" });
    }

    // Create website from template
    const website = await prisma.website.create({
      data: {
        name: websiteName,
        subdomain: subdomain,
        userId: req.user.id,
        projectId: projectId,
        templateId: id,
        status: "BUILDING",
        theme: template.structure?.theme || "modern",
        primaryColor: template.structure?.primaryColor || "#3B82F6",
      },
    });

    // Create pages from template structure
    if (template.structure?.pages) {
      for (const page of template.structure.pages) {
        await prisma.page.create({
          data: {
            name: page.name,
            slug: page.slug,
            title: page.title,
            content: page.content,
            isHomePage: page.isHomePage || false,
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
            websiteId: website.id,
          },
        });
      }
    }

    // Get complete website data
    const completeWebsite = await prisma.website.findUnique({
      where: { id: website.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            businessType: true,
          },
        },
        template: true,
        pages: true,
        _count: {
          select: {
            pages: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: completeWebsite,
      message: "Website created from template successfully",
    });
  } catch (error) {
    console.error("Failed to use template:", error);
    res.status(500).json({ error: "Failed to use template" });
  }
});

module.exports = router;
