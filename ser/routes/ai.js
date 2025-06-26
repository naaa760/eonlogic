const express = require("express");
const { z } = require("zod");
const Groq = require("groq-sdk");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Validation schemas
const generateWebsiteSchema = z.object({
  businessType: z.string().min(1),
  businessName: z.string().min(1),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  features: z.array(z.string()).optional(),
  style: z.enum(["modern", "classic", "minimalist", "bold"]).default("modern"),
});

const generateContentSchema = z.object({
  type: z.enum(["page", "blog", "seo", "marketing"]),
  topic: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  tone: z
    .enum(["professional", "casual", "friendly", "formal"])
    .default("professional"),
  length: z.enum(["short", "medium", "long"]).default("medium"),
});

// Generate complete website structure
router.post("/generate-website", async (req, res) => {
  try {
    const validatedData = generateWebsiteSchema.parse(req.body);

    const prompt = `
You are an expert web designer and developer. Create a comprehensive website structure for a ${
      validatedData.businessType
    } business named "${validatedData.businessName}".

Business Details:
- Business Type: ${validatedData.businessType}
- Business Name: ${validatedData.businessName}
- Description: ${validatedData.description || "Not provided"}
- Target Audience: ${validatedData.targetAudience || "General audience"}
- Required Features: ${
      validatedData.features?.join(", ") || "Standard business features"
    }
- Design Style: ${validatedData.style}

Generate a complete website structure including:
1. Navigation menu (5-7 main pages)
2. Homepage content with hero section, features, about preview
3. About page content
4. Services/Products page content
5. Contact page content
6. Footer structure
7. SEO recommendations
8. Color scheme suggestions
9. Call-to-action recommendations

Respond in valid JSON format with this structure:
{
  "website": {
    "name": "Website name",
    "navigation": ["Home", "About", "Services", "Contact"],
    "pages": [
      {
        "name": "Home",
        "slug": "home",
        "title": "Page title",
        "sections": [
          {
            "type": "hero",
            "title": "Hero title",
            "subtitle": "Hero subtitle",
            "cta": "Call to action text"
          }
        ]
      }
    ],
    "seo": {
      "metaTitle": "SEO title",
      "metaDescription": "SEO description",
      "keywords": ["keyword1", "keyword2"]
    },
    "design": {
      "primaryColor": "#hex",
      "secondaryColor": "#hex",
      "theme": "theme_name"
    }
  }
}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    let websiteData;

    try {
      websiteData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    // Save AI content to database
    const aiContent = await prisma.aIContent.create({
      data: {
        type: "WEBSITE_STRUCTURE",
        prompt: JSON.stringify(validatedData),
        content: websiteData,
        status: "COMPLETED",
        metadata: {
          model: "llama3-8b-8192",
          timestamp: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      data: websiteData,
      aiContentId: aiContent.id,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to generate website" });
  }
});

// Generate specific content (blog posts, page content, etc.)
router.post("/generate-content", async (req, res) => {
  try {
    const validatedData = generateContentSchema.parse(req.body);

    let prompt = "";

    switch (validatedData.type) {
      case "page":
        prompt = `
Create engaging page content about "${validatedData.topic}".
Tone: ${validatedData.tone}
Length: ${validatedData.length}
Keywords to include: ${validatedData.keywords?.join(", ") || "None specified"}

Generate structured content with:
1. Compelling headline
2. Introduction paragraph
3. Main content sections
4. Call-to-action

Return as JSON: {"title": "...", "content": "...", "cta": "..."}
`;
        break;

      case "blog":
        prompt = `
Write a comprehensive blog post about "${validatedData.topic}".
Tone: ${validatedData.tone}
Length: ${validatedData.length}
SEO Keywords: ${validatedData.keywords?.join(", ") || "None specified"}

Include:
1. Engaging title
2. Introduction hook
3. Main content with subheadings
4. Conclusion with CTA
5. Meta description for SEO

Return as JSON: {"title": "...", "content": "...", "metaDescription": "...", "headings": [...]}
`;
        break;

      case "seo":
        prompt = `
Generate SEO-optimized content for "${validatedData.topic}".
Target keywords: ${validatedData.keywords?.join(", ") || "None specified"}

Create:
1. SEO title (under 60 characters)
2. Meta description (under 160 characters)
3. H1 heading
4. Content outline with H2/H3 suggestions
5. Keyword suggestions

Return as JSON with proper SEO structure.
`;
        break;

      case "marketing":
        prompt = `
Create marketing copy for "${validatedData.topic}".
Tone: ${validatedData.tone}
Focus keywords: ${validatedData.keywords?.join(", ") || "None specified"}

Generate:
1. Compelling headline
2. Value proposition
3. Benefits list
4. Strong call-to-action
5. Social proof suggestions

Return as JSON with marketing structure.
`;
        break;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    let contentData;

    try {
      contentData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    // Save AI content to database
    const aiContent = await prisma.aIContent.create({
      data: {
        type: validatedData.type.toUpperCase(),
        prompt: JSON.stringify(validatedData),
        content: contentData,
        status: "COMPLETED",
        metadata: {
          model: "llama3-8b-8192",
          timestamp: new Date().toISOString(),
        },
      },
    });

    res.json({
      success: true,
      data: contentData,
      aiContentId: aiContent.id,
    });
  } catch (error) {
    console.error("Content generation error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    res.status(500).json({ error: "Failed to generate content" });
  }
});

// Get AI generation history
router.get("/history", async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;

    const where = {};
    if (type) {
      where.type = type.toUpperCase();
    }

    const aiContent = await prisma.aIContent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        project: {
          select: { id: true, name: true },
        },
        website: {
          select: { id: true, name: true },
        },
      },
    });

    const total = await prisma.aIContent.count({ where });

    res.json({
      success: true,
      data: aiContent,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Failed to fetch AI history:", error);
    res.status(500).json({ error: "Failed to fetch AI history" });
  }
});

// Regenerate content by ID
router.post("/regenerate/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existingContent = await prisma.aIContent.findUnique({
      where: { id },
    });

    if (!existingContent) {
      return res.status(404).json({ error: "AI content not found" });
    }

    const originalPrompt = JSON.parse(existingContent.prompt);

    // Use the same endpoint logic based on content type
    if (existingContent.type === "WEBSITE_STRUCTURE") {
      req.body = originalPrompt;
      return await router.handle(req, res, "generate-website");
    } else {
      req.body = originalPrompt;
      return await router.handle(req, res, "generate-content");
    }
  } catch (error) {
    console.error("Regeneration error:", error);
    res.status(500).json({ error: "Failed to regenerate content" });
  }
});

module.exports = router;
