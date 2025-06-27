"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Plus,
  Eye,
  ArrowUp,
  ArrowDown,
  Trash2,
  RefreshCw,
  Settings,
  FileText,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  image?: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

interface TestimonialItem {
  text: string;
  author: string;
  company: string;
}

interface ContentBlock {
  id: string;
  type:
    | "hero"
    | "about"
    | "services"
    | "features"
    | "testimonials"
    | "contact"
    | "cta"
    | "gallery";
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    backgroundImage?: string;
    image?: string;
    highlights?: string[];
    services?: ServiceItem[];
    features?: FeatureItem[];
    testimonials?: TestimonialItem[];
    images?: string[];
    address?: string;
    email?: string;
    phone?: string;
  };
  styles: {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    textAlign?: string;
    height?: string;
    minHeight?: string;
  };
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface ThemeFonts {
  heading: string;
  body: string;
}

interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
}

interface Website {
  id: string;
  title: string;
  businessName: string;
  businessType: string;
  location: string;
  blocks: ContentBlock[];
  theme: Theme;
}

interface BusinessInfo {
  name: string;
  type: string;
  location: string;
  description: string;
}

interface ProjectData {
  id: string;
  title: string;
  businessName: string;
  businessType: string;
  lastModified: string;
  status: "published" | "unpublished";
  previewImage: string;
  websiteData: Website;
}

export default function WebsiteBuilder() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [website, setWebsite] = useState<Website | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [floatingActionsPosition, setFloatingActionsPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [sectionSelectorPosition, setSectionSelectorPosition] = useState<
    string | null
  >(null);

  // New editing states
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{
    blockId: string;
    elementType: "text" | "image" | "button" | "background";
    field: string;
  } | null>(null);

  // Image settings popup states
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    blockId: string;
    field: string;
    currentUrl: string;
    altText: string;
  } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [imageAltText, setImageAltText] = useState("");
  const [imagePosition, setImagePosition] = useState({
    horizontal: 50,
    vertical: 50,
  });
  const [panelPosition, setPanelPosition] = useState({
    x: window.innerWidth - 320,
    width: 320,
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = "/";
      return;
    }

    if (isLoaded && isSignedIn && user) {
      // Check if we already have a generated website for this user
      const existingWebsite = localStorage.getItem(
        `generated_website_${user.id}`
      );
      if (existingWebsite) {
        try {
          const parsedWebsite = JSON.parse(existingWebsite);
          console.log("Loading existing website from localStorage");
          setWebsite(parsedWebsite);
          setIsGenerating(false);
        } catch (error) {
          console.error("Error parsing existing website data:", error);
          // If corrupted data, generate new website
          generateWebsiteFromBusinessInfo();
        }
      } else {
        // No existing website, generate new one
        generateWebsiteFromBusinessInfo();
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const generateWebsiteFromBusinessInfo = async () => {
    try {
      // Get business info from localStorage
      const businessInfoStr = localStorage.getItem(`business_info_${user?.id}`);
      if (!businessInfoStr) {
        // Redirect back to onboarding if no business info
        window.location.href = "/onboarding";
        return;
      }

      const businessInfo: BusinessInfo = JSON.parse(businessInfoStr);
      console.log("Generating website for:", businessInfo);

      setIsGenerating(true);

      // Generate AI content for the website
      const generatedWebsite = await generateWebsiteContent(businessInfo);
      setWebsite(generatedWebsite);

      // Save the generated website to localStorage for persistence
      localStorage.setItem(
        `generated_website_${user?.id}`,
        JSON.stringify(generatedWebsite)
      );

      // Track this as the most recent project
      saveToRecentProjects(generatedWebsite);
    } catch (error) {
      console.error("Error generating website:", error);
      setIsGenerating(false);
      // Show error message to user
      alert(
        `Website generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please ensure your API keys are configured.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWebsiteContent = async (
    businessInfo: BusinessInfo
  ): Promise<Website> => {
    console.log("Starting AI generation for business:", businessInfo);

    // Generate content using GROQ API
    const websiteContent = await generateAIContent(businessInfo);

    // Create business-type specific image queries
    const businessType = businessInfo.type.toLowerCase();
    const location = businessInfo.location;

    // Generate highly specific image queries based on business type
    const heroImageQuery = createBusinessSpecificImageQuery(
      businessType,
      "hero",
      location
    );
    const aboutImageQuery = createBusinessSpecificImageQuery(
      businessType,
      "about",
      location
    );
    const servicesImageQueries = [
      createBusinessSpecificImageQuery(businessType, "service1", location),
      createBusinessSpecificImageQuery(businessType, "service2", location),
      createBusinessSpecificImageQuery(businessType, "service3", location),
    ];

    console.log("Generated image queries:", {
      hero: heroImageQuery,
      about: aboutImageQuery,
      services: servicesImageQueries,
    });

    // Fetch images from Pexels with business-specific queries
    const heroImage = await fetchPexelsImage(heroImageQuery);
    const aboutImage = await fetchPexelsImage(aboutImageQuery);
    const servicesImages = await Promise.all(
      servicesImageQueries.map((query) => fetchPexelsImage(query))
    );

    // Generate theme first
    const theme = generateThemeFromBusinessType(businessInfo.type);

    // Create the website structure
    const website: Website = {
      id: `website-${Date.now()}`,
      title: `${businessInfo.name} - ${businessInfo.type}`,
      businessName: businessInfo.name,
      businessType: businessInfo.type,
      location: businessInfo.location,
      theme: theme,
      blocks: [
        // Hero Section
        {
          id: "hero-1",
          type: "hero",
          content: {
            title: websiteContent.hero.title,
            subtitle: websiteContent.hero.subtitle,
            buttonText: websiteContent.hero.buttonText,
            backgroundImage: heroImage,
          },
          styles: {
            textAlign: "center",
            height: "70vh",
            minHeight: "600px",
          },
        },
        // About Section
        {
          id: "about-1",
          type: "about",
          content: {
            title: websiteContent.about.title,
            description: websiteContent.about.description,
            image: aboutImage,
            highlights: websiteContent.about.highlights,
          },
          styles: {
            padding: "80px 0",
            backgroundColor: "#f8fafc",
          },
        },
        // Services Section
        {
          id: "services-1",
          type: "services",
          content: {
            title: websiteContent.services.title,
            subtitle: websiteContent.services.subtitle,
            services: websiteContent.services.items.map(
              (service: ServiceItem, index: number) => ({
                ...service,
                image: servicesImages[index] || servicesImages[0],
              })
            ),
          },
          styles: {
            padding: "80px 0",
            backgroundColor: "#ffffff",
          },
        },
        // Features Section
        {
          id: "features-1",
          type: "features",
          content: {
            title: websiteContent.features.title,
            subtitle: websiteContent.features.subtitle,
            features: websiteContent.features.items,
          },
          styles: {
            padding: "80px 0",
            backgroundColor: "#f1f5f9",
          },
        },
        // Contact Section
        {
          id: "contact-1",
          type: "contact",
          content: {
            title: websiteContent.contact.title,
            subtitle: websiteContent.contact.subtitle,
            address: `${businessInfo.location}`,
            email: `contact@${businessInfo.name
              .toLowerCase()
              .replace(/\s+/g, "")}.com`,
            phone: "+1 (555) 123-4567",
          },
          styles: {
            padding: "80px 0",
            backgroundColor: "#ffffff",
          },
        },
        // CTA Section
        {
          id: "cta-1",
          type: "cta",
          content: {
            title: websiteContent.cta.title,
            subtitle: websiteContent.cta.subtitle,
            buttonText: websiteContent.cta.buttonText,
          },
          styles: {
            backgroundColor: theme.colors.primary || "#3b82f6",
            color: "white",
            padding: "80px 20px",
            textAlign: "center",
          },
        },
      ],
    };

    // Save to your existing backend
    await saveWebsiteToBackend(website, businessInfo);

    return website;
  };

  // New function to create business-type specific image queries
  const createBusinessSpecificImageQuery = (
    businessType: string,
    imageType: string,
    location: string
  ): string => {
    const businessTypeKeywords = extractBusinessKeywords(businessType);
    const locationContext = location ? ` in ${location}` : "";

    const imageTypeQueries = {
      hero: [
        `${businessTypeKeywords.primary} business professional modern office`,
        `${businessTypeKeywords.primary} company headquarters building`,
        `professional ${businessTypeKeywords.primary} workspace modern`,
        `${businessTypeKeywords.primary} business professional environment`,
      ],
      about: [
        `${businessTypeKeywords.primary} team meeting professional collaboration`,
        `${businessTypeKeywords.primary} professionals working together`,
        `${businessTypeKeywords.primary} business people office meeting`,
        `professional ${businessTypeKeywords.primary} team discussion`,
      ],
      service1: [
        `${businessTypeKeywords.primary} service professional consultation`,
        `${businessTypeKeywords.secondary} professional service delivery`,
        `${businessTypeKeywords.primary} expert professional advice`,
        `professional ${businessTypeKeywords.primary} client meeting`,
      ],
      service2: [
        `${businessTypeKeywords.secondary} professional technology solution`,
        `${businessTypeKeywords.primary} digital professional tools`,
        `modern ${businessTypeKeywords.primary} professional equipment`,
        `${businessTypeKeywords.primary} professional innovation technology`,
      ],
      service3: [
        `${businessTypeKeywords.primary} professional quality service`,
        `${businessTypeKeywords.secondary} professional excellence`,
        `professional ${businessTypeKeywords.primary} premium service`,
        `${businessTypeKeywords.primary} professional high quality`,
      ],
    };

    const queries =
      imageTypeQueries[imageType as keyof typeof imageTypeQueries] ||
      imageTypeQueries.hero;
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    return `${randomQuery}${locationContext} professional high quality`;
  };

  // Function to extract relevant keywords from business type
  const extractBusinessKeywords = (
    businessType: string
  ): { primary: string; secondary: string } => {
    const type = businessType.toLowerCase();

    // Define business type mappings for better image targeting
    const businessMappings: Record<
      string,
      { primary: string; secondary: string }
    > = {
      // Technology related
      software: {
        primary: "software development",
        secondary: "technology coding",
      },
      tech: { primary: "technology", secondary: "software innovation" },
      "web development": {
        primary: "web development",
        secondary: "coding programming",
      },
      "app development": {
        primary: "app development",
        secondary: "mobile technology",
      },
      it: { primary: "IT technology", secondary: "computer systems" },
      "artificial intelligence": {
        primary: "AI technology",
        secondary: "machine learning",
      },
      cybersecurity: {
        primary: "cybersecurity",
        secondary: "network security",
      },

      // Healthcare related
      healthcare: {
        primary: "healthcare medical",
        secondary: "hospital clinic",
      },
      medical: { primary: "medical healthcare", secondary: "doctor clinic" },
      dental: { primary: "dental clinic", secondary: "dentist office" },
      pharmacy: {
        primary: "pharmacy medical",
        secondary: "medicine healthcare",
      },
      fitness: { primary: "fitness gym", secondary: "workout exercise" },
      nutrition: { primary: "nutrition health", secondary: "healthy food" },
      wellness: { primary: "wellness health", secondary: "spa therapy" },

      // Business services
      consulting: {
        primary: "business consulting",
        secondary: "professional advisory",
      },
      marketing: {
        primary: "marketing digital",
        secondary: "advertising brand",
      },
      accounting: {
        primary: "accounting finance",
        secondary: "financial planning",
      },
      legal: { primary: "legal law", secondary: "lawyer attorney" },
      "real estate": { primary: "real estate", secondary: "property home" },
      insurance: {
        primary: "insurance financial",
        secondary: "protection coverage",
      },

      // Creative services
      design: { primary: "graphic design", secondary: "creative studio" },
      photography: {
        primary: "photography studio",
        secondary: "camera professional",
      },
      video: { primary: "video production", secondary: "filming studio" },
      music: { primary: "music studio", secondary: "recording audio" },
      art: { primary: "art studio", secondary: "creative artwork" },

      // Food & Restaurant
      restaurant: { primary: "restaurant dining", secondary: "food kitchen" },
      cafe: { primary: "cafe coffee", secondary: "coffee shop" },
      bakery: { primary: "bakery bread", secondary: "baking pastry" },
      catering: { primary: "catering food", secondary: "event dining" },
      food: { primary: "food service", secondary: "culinary dining" },

      // Education
      education: {
        primary: "education learning",
        secondary: "school classroom",
      },
      training: {
        primary: "training education",
        secondary: "learning development",
      },
      tutoring: {
        primary: "tutoring education",
        secondary: "student learning",
      },
      coaching: {
        primary: "coaching training",
        secondary: "mentoring development",
      },

      // Retail & E-commerce
      retail: { primary: "retail store", secondary: "shopping customer" },
      ecommerce: { primary: "ecommerce online", secondary: "shopping digital" },
      fashion: { primary: "fashion clothing", secondary: "style apparel" },
      beauty: { primary: "beauty salon", secondary: "cosmetics skincare" },

      // Construction & Home
      construction: {
        primary: "construction building",
        secondary: "contractor tools",
      },
      architecture: {
        primary: "architecture design",
        secondary: "building planning",
      },
      plumbing: {
        primary: "plumbing service",
        secondary: "repair maintenance",
      },
      electrical: {
        primary: "electrical service",
        secondary: "electrician tools",
      },
      cleaning: {
        primary: "cleaning service",
        secondary: "maintenance janitorial",
      },

      // Transportation
      automotive: { primary: "automotive car", secondary: "vehicle repair" },
      logistics: {
        primary: "logistics shipping",
        secondary: "transportation delivery",
      },
      travel: { primary: "travel tourism", secondary: "vacation destination" },

      // Personal services
      "personal training": {
        primary: "personal training fitness",
        secondary: "gym workout",
      },
      massage: { primary: "massage therapy", secondary: "spa relaxation" },
      hair: { primary: "hair salon", secondary: "styling beauty" },
      pet: { primary: "pet care", secondary: "animal veterinary" },
    };

    // Find the best match for the business type
    for (const [key, value] of Object.entries(businessMappings)) {
      if (type.includes(key)) {
        return value;
      }
    }

    // Fallback: extract first few words and use them
    const words = type.split(" ").slice(0, 2);
    return {
      primary: words.join(" "),
      secondary: `${words[0]} professional`,
    };
  };

  // Save to your existing backend API
  const saveWebsiteToBackend = async (
    website: Website,
    businessInfo: BusinessInfo
  ) => {
    try {
      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: website.title,
          subdomain: website.businessName.toLowerCase().replace(/\s+/g, "-"),
          projectId: "temp-project-id", // You'll need to create/get project first
          theme: website.theme,
          content: website.blocks,
          businessInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Website saved successfully:", data);
        return data;
      } else {
        const errorData = await response.json();
        console.error("Failed to save website to backend:", errorData);
      }
    } catch (error) {
      console.error("Error saving website to backend:", error);
    }
  };

  // New function to save to recent projects for dashboard
  const saveToRecentProjects = (website: Website) => {
    try {
      const recentProjects: ProjectData[] = JSON.parse(
        localStorage.getItem(`recent_projects_${user?.id}`) || "[]"
      );

      const projectData: ProjectData = {
        id: website.id,
        title: website.title,
        businessName: website.businessName,
        businessType: website.businessType,
        lastModified: new Date().toISOString(),
        status: "unpublished",
        previewImage:
          website.blocks.find((block) => block.type === "hero")?.content
            ?.backgroundImage || "",
        websiteData: website,
      };

      // Remove any existing entry for this website
      const filteredProjects = recentProjects.filter(
        (p: ProjectData) => p.id !== website.id
      );

      // Add the new/updated entry at the beginning
      const updatedProjects = [projectData, ...filteredProjects];

      // Keep only the last 10 projects
      const limitedProjects = updatedProjects.slice(0, 10);

      localStorage.setItem(
        `recent_projects_${user?.id}`,
        JSON.stringify(limitedProjects)
      );
      console.log("Saved to recent projects:", projectData);
    } catch (error) {
      console.error("Error saving to recent projects:", error);
    }
  };

  // Function to update project status and move to top
  const updateProjectStatus = (
    website: Website,
    status: "published" | "unpublished"
  ) => {
    try {
      const recentProjects: ProjectData[] = JSON.parse(
        localStorage.getItem(`recent_projects_${user?.id}`) || "[]"
      );

      const projectData: ProjectData = {
        id: website.id,
        title: website.title,
        businessName: website.businessName,
        businessType: website.businessType,
        lastModified: new Date().toISOString(),
        status: status,
        previewImage:
          website.blocks.find((block) => block.type === "hero")?.content
            ?.backgroundImage || "",
        websiteData: website,
      };

      // Remove any existing entry for this website
      const filteredProjects = recentProjects.filter(
        (p: ProjectData) => p.id !== website.id
      );

      // Add the updated entry at the beginning
      const updatedProjects = [projectData, ...filteredProjects];

      localStorage.setItem(
        `recent_projects_${user?.id}`,
        JSON.stringify(updatedProjects)
      );
      console.log(`Updated project status to ${status} and moved to top`);
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };

  const generateAIContent = async (businessInfo: BusinessInfo) => {
    try {
      // Call GROQ API to generate website content
      const prompt = `Generate website content for a ${businessInfo.type} business named "${businessInfo.name}" located in ${businessInfo.location}. 

Create a professional website with the following sections:
1. Hero section with compelling headline and subtitle
2. About section describing the business
3. Services section with 3 main services
4. Features section with 4 key features/benefits
5. Contact section
6. Call-to-action section

Make it sound professional, engaging, and specific to the business type and location. Return as JSON with this structure:
{
  "hero": {"title": "", "subtitle": "", "buttonText": ""},
  "about": {"title": "", "description": "", "highlights": ["", "", ""]},
  "services": {"title": "", "subtitle": "", "items": [{"title": "", "description": "", "icon": ""}, ...]},
  "features": {"title": "", "subtitle": "", "items": [{"title": "", "description": "", "icon": ""}, ...]},
  "contact": {"title": "", "subtitle": ""},
  "cta": {"title": "", "subtitle": "", "buttonText": ""}
}`;

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          businessInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.content;
      } else {
        throw new Error("Failed to generate AI content - API key required");
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      throw new Error(
        "AI content generation failed - please check your GROQ_API_KEY"
      );
    }
  };

  const fetchPexelsImage = async (query: string): Promise<string> => {
    try {
      const response = await fetch("/api/fetch-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        const errorData = await response.json();
        console.error("Image fetch error:", errorData.error);
        throw new Error(`Image fetch failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      throw new Error(
        "Image fetching failed - please check your PEXELS_API_KEY environment variable"
      );
    }
  };

  const generateThemeFromBusinessType = (businessType: string): Theme => {
    const themes: Record<string, Theme> = {
      technology: {
        colors: {
          primary: "#3b82f6",
          secondary: "#64748b",
          accent: "#06b6d4",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          text: "#1e293b",
        },
        fonts: { heading: "Inter", body: "Inter" },
      },
      healthcare: {
        colors: {
          primary: "#059669",
          secondary: "#6b7280",
          accent: "#10b981",
          background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
          text: "#1f2937",
        },
        fonts: { heading: "Inter", body: "Inter" },
      },
      finance: {
        colors: {
          primary: "#1e40af",
          secondary: "#64748b",
          accent: "#3b82f6",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          text: "#1e293b",
        },
        fonts: { heading: "Inter", body: "Inter" },
      },
      restaurant: {
        colors: {
          primary: "#dc2626",
          secondary: "#6b7280",
          accent: "#f59e0b",
          background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
          text: "#1f2937",
        },
        fonts: { heading: "Inter", body: "Inter" },
      },
      default: {
        colors: {
          primary: "#6366f1",
          secondary: "#64748b",
          accent: "#f59e0b",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          text: "#1f2937",
        },
        fonts: { heading: "Inter", body: "Inter" },
      },
    };

    const type = Object.keys(themes).find((key) =>
      businessType.toLowerCase().includes(key)
    );

    return themes[type || "default"];
  };

  // Loading state while generating
  if (isGenerating || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-8"></div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {localStorage.getItem(`generated_website_${user?.id}`)
              ? "Loading Your Website..."
              : "Creating Your Website..."}
          </h3>
          <p className="text-gray-600 max-w-md">
            {localStorage.getItem(`generated_website_${user?.id}`)
              ? "Loading your previously created website from storage."
              : "Our AI is crafting a beautiful, professional website tailored specifically for your business. This will just take a moment."}
          </p>
          {!localStorage.getItem(`generated_website_${user?.id}`) && (
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>✨ Generating content</span>
              <span>🎨 Selecting images</span>
              <span>🎯 Customizing design</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleBlockClick = (blockId: string, event: React.MouseEvent) => {
    if (isPreviewMode) return;

    event.stopPropagation();
    setSelectedBlock(blockId);
    setShowFloatingActions(true);
    setFloatingActionsPosition({
      x: event.clientX,
      y: event.clientY - 60,
    });
  };

  const handleTextDoubleClick = (blockId: string, field: string) => {
    if (isPreviewMode) return;
    setEditingText(`${blockId}-${field}`);
  };

  const handleTextChange = (blockId: string, field: string, value: string) => {
    setWebsite((prev) => {
      if (!prev) return null;
      const updatedWebsite = {
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === blockId
            ? {
                ...block,
                content: {
                  ...block.content,
                  [field]: value,
                },
              }
            : block
        ),
      };

      // Save updated website to localStorage
      if (user?.id) {
        localStorage.setItem(
          `generated_website_${user.id}`,
          JSON.stringify(updatedWebsite)
        );
        // Update recent projects with the change
        saveToRecentProjects(updatedWebsite);
      }

      return updatedWebsite;
    });
  };

  const addSection = (type: ContentBlock["type"], afterBlockId?: string) => {
    const newBlock: ContentBlock = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };

    setWebsite((prev) => {
      if (!prev) return null;
      const blocks = [...prev.blocks];
      if (afterBlockId) {
        const index = blocks.findIndex((b) => b.id === afterBlockId);
        blocks.splice(index + 1, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }

      const updatedWebsite = { ...prev, blocks };

      // Save updated website to localStorage
      if (user?.id) {
        localStorage.setItem(
          `generated_website_${user.id}`,
          JSON.stringify(updatedWebsite)
        );
        // Update recent projects with the change
        saveToRecentProjects(updatedWebsite);
      }

      return updatedWebsite;
    });

    setShowSectionSelector(false);
    setSectionSelectorPosition(null);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    setWebsite((prev) => {
      if (!prev) return null;
      const blocks = [...prev.blocks];
      const index = blocks.findIndex((b) => b.id === blockId);

      if (direction === "up" && index > 0) {
        [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
      } else if (direction === "down" && index < blocks.length - 1) {
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      }

      const updatedWebsite = { ...prev, blocks };

      // Save updated website to localStorage
      if (user?.id) {
        localStorage.setItem(
          `generated_website_${user.id}`,
          JSON.stringify(updatedWebsite)
        );
        // Update recent projects with the change
        saveToRecentProjects(updatedWebsite);
      }

      return updatedWebsite;
    });
  };

  const deleteBlock = (blockId: string) => {
    setWebsite((prev) => {
      if (!prev) return null;
      const updatedWebsite = {
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== blockId),
      };

      // Save updated website to localStorage
      if (user?.id) {
        localStorage.setItem(
          `generated_website_${user.id}`,
          JSON.stringify(updatedWebsite)
        );
        // Update recent projects with the change
        saveToRecentProjects(updatedWebsite);
      }

      return updatedWebsite;
    });
    setSelectedBlock(null);
    setShowFloatingActions(false);
  };

  const regenerateImages = async (blockId: string) => {
    // Image regeneration with AI/Pexels API
    console.log("Regenerating images for block:", blockId);
    // Placeholder for now
  };

  // New element editing functions
  const handleElementClick = (
    blockId: string,
    elementType: "text" | "image" | "button" | "background",
    field: string,
    event: React.MouseEvent
  ) => {
    if (isPreviewMode) return;

    event.stopPropagation();
    setSelectedElement({ blockId, elementType, field });
    setShowEditPanel(true);
  };

  const generateNewImage = async (
    blockId: string,
    field: string,
    query: string
  ) => {
    try {
      const newImage = await fetchPexelsImage(query);
      setWebsite((prev) => {
        if (!prev) return null;
        const updatedWebsite = {
          ...prev,
          blocks: prev.blocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  content: {
                    ...block.content,
                    [field]: newImage,
                  },
                }
              : block
          ),
        };

        // Save updated website to localStorage
        if (user?.id) {
          localStorage.setItem(
            `generated_website_${user.id}`,
            JSON.stringify(updatedWebsite)
          );
          // Update recent projects with the change
          saveToRecentProjects(updatedWebsite);
        }

        return updatedWebsite;
      });
    } catch (error) {
      console.error("Failed to generate new image:", error);
    }
  };

  const updateElementStyle = (
    blockId: string,
    styleProperty: string,
    value: string
  ) => {
    setWebsite((prev) => {
      if (!prev) return null;
      const updatedWebsite = {
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === blockId
            ? {
                ...block,
                styles: {
                  ...block.styles,
                  [styleProperty]: value,
                },
              }
            : block
        ),
      };

      // Save updated website to localStorage
      if (user?.id) {
        localStorage.setItem(
          `generated_website_${user.id}`,
          JSON.stringify(updatedWebsite)
        );
        // Update recent projects with the change
        saveToRecentProjects(updatedWebsite);
      }

      return updatedWebsite;
    });
  };

  const getDefaultContent = (type: ContentBlock["type"]) => {
    switch (type) {
      case "hero":
        return {
          title: "Your Amazing Title",
          subtitle: "Describe your business in a compelling way",
          buttonText: "Get Started",
          backgroundImage:
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=800&fit=crop&q=80",
        };
      case "about":
        return {
          title: "About Us",
          description: "Tell your story and what makes your business unique.",
          image:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
          highlights: ["Quality", "Innovation", "Excellence"],
        };
      case "services":
        return {
          title: "Our Services",
          subtitle: "What we offer",
          services: [
            {
              title: "Service 1",
              description: "Description of your first service",
              image:
                "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop&q=80",
              icon: "🎯",
            },
            {
              title: "Service 2",
              description: "Description of your second service",
              image:
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop&q=80",
              icon: "⚡",
            },
          ],
        };
      case "features":
        return {
          title: "Why Choose Us",
          subtitle: "What sets us apart",
          features: [
            {
              title: "Feature 1",
              description: "Feature description",
              icon: "⭐",
            },
            {
              title: "Feature 2",
              description: "Feature description",
              icon: "🏆",
            },
          ],
        };
      case "contact":
        return {
          title: "Contact Us",
          subtitle: "Get in touch with us today",
          address: "123 Business St, City, State 12345",
          email: "contact@business.com",
          phone: "(555) 123-4567",
        };
      case "cta":
        return {
          title: "Ready to Get Started?",
          subtitle: "Contact us today to learn more",
          buttonText: "Get Started",
        };
      case "testimonials":
        return {
          title: "What Our Clients Say",
          testimonials: [
            {
              text: "Amazing service and great results!",
              author: "John Doe",
              company: "ABC Company",
            },
          ],
        };
      case "gallery":
        return {
          title: "Our Work",
          images: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop&q=80",
            "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&q=80",
          ],
        };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: ContentBlock["type"]) => {
    switch (type) {
      case "hero":
        return {
          height: "70vh",
          minHeight: "600px",
          textAlign: "center",
        };
      case "about":
        return {
          padding: "80px 0",
          backgroundColor: "#f8fafc",
        };
      case "services":
        return {
          padding: "80px 0",
          backgroundColor: "#ffffff",
        };
      case "features":
        return {
          padding: "80px 0",
          backgroundColor: "#f1f5f9",
        };
      case "contact":
        return {
          padding: "80px 0",
          backgroundColor: "#ffffff",
        };
      case "cta":
        return {
          padding: "80px 20px",
          backgroundColor: website?.theme?.colors?.primary || "#3b82f6",
          color: "white",
          textAlign: "center",
        };
      default:
        return {};
    }
  };

  const renderBlock = (block: ContentBlock) => {
    const isSelected = selectedBlock === block.id;

    return (
      <div
        key={block.id}
        className={`relative group ${isSelected ? "ring-2 ring-blue-500" : ""}`}
        onClick={(e) => handleBlockClick(block.id, e)}
        style={block.styles as React.CSSProperties}
      >
        {/* Block Content */}
        {block.type === "hero" && (
          <div
            className="relative h-full flex items-center justify-center text-white cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${block.content.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: block.styles.minHeight || "600px",
            }}
            onClick={(e) =>
              handleImageClick(
                block.id,
                "backgroundImage",
                block.content.backgroundImage || "",
                e
              )
            }
          >
            <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
              <h1
                className="text-5xl md:text-6xl font-bold mb-6 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2 rounded transition-all"
                onClick={(e) =>
                  handleElementClick(block.id, "text", "title", e)
                }
                onDoubleClick={() => handleTextDoubleClick(block.id, "title")}
              >
                {editingText === `${block.id}-title` ? (
                  <input
                    type="text"
                    value={
                      (
                        website?.blocks.find((b) => b.id === block.id)
                          ?.content as Record<string, string>
                      )?.[block.id + "-title"] || ""
                    }
                    onChange={(e) =>
                      handleTextChange(block.id, "title", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b-2 border-white text-white text-center w-full outline-none"
                    autoFocus
                  />
                ) : (
                  block.content.title
                )}
              </h1>
              <p
                className="text-xl md:text-2xl mb-8 opacity-90 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2 rounded transition-all"
                onClick={(e) =>
                  handleElementClick(block.id, "text", "subtitle", e)
                }
                onDoubleClick={() =>
                  handleTextDoubleClick(block.id, "subtitle")
                }
              >
                {editingText === `${block.id}-subtitle` ? (
                  <textarea
                    value={
                      (
                        website?.blocks.find((b) => b.id === block.id)
                          ?.content as Record<string, string>
                      )?.[block.id + "-subtitle"] || ""
                    }
                    onChange={(e) =>
                      handleTextChange(block.id, "subtitle", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    className="bg-transparent border-b-2 border-white text-white text-center w-full outline-none resize-none"
                    autoFocus
                  />
                ) : (
                  block.content.subtitle
                )}
              </p>
              <button
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2"
                onClick={(e) =>
                  handleElementClick(block.id, "button", "buttonText", e)
                }
                onDoubleClick={() =>
                  handleTextDoubleClick(block.id, "buttonText")
                }
              >
                {editingText === `${block.id}-buttonText` ? (
                  <input
                    type="text"
                    value={
                      (
                        website?.blocks.find((b) => b.id === block.id)
                          ?.content as Record<string, string>
                      )?.[block.id + "-buttonText"] || ""
                    }
                    onChange={(e) =>
                      handleTextChange(block.id, "buttonText", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    className="bg-transparent text-gray-900 text-center outline-none"
                    autoFocus
                  />
                ) : (
                  block.content.buttonText
                )}
              </button>
            </div>
          </div>
        )}

        {block.type === "about" && (
          <div className="py-20" style={{ backgroundColor: "#f8fafc" }}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2
                    className="text-4xl font-bold mb-6 cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 rounded transition-all"
                    style={{ color: website.theme.colors.text }}
                    onClick={(e) =>
                      handleElementClick(block.id, "text", "title", e)
                    }
                    onDoubleClick={() =>
                      handleTextDoubleClick(block.id, "title")
                    }
                  >
                    {editingText === `${block.id}-title` ? (
                      <input
                        type="text"
                        value={
                          (
                            website?.blocks.find((b) => b.id === block.id)
                              ?.content as Record<string, string>
                          )?.[block.id + "-title"] || ""
                        }
                        onChange={(e) =>
                          handleTextChange(block.id, "title", e.target.value)
                        }
                        onBlur={() => setEditingText(null)}
                        className="w-full outline-none bg-transparent border-b-2"
                        autoFocus
                      />
                    ) : (
                      block.content.title
                    )}
                  </h2>
                  <p
                    className="text-lg mb-8 leading-relaxed cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 rounded transition-all text-gray-700"
                    onClick={(e) =>
                      handleElementClick(block.id, "text", "description", e)
                    }
                    onDoubleClick={() =>
                      handleTextDoubleClick(block.id, "description")
                    }
                  >
                    {editingText === `${block.id}-description` ? (
                      <textarea
                        value={
                          (
                            website?.blocks.find((b) => b.id === block.id)
                              ?.content as Record<string, string>
                          )?.[block.id + "-description"] || ""
                        }
                        onChange={(e) =>
                          handleTextChange(
                            block.id,
                            "description",
                            e.target.value
                          )
                        }
                        onBlur={() => setEditingText(null)}
                        className="w-full outline-none bg-transparent border-b-2 resize-none"
                        rows={4}
                        autoFocus
                      />
                    ) : (
                      block.content.description
                    )}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {block.content.highlights?.map(
                      (highlight: string, index: number) => (
                        <span
                          key={index}
                          className="px-4 py-2 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor:
                              website.theme.colors.primary + "20",
                            color: website.theme.colors.primary,
                          }}
                        >
                          {highlight}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={block.content.image}
                    alt="About us"
                    className="rounded-2xl shadow-xl w-full h-96 object-cover cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 transition-all"
                    onClick={(e) =>
                      handleImageClick(
                        block.id,
                        "image",
                        block.content.image || "",
                        e
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {block.type === "services" && (
          <div className="py-20" style={{ backgroundColor: "#ffffff" }}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2
                  className="text-4xl font-bold mb-4"
                  style={{ color: website.theme.colors.text }}
                  onClick={(e) =>
                    handleElementClick(block.id, "text", "title", e)
                  }
                  onDoubleClick={() => handleTextDoubleClick(block.id, "title")}
                >
                  {editingText === `${block.id}-title` ? (
                    <input
                      type="text"
                      value={
                        (
                          website?.blocks.find((b) => b.id === block.id)
                            ?.content as Record<string, string>
                        )?.[block.id + "-title"] || ""
                      }
                      onChange={(e) =>
                        handleTextChange(block.id, "title", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      className="w-full outline-none bg-transparent border-b-2 text-center"
                      autoFocus
                    />
                  ) : (
                    block.content.title
                  )}
                </h2>
                <p
                  className="text-xl"
                  style={{ color: website.theme.colors.secondary }}
                  onClick={(e) =>
                    handleElementClick(block.id, "text", "subtitle", e)
                  }
                  onDoubleClick={() =>
                    handleTextDoubleClick(block.id, "subtitle")
                  }
                >
                  {editingText === `${block.id}-subtitle` ? (
                    <input
                      type="text"
                      value={
                        (
                          website?.blocks.find((b) => b.id === block.id)
                            ?.content as Record<string, string>
                        )?.[block.id + "-subtitle"] || ""
                      }
                      onChange={(e) =>
                        handleTextChange(block.id, "subtitle", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      className="w-full outline-none bg-transparent border-b-2 text-center"
                      autoFocus
                    />
                  ) : (
                    block.content.subtitle
                  )}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {block.content.services?.map(
                  (service: ServiceItem, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-48 object-cover cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 transition-all"
                        onClick={(e) =>
                          handleImageClick(
                            block.id,
                            `services[${index}].image`,
                            service.image || "",
                            e
                          )
                        }
                      />
                      <div className="p-6">
                        <div className="text-2xl mb-3">{service.icon}</div>
                        <h3
                          className="text-xl font-bold mb-3"
                          style={{ color: website.theme.colors.text }}
                        >
                          {service.title}
                        </h3>
                        <p style={{ color: website.theme.colors.secondary }}>
                          {service.description}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {block.type === "features" && (
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2
                  className="text-4xl font-bold mb-4"
                  style={{ color: website.theme.colors.text }}
                  onDoubleClick={() => handleTextDoubleClick(block.id, "title")}
                >
                  {editingText === `${block.id}-title` ? (
                    <input
                      type="text"
                      value={
                        (
                          website?.blocks.find((b) => b.id === block.id)
                            ?.content as Record<string, string>
                        )?.[block.id + "-title"] || ""
                      }
                      onChange={(e) =>
                        handleTextChange(block.id, "title", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      className="w-full outline-none bg-transparent border-b-2 text-center"
                      autoFocus
                    />
                  ) : (
                    block.content.title
                  )}
                </h2>
                <p
                  className="text-xl"
                  style={{ color: website.theme.colors.secondary }}
                  onDoubleClick={() =>
                    handleTextDoubleClick(block.id, "subtitle")
                  }
                >
                  {editingText === `${block.id}-subtitle` ? (
                    <input
                      type="text"
                      value={
                        (
                          website?.blocks.find((b) => b.id === block.id)
                            ?.content as Record<string, string>
                        )?.[block.id + "-subtitle"] || ""
                      }
                      onChange={(e) =>
                        handleTextChange(block.id, "subtitle", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      className="w-full outline-none bg-transparent border-b-2 text-center"
                      autoFocus
                    />
                  ) : (
                    block.content.subtitle
                  )}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {block.content.features?.map(
                  (feature: FeatureItem, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl mb-4">{feature.icon}</div>
                      <h3
                        className="text-xl font-bold mb-3"
                        style={{ color: website.theme.colors.text }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{ color: website.theme.colors.secondary }}>
                        {feature.description}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {block.type === "contact" && (
          <div className="py-20">
            <div className="max-4xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2
                  className="text-4xl font-bold mb-4"
                  style={{ color: website.theme.colors.text }}
                  onDoubleClick={() => handleTextDoubleClick(block.id, "title")}
                >
                  {editingText === `${block.id}-title` ? (
                    <input
                      type="text"
                      value={
                        (
                          website?.blocks.find((b) => b.id === block.id)
                            ?.content as Record<string, string>
                        )?.[block.id + "-title"] || ""
                      }
                      onChange={(e) =>
                        handleTextChange(block.id, "title", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      className="w-full outline-none bg-transparent border-b-2 text-center"
                      autoFocus
                    />
                  ) : (
                    block.content.title
                  )}
                </h2>
                <p
                  className="text-xl"
                  style={{ color: website.theme.colors.secondary }}
                  onDoubleClick={() =>
                    handleTextDoubleClick(block.id, "subtitle")
                  }
                >
                  {editingText === `${block.id}-subtitle` ? (
                    <input
                      type="text"
                      value={
                        (
                          website?.blocks.find((b) => b.id === block.id)
                            ?.content as Record<string, string>
                        )?.[block.id + "-subtitle"] || ""
                      }
                      onChange={(e) =>
                        handleTextChange(block.id, "subtitle", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      className="w-full outline-none bg-transparent border-b-2 text-center"
                      autoFocus
                    />
                  ) : (
                    block.content.subtitle
                  )}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl mb-4">📍</div>
                  <h3
                    className="font-bold mb-2"
                    style={{ color: website.theme.colors.text }}
                  >
                    Address
                  </h3>
                  <p style={{ color: website.theme.colors.secondary }}>
                    {block.content.address}
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-4">📧</div>
                  <h3
                    className="font-bold mb-2"
                    style={{ color: website.theme.colors.text }}
                  >
                    Email
                  </h3>
                  <p style={{ color: website.theme.colors.secondary }}>
                    {block.content.email}
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-4">📞</div>
                  <h3
                    className="font-bold mb-2"
                    style={{ color: website.theme.colors.text }}
                  >
                    Phone
                  </h3>
                  <p style={{ color: website.theme.colors.secondary }}>
                    {block.content.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {block.type === "cta" && (
          <div
            className="py-20 text-center"
            style={{ backgroundColor: website.theme.colors.primary }}
          >
            <div className="max-w-4xl mx-auto px-6">
              <h2
                className="text-4xl font-bold mb-4 text-white cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2 rounded transition-all"
                onClick={(e) =>
                  handleElementClick(block.id, "text", "title", e)
                }
                onDoubleClick={() => handleTextDoubleClick(block.id, "title")}
              >
                {editingText === `${block.id}-title` ? (
                  <input
                    type="text"
                    value={
                      (
                        website?.blocks.find((b) => b.id === block.id)
                          ?.content as Record<string, string>
                      )?.[block.id + "-title"] || ""
                    }
                    onChange={(e) =>
                      handleTextChange(block.id, "title", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    className="w-full outline-none bg-transparent border-b-2 text-center text-white"
                    autoFocus
                  />
                ) : (
                  block.content.title
                )}
              </h2>
              <p
                className="text-xl mb-8 text-white opacity-90 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2 rounded transition-all"
                onClick={(e) =>
                  handleElementClick(block.id, "text", "subtitle", e)
                }
                onDoubleClick={() =>
                  handleTextDoubleClick(block.id, "subtitle")
                }
              >
                {editingText === `${block.id}-subtitle` ? (
                  <input
                    type="text"
                    value={
                      (
                        website?.blocks.find((b) => b.id === block.id)
                          ?.content as Record<string, string>
                      )?.[block.id + "-subtitle"] || ""
                    }
                    onChange={(e) =>
                      handleTextChange(block.id, "subtitle", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    className="w-full outline-none bg-transparent border-b-2 text-center text-white"
                    autoFocus
                  />
                ) : (
                  block.content.subtitle
                )}
              </p>
              <button
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2"
                onClick={(e) =>
                  handleElementClick(block.id, "button", "buttonText", e)
                }
                onDoubleClick={() =>
                  handleTextDoubleClick(block.id, "buttonText")
                }
              >
                {editingText === `${block.id}-buttonText` ? (
                  <input
                    type="text"
                    value={
                      (
                        website?.blocks.find((b) => b.id === block.id)
                          ?.content as Record<string, string>
                      )?.[block.id + "-buttonText"] || ""
                    }
                    onChange={(e) =>
                      handleTextChange(block.id, "buttonText", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    className="bg-transparent text-gray-900 text-center outline-none"
                    autoFocus
                  />
                ) : (
                  block.content.buttonText
                )}
              </button>
            </div>
          </div>
        )}

        {/* Hover Add Section Button */}
        {!isPreviewMode && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSectionSelectorPosition(block.id);
                setShowSectionSelector(true);
              }}
              className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Handle image clicks to show settings popup
  const handleImageClick = (
    blockId: string,
    field: string,
    currentUrl: string,
    event: React.MouseEvent
  ) => {
    if (isPreviewMode) return;

    event.stopPropagation();

    // Generate business-specific alt text
    let dynamicAltText = "";
    const businessInfoStr = localStorage.getItem(`business_info_${user?.id}`);
    const businessInfo: BusinessInfo = businessInfoStr
      ? JSON.parse(businessInfoStr)
      : null;

    if (businessInfo) {
      const businessKeywords = extractBusinessKeywords(businessInfo.type);

      if (field === "backgroundImage") {
        dynamicAltText = `${businessKeywords.primary} professional office workspace in ${businessInfo.location}`;
      } else if (field === "image") {
        dynamicAltText = `${businessKeywords.primary} team collaboration and professional meeting`;
      } else if (field.includes("services")) {
        const serviceIndex = field.match(/\[(\d+)\]/)?.[1];
        if (serviceIndex === "0") {
          dynamicAltText = `${businessKeywords.primary} professional consultation and service delivery`;
        } else if (serviceIndex === "1") {
          dynamicAltText = `${businessKeywords.secondary} technology and professional solutions`;
        } else {
          dynamicAltText = `${businessKeywords.primary} high quality professional service`;
        }
      } else {
        dynamicAltText = `${businessKeywords.primary} professional business image`;
      }
    } else {
      dynamicAltText = "Professional business image";
    }

    setSelectedImage({ blockId, field, currentUrl, altText: dynamicAltText });
    setImageAltText(dynamicAltText);
    setShowImageSettings(true);
  };

  const handleRegenerateImage = async () => {
    if (!selectedImage) return;

    setIsRegenerating(true);
    try {
      // Get business info for better image generation
      const businessInfoStr = localStorage.getItem(`business_info_${user?.id}`);
      const businessInfo: BusinessInfo = businessInfoStr
        ? JSON.parse(businessInfoStr)
        : null;

      if (!businessInfo) {
        alert("Business information not found. Please go back to onboarding.");
        return;
      }

      // Create business-specific query based on the image field
      let finalQuery = "";
      const businessType = businessInfo.type.toLowerCase();
      const location = businessInfo.location;

      if (selectedImage.field === "backgroundImage") {
        finalQuery = createBusinessSpecificImageQuery(
          businessType,
          "hero",
          location
        );
      } else if (selectedImage.field === "image") {
        finalQuery = createBusinessSpecificImageQuery(
          businessType,
          "about",
          location
        );
      } else if (selectedImage.field.includes("services")) {
        const serviceIndex = selectedImage.field.match(/\[(\d+)\]/)?.[1];
        const serviceType =
          serviceIndex === "0"
            ? "service1"
            : serviceIndex === "1"
            ? "service2"
            : "service3";
        finalQuery = createBusinessSpecificImageQuery(
          businessType,
          serviceType,
          location
        );
      } else {
        // Fallback to general business-specific query
        const businessKeywords = extractBusinessKeywords(businessType);
        finalQuery = `${businessKeywords.primary} professional modern ${location}`;
      }

      console.log(
        `Regenerating image with business-specific query: "${finalQuery}"`
      );

      const newImageUrl = await fetchPexelsImage(finalQuery);

      console.log(`New business-specific image URL received: ${newImageUrl}`);

      // Update the image in the website
      setWebsite((prev) => {
        if (!prev) return null;
        const updatedWebsite = {
          ...prev,
          blocks: prev.blocks.map((block) =>
            block.id === selectedImage.blockId
              ? {
                  ...block,
                  content: {
                    ...block.content,
                    [selectedImage.field]: newImageUrl,
                  },
                }
              : block
          ),
        };

        // Save updated website to localStorage
        if (user?.id) {
          localStorage.setItem(
            `generated_website_${user.id}`,
            JSON.stringify(updatedWebsite)
          );
          // Update recent projects with the change
          saveToRecentProjects(updatedWebsite);
        }

        return updatedWebsite;
      });

      // Update the selected image URL in the panel
      setSelectedImage((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentUrl: newImageUrl,
        };
      });
    } catch (error) {
      console.error("Failed to regenerate image:", error);
      alert(
        `Failed to regenerate image: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please check your PEXELS_API_KEY.`
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedImage) return;

    const imageUrl = URL.createObjectURL(file);

    // Update the image in the website
    setWebsite((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        blocks: prev.blocks.map((block) =>
          block.id === selectedImage.blockId
            ? {
                ...block,
                content: {
                  ...block.content,
                  [selectedImage.field]: imageUrl,
                },
              }
            : block
        ),
      };
    });

    // Update the selected image URL in the panel
    setSelectedImage((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentUrl: imageUrl,
      };
    });
  };

  // Handle panel dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX;
    const startPanelX = panelPosition.x;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newX = Math.max(
        0,
        Math.min(window.innerWidth - panelPosition.width, startPanelX + deltaX)
      );
      setPanelPosition((prev) => ({ ...prev, x: newX }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Exact Match from Screenshot */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side Navigation */}
          <div className="flex items-center space-x-1">
            {/* Home Icon */}
            <Link
              href="/dashboard"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Home"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Customize */}
            <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Customize</span>
            </button>

            {/* Pages */}
            <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Pages</span>
            </button>

            {/* Add */}
            <button
              onClick={() => setShowSectionSelector(true)}
              className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add</span>
            </button>

            {/* Help */}
            <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Help</span>
            </button>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-3">
            {/* Home Dropdown */}
            <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <span className="text-sm font-medium">Home</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Preview Button */}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                isPreviewMode
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>{isPreviewMode ? "Exit Preview" : "Preview"}</span>
            </button>

            {/* Publish Button */}
            <button
              onClick={() => {
                if (website) {
                  updateProjectStatus(website, "published");
                  alert("Website published successfully!");
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Publish
            </button>

            {/* Developer Tools - Remove in production */}
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      "This will delete your current website and generate a new one. Are you sure?"
                    )
                  ) {
                    if (user?.id) {
                      localStorage.removeItem(`generated_website_${user.id}`);
                      window.location.reload();
                    }
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium ml-2"
              >
                🔄 Regenerate
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Website Content */}
      <div
        className="relative"
        onClick={() => {
          setSelectedBlock(null);
          setShowFloatingActions(false);
        }}
      >
        {website.blocks.map((block) => renderBlock(block))}
      </div>

      {/* Floating Actions Menu */}
      {showFloatingActions && selectedBlock && !isPreviewMode && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex space-x-1"
          style={{
            left: floatingActionsPosition.x,
            top: floatingActionsPosition.y,
          }}
        >
          <button
            onClick={() => {
              const block = website.blocks.find((b) => b.id === selectedBlock);
              if (block) regenerateImages(selectedBlock);
            }}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            title="Regenerate images"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => moveBlock(selectedBlock, "up")}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            title="Move up"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => moveBlock(selectedBlock, "down")}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            title="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteBlock(selectedBlock)}
            className="p-2 hover:bg-red-100 rounded text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Section Selector */}
      {showSectionSelector && !isPreviewMode && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-6">Add New Section</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: "hero" as const, icon: "🎯", name: "Hero" },
                { type: "about" as const, icon: "👥", name: "About" },
                { type: "services" as const, icon: "⚙️", name: "Services" },
                { type: "features" as const, icon: "⭐", name: "Features" },
                {
                  type: "testimonials" as const,
                  icon: "💬",
                  name: "Testimonials",
                },
                { type: "contact" as const, icon: "📞", name: "Contact" },
                { type: "cta" as const, icon: "🚀", name: "Call to Action" },
                { type: "gallery" as const, icon: "🖼️", name: "Gallery" },
              ].map(({ type, icon, name }) => (
                <button
                  key={type}
                  onClick={() =>
                    addSection(type, sectionSelectorPosition || undefined)
                  }
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-sm font-medium">{name}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowSectionSelector(false);
                setSectionSelectorPosition(null);
              }}
              className="mt-6 w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Panel */}
      {showEditPanel && selectedElement && !isPreviewMode && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                Edit{" "}
                {selectedElement.elementType === "text"
                  ? "Text"
                  : selectedElement.elementType === "image"
                  ? "Image"
                  : selectedElement.elementType === "button"
                  ? "Button"
                  : "Background"}
              </h3>
              <button
                onClick={() => {
                  setShowEditPanel(false);
                  setSelectedElement(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Text Editing */}
            {selectedElement.elementType === "text" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={
                      (
                        website?.blocks.find(
                          (b) => b.id === selectedElement.blockId
                        )?.content as Record<string, string>
                      )?.[selectedElement.field] || ""
                    }
                    onChange={(e) =>
                      handleTextChange(
                        selectedElement.blockId,
                        selectedElement.field,
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    onChange={(e) =>
                      updateElementStyle(
                        selectedElement.blockId,
                        "color",
                        e.target.value
                      )
                    }
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Image Editing */}
            {selectedElement.elementType === "image" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload New Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChangeImage}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Generate AI Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Describe the image..."
                      className="flex-1 border border-gray-300 rounded-lg p-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const query = (e.target as HTMLInputElement).value;
                          if (query) {
                            generateNewImage(
                              selectedElement.blockId,
                              selectedElement.field,
                              query
                            );
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector(
                          'input[placeholder="Describe the image..."]'
                        ) as HTMLInputElement;
                        const query = input?.value;
                        if (query) {
                          generateNewImage(
                            selectedElement.blockId,
                            selectedElement.field,
                            query
                          );
                        }
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Background Editing */}
            {selectedElement.elementType === "background" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    onChange={(e) =>
                      updateElementStyle(
                        selectedElement.blockId,
                        "backgroundColor",
                        e.target.value
                      )
                    }
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Background Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChangeImage}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Generate AI Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Describe the background..."
                      className="flex-1 border border-gray-300 rounded-lg p-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const query = (e.target as HTMLInputElement).value;
                          if (query) {
                            generateNewImage(
                              selectedElement.blockId,
                              selectedElement.field,
                              query
                            );
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector(
                          'input[placeholder="Describe the background..."]'
                        ) as HTMLInputElement;
                        const query = input?.value;
                        if (query) {
                          generateNewImage(
                            selectedElement.blockId,
                            selectedElement.field,
                            query
                          );
                        }
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Button Editing */}
            {selectedElement.elementType === "button" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={
                      (
                        website?.blocks.find(
                          (b) => b.id === selectedElement.blockId
                        )?.content as Record<string, string>
                      )?.[selectedElement.field] || ""
                    }
                    onChange={(e) =>
                      handleTextChange(
                        selectedElement.blockId,
                        selectedElement.field,
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Button Color
                  </label>
                  <input
                    type="color"
                    onChange={(e) =>
                      updateElementStyle(
                        selectedElement.blockId,
                        "backgroundColor",
                        e.target.value
                      )
                    }
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    onChange={(e) =>
                      updateElementStyle(
                        selectedElement.blockId,
                        "color",
                        e.target.value
                      )
                    }
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Settings Side Panel - Exactly like Durable AI */}
      {showImageSettings && selectedImage && !isPreviewMode && (
        <>
          {/* Side Panel - slides from right and draggable */}
          <div
            className={`fixed top-0 h-full bg-white shadow-2xl z-50 transform transition-all duration-300 ease-in-out ${
              showImageSettings ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              left: `${panelPosition.x}px`,
              width: `${panelPosition.width}px`,
              cursor: isDragging ? "grabbing" : "default",
            }}
          >
            {/* Resize Handle */}
            <div
              className="absolute left-0 top-0 w-1 h-full bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors"
              onMouseDown={handleMouseDown}
              style={{ cursor: "col-resize" }}
            />

            <div className="p-6 h-full overflow-y-auto ml-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    setShowImageSettings(false);
                    setSelectedImage(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold">Image settings</h3>
                <div className="flex items-center space-x-2">
                  {/* Drag Handle */}
                  <div className="cursor-move p-1 hover:bg-gray-100 rounded">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => {
                      setShowImageSettings(false);
                      setSelectedImage(null);
                    }}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              <div className="mb-6">
                <img
                  src={selectedImage.currentUrl}
                  alt="Selected image"
                  className="w-full h-48 object-cover rounded-xl shadow-md"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={handleRegenerateImage}
                  disabled={isRegenerating}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {isRegenerating ? "Regenerating..." : "Regenerate"}
                  </span>
                </button>

                <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span className="text-sm font-medium">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleChangeImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Alt Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt text
                </label>
                <textarea
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm resize-none"
                  rows={3}
                  placeholder="Describe the image to improve SEO and accessibility"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe the image to improve SEO and accessibility
                </p>
              </div>

              {/* Image Position */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Image position
                </label>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">
                        Horizontal
                      </label>
                      <span className="text-xs text-gray-500">
                        {imagePosition.horizontal}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imagePosition.horizontal}
                      onChange={(e) =>
                        setImagePosition({
                          ...imagePosition,
                          horizontal: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-500">Vertical</label>
                      <span className="text-xs text-gray-500">
                        {imagePosition.vertical}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={imagePosition.vertical}
                      onChange={(e) =>
                        setImagePosition({
                          ...imagePosition,
                          vertical: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay for clicking outside to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowImageSettings(false);
              setSelectedImage(null);
            }}
          />
        </>
      )}
    </div>
  );
}
