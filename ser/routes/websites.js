const express = require("express");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createWebsiteSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  projectId: z.string().min(1),
  templateId: z.string().optional(),
  theme: z.string().default("modern"),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .default("#3B82F6"),
});

const updateWebsiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  domain: z.string().optional(),
  status: z.enum(["BUILDING", "REVIEW", "LIVE", "MAINTENANCE"]).optional(),
  isPublished: z.boolean().optional(),
  theme: z.string().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional(),
  navigation: z.any().optional(),
  footer: z.any().optional(),
});

const createPageSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(100),
  content: z.any(),
  isHomePage: z.boolean().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
});

// Get all websites for user
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, projectId } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { subdomain: { contains: search, mode: "insensitive" } },
      ];
    }

    const websites = await prisma.website.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            businessType: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
          },
        },
        _count: {
          select: {
            pages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.website.count({ where });

    res.json({
      success: true,
      data: websites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    res.status(500).json({ error: "Failed to fetch websites" });
  }
});

// Get single website
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const website = await prisma.website.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            businessType: true,
          },
        },
        template: true,
        pages: {
          orderBy: [{ isHomePage: "desc" }, { createdAt: "asc" }],
        },
        aiContent: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    res.json({
      success: true,
      data: website,
    });
  } catch (error) {
    console.error("Failed to fetch website:", error);
    res.status(500).json({ error: "Failed to fetch website" });
  }
});

// Create new website
router.post("/", async (req, res) => {
  try {
    const validatedData = createWebsiteSchema.parse(req.body);

    // Check if project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if subdomain is available
    const existingWebsite = await prisma.website.findUnique({
      where: { subdomain: validatedData.subdomain },
    });

    if (existingWebsite) {
      return res.status(400).json({ error: "Subdomain already taken" });
    }

    const website = await prisma.website.create({
      data: {
        ...validatedData,
        userId: req.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            businessType: true,
          },
        },
        template: true,
        _count: {
          select: {
            pages: true,
          },
        },
      },
    });

    // Create default home page
    await prisma.page.create({
      data: {
        name: "Home",
        slug: "home",
        title: `Welcome to ${website.name}`,
        content: {
          sections: [
            {
              type: "hero",
              title: `Welcome to ${website.name}`,
              subtitle: "Your business deserves a beautiful website",
              cta: "Get Started",
            },
          ],
        },
        isHomePage: true,
        websiteId: website.id,
      },
    });

    res.status(201).json({
      success: true,
      data: website,
    });
  } catch (error) {
    console.error("Failed to create website:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to create website" });
  }
});

// Update website
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateWebsiteSchema.parse(req.body);

    // Check if website exists and belongs to user
    const existingWebsite = await prisma.website.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingWebsite) {
      return res.status(404).json({ error: "Website not found" });
    }

    const website = await prisma.website.update({
      where: { id },
      data: validatedData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            businessType: true,
          },
        },
        template: true,
        _count: {
          select: {
            pages: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: website,
    });
  } catch (error) {
    console.error("Failed to update website:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to update website" });
  }
});

// Delete website
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if website exists and belongs to user
    const existingWebsite = await prisma.website.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingWebsite) {
      return res.status(404).json({ error: "Website not found" });
    }

    await prisma.website.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Website deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete website:", error);
    res.status(500).json({ error: "Failed to delete website" });
  }
});

// Publish website
router.post("/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;

    const website = await prisma.website.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        pages: true,
      },
    });

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    // Check if website has at least one page
    if (website.pages.length === 0) {
      return res
        .status(400)
        .json({ error: "Website must have at least one page to publish" });
    }

    // Check if website has a home page
    const hasHomePage = website.pages.some((page) => page.isHomePage);
    if (!hasHomePage) {
      return res
        .status(400)
        .json({ error: "Website must have a home page to publish" });
    }

    const updatedWebsite = await prisma.website.update({
      where: { id },
      data: {
        isPublished: true,
        status: "LIVE",
      },
    });

    res.json({
      success: true,
      data: updatedWebsite,
      message: "Website published successfully",
    });
  } catch (error) {
    console.error("Failed to publish website:", error);
    res.status(500).json({ error: "Failed to publish website" });
  }
});

// Unpublish website
router.post("/:id/unpublish", async (req, res) => {
  try {
    const { id } = req.params;

    const website = await prisma.website.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    const updatedWebsite = await prisma.website.update({
      where: { id },
      data: {
        isPublished: false,
        status: "BUILDING",
      },
    });

    res.json({
      success: true,
      data: updatedWebsite,
      message: "Website unpublished successfully",
    });
  } catch (error) {
    console.error("Failed to unpublish website:", error);
    res.status(500).json({ error: "Failed to unpublish website" });
  }
});

// Get website pages
router.get("/:id/pages", async (req, res) => {
  try {
    const { id } = req.params;

    const website = await prisma.website.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    const pages = await prisma.page.findMany({
      where: { websiteId: id },
      orderBy: [{ isHomePage: "desc" }, { createdAt: "asc" }],
    });

    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error("Failed to fetch pages:", error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// Create new page
router.post("/:id/pages", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = createPageSchema.parse(req.body);

    const website = await prisma.website.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!website) {
      return res.status(404).json({ error: "Website not found" });
    }

    // Check if slug is unique within website
    const existingPage = await prisma.page.findFirst({
      where: {
        websiteId: id,
        slug: validatedData.slug,
      },
    });

    if (existingPage) {
      return res.status(400).json({ error: "Page slug already exists" });
    }

    // If setting as home page, unset other home pages
    if (validatedData.isHomePage) {
      await prisma.page.updateMany({
        where: {
          websiteId: id,
          isHomePage: true,
        },
        data: {
          isHomePage: false,
        },
      });
    }

    const page = await prisma.page.create({
      data: {
        ...validatedData,
        websiteId: id,
      },
    });

    res.status(201).json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("Failed to create page:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to create page" });
  }
});

// Check subdomain availability
router.get("/check-subdomain/:subdomain", async (req, res) => {
  try {
    const { subdomain } = req.params;

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain) || subdomain.length < 3) {
      return res.json({
        success: true,
        available: false,
        message: "Invalid subdomain format",
      });
    }

    const existingWebsite = await prisma.website.findUnique({
      where: { subdomain },
    });

    res.json({
      success: true,
      available: !existingWebsite,
      message: existingWebsite
        ? "Subdomain already taken"
        : "Subdomain available",
    });
  } catch (error) {
    console.error("Failed to check subdomain:", error);
    res.status(500).json({ error: "Failed to check subdomain" });
  }
});

module.exports = router;
