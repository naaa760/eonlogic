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

  // Safe localStorage utility for SSR compatibility
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    },
  };

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
    x: typeof window !== "undefined" ? window.innerWidth - 320 : 320,
    width: 320,
  });

  // Button settings states
  const [showButtonSettings, setShowButtonSettings] = useState(false);
  const [selectedButton, setSelectedButton] = useState<{
    blockId: string;
    field: string;
    currentText: string;
  } | null>(null);
  const [buttonLinkType, setButtonLinkType] = useState<
    "section" | "page" | "url" | "email" | "phone"
  >("section");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonSection, setButtonSection] = useState("hero");
  const [buttonUrl, setButtonUrl] = useState("");
  const [buttonEmail, setButtonEmail] = useState("");
  const [buttonPhone, setButtonPhone] = useState("");

  // Panel transition states for beautiful animations
  const [panelTransition, setPanelTransition] = useState<{
    isTransitioning: boolean;
    fromPanel: string | null;
    toPanel: string | null;
  }>({
    isTransitioning: false,
    fromPanel: null,
    toPanel: null,
  });

  // Panel visibility states for smooth fading
  const [panelVisibility, setPanelVisibility] = useState({
    image: { show: false, opacity: 0 },
    button: { show: false, opacity: 0 },
    edit: { show: false, opacity: 0 },
    textImage: { show: false, opacity: 0 },
  });

  // Text + Image panel states
  const [showTextImagePanel, setShowTextImagePanel] = useState(false);
  const [selectedTextImageBlock, setSelectedTextImageBlock] = useState<{
    blockId: string;
    blockType: string;
  } | null>(null);
  const [textImageActiveTab, setTextImageActiveTab] = useState<
    "content" | "style"
  >("content");

  // Content tab settings
  const [textImageContent, setTextImageContent] = useState({
    title: "",
    description: "",
    imageUrl: "",
    imageAltText: "",
    imagePosition: { horizontal: 50, vertical: 50 },
    hasButton: false,
    buttonText: "",
  });

  // Style tab settings
  const [textImageStyle, setTextImageStyle] = useState({
    writingStyle: "professional",
    colorScheme: "theme", // 'theme' or 'custom'
    backgroundColor: "#F0F3F3",
    accentColor: "#054691",
    imagePosition: "right" as "left" | "center" | "right" | "full",
    contentAlignment: "left" as "left" | "center" | "right",
    invertMobile: false,
    borderlessImage: false,
    imageFit: "cover" as "cover" | "contain" | "fill",
    aspectRatio: "3:2" as "1:1" | "2:3" | "3:2" | "16:9",
    animationStyle: "slideUp",
    topSpacing: "large",
    bottomSpacing: "large",
    minHeight: "content" as "content" | "screen",
    hasDivider: false,
    hasBorder: false,
    roundedCorners: "none" as "none" | "small" | "medium" | "large",
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = "/";
      return;
    }

    if (isLoaded && isSignedIn && user) {
      // Check if we already have a generated website for this user
      const existingWebsite = safeLocalStorage.getItem(
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
      const businessInfoStr = safeLocalStorage.getItem(
        `business_info_${user?.id}`
      );
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
      safeLocalStorage.setItem(
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
        safeLocalStorage.getItem(`recent_projects_${user?.id}`) || "[]"
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

      safeLocalStorage.setItem(
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
        safeLocalStorage.getItem(`recent_projects_${user?.id}`) || "[]"
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

      safeLocalStorage.setItem(
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
            {safeLocalStorage.getItem(`generated_website_${user?.id}`)
              ? "Loading Your Website..."
              : "Creating Your Website..."}
          </h3>
          <p className="text-gray-600 max-w-md">
            {safeLocalStorage.getItem(`generated_website_${user?.id}`)
              ? "Loading your previously created website from storage."
              : "Our AI is crafting a beautiful, professional website tailored specifically for your business. This will just take a moment."}
          </p>
          {!safeLocalStorage.getItem(`generated_website_${user?.id}`) && (
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
        safeLocalStorage.setItem(
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
        safeLocalStorage.setItem(
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
        safeLocalStorage.setItem(
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
        safeLocalStorage.setItem(
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

    createSmoothTransition("edit", () => {
      setSelectedElement({ blockId, elementType, field });
      setShowEditPanel(true);
    });
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
          safeLocalStorage.setItem(
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
        safeLocalStorage.setItem(
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
            <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2 rounded transition-all"
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
                    className="bg-transparent border-b-2 border-white text-white text-center w-full outline-none text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
                    autoFocus
                  />
                ) : (
                  block.content.title
                )}
              </h1>
              <p
                className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-90 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2 rounded transition-all"
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
                    className="bg-transparent border-b-2 border-white text-white text-center w-full outline-none resize-none text-lg sm:text-xl md:text-2xl"
                    autoFocus
                  />
                ) : (
                  block.content.subtitle
                )}
              </p>
              <button
                className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2"
                onClick={(e) =>
                  handleButtonClick(
                    block.id,
                    "buttonText",
                    block.content.buttonText || "",
                    e
                  )
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
          <div
            className="py-12 sm:py-16 md:py-20 cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 rounded transition-all"
            style={{ backgroundColor: "#f8fafc" }}
            onClick={(e) => handleTextImageClick(block.id, "about", e)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 rounded transition-all"
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
                        className="w-full outline-none bg-transparent border-b-2 text-2xl sm:text-3xl md:text-4xl"
                        autoFocus
                      />
                    ) : (
                      block.content.title
                    )}
                  </h2>
                  <p
                    className="text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 rounded transition-all text-gray-700"
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
                        className="w-full outline-none bg-transparent border-b-2 resize-none text-base sm:text-lg"
                        rows={4}
                        autoFocus
                      />
                    ) : (
                      block.content.description
                    )}
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {block.content.highlights?.map(
                      (highlight: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium"
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
                <div className="relative mt-8 md:mt-0">
                  <img
                    src={block.content.image}
                    alt="About us"
                    className="rounded-2xl shadow-xl w-full h-64 sm:h-80 md:h-96 object-cover cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 transition-all"
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
          <div
            className="py-12 sm:py-16 md:py-20"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
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
                      className="w-full outline-none bg-transparent border-b-2 text-center text-2xl sm:text-3xl md:text-4xl"
                      autoFocus
                    />
                  ) : (
                    block.content.title
                  )}
                </h2>
                <p
                  className="text-lg sm:text-xl"
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
                      className="w-full outline-none bg-transparent border-b-2 text-center text-lg sm:text-xl"
                      autoFocus
                    />
                  ) : (
                    block.content.subtitle
                  )}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {block.content.services?.map(
                  (service: ServiceItem, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-40 sm:h-48 object-cover cursor-pointer hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-offset-2 transition-all"
                        onClick={(e) =>
                          handleImageClick(
                            block.id,
                            `services[${index}].image`,
                            service.image || "",
                            e
                          )
                        }
                      />
                      <div className="p-4 sm:p-6">
                        <div className="text-xl sm:text-2xl mb-3">
                          {service.icon}
                        </div>
                        <h3
                          className="text-lg sm:text-xl font-bold mb-3"
                          style={{ color: website.theme.colors.text }}
                        >
                          {service.title}
                        </h3>
                        <p
                          className="text-sm sm:text-base"
                          style={{ color: website.theme.colors.secondary }}
                        >
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
          <div className="py-12 sm:py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
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
                      className="w-full outline-none bg-transparent border-b-2 text-center text-2xl sm:text-3xl md:text-4xl"
                      autoFocus
                    />
                  ) : (
                    block.content.title
                  )}
                </h2>
                <p
                  className="text-lg sm:text-xl"
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
                      className="w-full outline-none bg-transparent border-b-2 text-center text-lg sm:text-xl"
                      autoFocus
                    />
                  ) : (
                    block.content.subtitle
                  )}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {block.content.features?.map(
                  (feature: FeatureItem, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl sm:text-4xl mb-4">
                        {feature.icon}
                      </div>
                      <h3
                        className="text-lg sm:text-xl font-bold mb-3"
                        style={{ color: website.theme.colors.text }}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className="text-sm sm:text-base"
                        style={{ color: website.theme.colors.secondary }}
                      >
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
          <div className="py-12 sm:py-16 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
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
                      className="w-full outline-none bg-transparent border-b-2 text-center text-2xl sm:text-3xl md:text-4xl"
                      autoFocus
                    />
                  ) : (
                    block.content.title
                  )}
                </h2>
                <p
                  className="text-lg sm:text-xl"
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
                      className="w-full outline-none bg-transparent border-b-2 text-center text-lg sm:text-xl"
                      autoFocus
                    />
                  ) : (
                    block.content.subtitle
                  )}
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl mb-4">📍</div>
                  <h3
                    className="font-bold mb-2 text-base sm:text-lg"
                    style={{ color: website.theme.colors.text }}
                  >
                    Address
                  </h3>
                  <p
                    className="text-sm sm:text-base break-words"
                    style={{ color: website.theme.colors.secondary }}
                  >
                    {block.content.address}
                  </p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl mb-4">📧</div>
                  <h3
                    className="font-bold mb-2 text-base sm:text-lg"
                    style={{ color: website.theme.colors.text }}
                  >
                    Email
                  </h3>
                  <p
                    className="text-sm sm:text-base break-all"
                    style={{ color: website.theme.colors.secondary }}
                  >
                    {block.content.email}
                  </p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl mb-4">📞</div>
                  <h3
                    className="font-bold mb-2 text-base sm:text-lg"
                    style={{ color: website.theme.colors.text }}
                  >
                    Phone
                  </h3>
                  <p
                    className="text-sm sm:text-base"
                    style={{ color: website.theme.colors.secondary }}
                  >
                    {block.content.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {block.type === "cta" && (
          <div
            className="py-12 sm:py-16 md:py-20 text-center"
            style={{ backgroundColor: website.theme.colors.primary }}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2 rounded transition-all"
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
                    className="w-full outline-none bg-transparent border-b-2 text-center text-white text-2xl sm:text-3xl md:text-4xl"
                    autoFocus
                  />
                ) : (
                  block.content.title
                )}
              </h2>
              <p
                className="text-lg sm:text-xl mb-6 sm:mb-8 text-white opacity-90 cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2 rounded transition-all"
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
                    className="w-full outline-none bg-transparent border-b-2 text-center text-white text-lg sm:text-xl"
                    autoFocus
                  />
                ) : (
                  block.content.subtitle
                )}
              </p>
              <button
                className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors cursor-pointer hover:outline hover:outline-2 hover:outline-white/50 hover:outline-offset-2"
                onClick={(e) =>
                  handleButtonClick(
                    block.id,
                    "buttonText",
                    block.content.buttonText || "",
                    e
                  )
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

  // Beautiful panel transition helper
  const createSmoothTransition = (
    targetPanel: "image" | "button" | "edit" | "textImage",
    setupCallback: () => void
  ) => {
    if (panelTransition.isTransitioning) return;

    const currentPanel = showImageSettings
      ? "image"
      : showButtonSettings
      ? "button"
      : showEditPanel
      ? "edit"
      : showTextImagePanel
      ? "textImage"
      : null;

    if (currentPanel === targetPanel) return; // Same panel, no transition needed

    setPanelTransition({
      isTransitioning: true,
      fromPanel: currentPanel,
      toPanel: targetPanel,
    });

    if (currentPanel) {
      // Start fade out current panel
      setPanelVisibility((prev) => ({
        ...prev,
        [currentPanel]: { show: true, opacity: 0 },
      }));

      // After fade out starts, setup new panel and fade it in
      setTimeout(() => {
        // Setup new panel data
        setupCallback();

        // Show new panel with fade in
        setPanelVisibility((prev) => ({
          ...prev,
          [currentPanel]: { show: false, opacity: 0 },
          [targetPanel]: { show: true, opacity: 1 },
        }));

        // Clean up transition state
        setTimeout(() => {
          setPanelTransition({
            isTransitioning: false,
            fromPanel: null,
            toPanel: null,
          });
        }, 400); // Wait for fade in to complete
      }, 200); // Overlap timing for smooth transition
    } else {
      // No current panel, immediate fade in
      setupCallback();
      setPanelVisibility((prev) => ({
        ...prev,
        [targetPanel]: { show: true, opacity: 1 },
      }));

      setTimeout(() => {
        setPanelTransition({
          isTransitioning: false,
          fromPanel: null,
          toPanel: null,
        });
      }, 400);
    }
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

    createSmoothTransition("image", () => {
      // Close other panels
      setShowButtonSettings(false);
      setSelectedButton(null);
      setShowEditPanel(false);
      setSelectedElement(null);

      // Generate business-specific alt text
      let dynamicAltText = "";
      const businessInfoStr = safeLocalStorage.getItem(
        `business_info_${user?.id}`
      );
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
    });
  };

  // Handle button clicks to show settings popup
  const handleButtonClick = (
    blockId: string,
    field: string,
    currentText: string,
    event: React.MouseEvent
  ) => {
    if (isPreviewMode) return;

    event.stopPropagation();

    createSmoothTransition("button", () => {
      // Close other panels
      setShowImageSettings(false);
      setSelectedImage(null);
      setShowEditPanel(false);
      setSelectedElement(null);

      setSelectedButton({ blockId, field, currentText });
      setButtonLabel(currentText);
      setShowButtonSettings(true);
    });
  };

  const handleRegenerateImage = async () => {
    if (!selectedImage) return;

    setIsRegenerating(true);
    try {
      // Get business info for better image generation
      const businessInfoStr = safeLocalStorage.getItem(
        `business_info_${user?.id}`
      );
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
          safeLocalStorage.setItem(
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
    if (typeof window === "undefined") return;

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
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle text+image section clicks
  const handleTextImageClick = (
    blockId: string,
    blockType: string,
    event: React.MouseEvent
  ) => {
    if (isPreviewMode) return;

    event.stopPropagation();

    createSmoothTransition("textImage", () => {
      // Close other panels
      setShowImageSettings(false);
      setSelectedImage(null);
      setShowButtonSettings(false);
      setSelectedButton(null);
      setShowEditPanel(false);
      setSelectedElement(null);

      // Get current block data
      const currentBlock = website?.blocks.find((b) => b.id === blockId);
      if (currentBlock) {
        setTextImageContent({
          title: currentBlock.content.title || "",
          description: currentBlock.content.description || "",
          imageUrl: currentBlock.content.image || "",
          imageAltText: `Professional ${
            website?.businessType || "business"
          } image`,
          imagePosition: { horizontal: 50, vertical: 50 },
          hasButton: false,
          buttonText: "",
        });
      }

      setSelectedTextImageBlock({ blockId, blockType });
      setShowTextImagePanel(true);
    });
  };

  // Apply style changes to the website

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS for range sliders */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .image-settings-panel input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            height: 8px;
            border-radius: 4px;
            outline: none;
            opacity: 0.8;
            transition: opacity 0.2s;
          }
          
          .image-settings-panel input[type="range"]:hover {
            opacity: 1;
          }
          
          .image-settings-panel input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
          }
          
          .image-settings-panel input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          
          .image-settings-panel input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
          }
          
          .image-settings-panel input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
          }
        `,
        }}
      />

      {/* Top Navigation - Exact Match from Screenshot */}
      <nav className="bg-white border-b border-gray-200 px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side Navigation */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            {/* Home Icon */}
            <Link
              href="/dashboard"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
              title="Home"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            {/* Customize */}
            <button className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                Customize
              </span>
            </button>

            {/* Pages */}
            <button className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                Pages
              </span>
            </button>

            {/* Add */}
            <button
              onClick={() => setShowSectionSelector(true)}
              className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                Add
              </span>
            </button>

            {/* Help */}
            <button className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0">
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                Help
              </span>
            </button>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Home Dropdown - Hidden on small screens */}
            <button className="hidden md:flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <span className="text-sm font-medium">Home</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Preview Button */}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm font-medium ${
                isPreviewMode
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">
                {isPreviewMode ? "Exit Preview" : "Preview"}
              </span>
              <span className="sm:hidden">
                {isPreviewMode ? "Exit" : "Preview"}
              </span>
            </button>

            {/* Publish Button */}
            <button
              onClick={() => {
                if (website) {
                  updateProjectStatus(website, "published");
                  alert("Website published successfully!");
                }
              }}
              className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
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
                      safeLocalStorage.removeItem(
                        `generated_website_${user.id}`
                      );
                      window.location.reload();
                    }
                  }
                }}
                className="hidden sm:inline-block bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium ml-2"
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
          // Close all panels when clicking outside
          setShowImageSettings(false);
          setSelectedImage(null);
          setShowButtonSettings(false);
          setSelectedButton(null);
          setShowEditPanel(false);
          setSelectedElement(null);
        }}
      >
        {website.blocks.map((block) => renderBlock(block))}
      </div>

      {/* Floating Actions Menu - Mobile Responsive */}
      {showFloatingActions && selectedBlock && !isPreviewMode && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex space-x-1"
          style={{
            left:
              typeof window !== "undefined"
                ? Math.min(floatingActionsPosition.x, window.innerWidth - 200)
                : floatingActionsPosition.x,
            top: Math.max(floatingActionsPosition.y, 60),
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
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={() => moveBlock(selectedBlock, "up")}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            title="Move up"
          >
            <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={() => moveBlock(selectedBlock, "down")}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            title="Move down"
          >
            <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={() => deleteBlock(selectedBlock)}
            className="p-2 hover:bg-red-100 rounded text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}

      {/* Section Selector - Mobile Responsive */}
      {showSectionSelector && !isPreviewMode && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
              Add New Section
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="text-xl sm:text-2xl mb-2">{icon}</div>
                  <div className="text-xs sm:text-sm font-medium">{name}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowSectionSelector(false);
                setSectionSelectorPosition(null);
              }}
              className="mt-4 sm:mt-6 w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Panel - Mobile Responsive */}
      {showEditPanel && selectedElement && !isPreviewMode && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold">
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
                className="text-gray-500 hover:text-gray-700 p-1"
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
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Generate AI Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Describe the image..."
                      className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
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
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
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
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Generate AI Background
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Describe the background..."
                      className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
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
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
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
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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

      {/* Image Settings Side Panel - Durable AI Style */}
      {(showImageSettings || panelVisibility.image.show) &&
        selectedImage &&
        !isPreviewMode && (
          <>
            {/* Side Panel - slides from right with Durable-like styling */}
            <div
              className="fixed top-6 bottom-6 bg-white z-50 transform transition-all duration-500 ease-out"
              style={{
                left: `${
                  typeof window !== "undefined"
                    ? Math.min(
                        panelPosition.x,
                        window.innerWidth - panelPosition.width
                      )
                    : panelPosition.x
                }px`,
                width: `${
                  typeof window !== "undefined"
                    ? Math.min(panelPosition.width, window.innerWidth)
                    : panelPosition.width
                }px`,
                borderRadius: "20px",
                maxHeight: "520px",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                border: "none",
                backdropFilter: "blur(20px)",
                opacity: panelVisibility.image.show
                  ? panelVisibility.image.opacity
                  : showImageSettings
                  ? 1
                  : 0,
                transform: `translateX(${
                  showImageSettings || panelVisibility.image.show ? "0" : "100%"
                })`,
              }}
            >
              {/* Resize Handle - Hidden on mobile, better positioned */}
              <div
                className="absolute left-0 top-4 bottom-4 w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-all duration-200 hidden sm:block opacity-0 hover:opacity-100"
                onMouseDown={handleMouseDown}
                style={{ borderRadius: "0 2px 2px 0", marginLeft: "-1px" }}
              />

              <div className="p-6 h-full overflow-y-auto flex flex-col image-settings-panel">
                {/* Header - More refined */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <button
                    onClick={() => {
                      setShowImageSettings(false);
                      setSelectedImage(null);
                    }}
                    className="flex items-center text-gray-500 hover:text-gray-700 transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5"
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
                    <span className="text-sm font-medium">Back</span>
                  </button>

                  <h3 className="text-lg font-semibold text-gray-900">
                    Image settings
                  </h3>

                  <button
                    onClick={() => {
                      setShowImageSettings(false);
                      setSelectedImage(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>

                {/* Image Preview - Enhanced styling */}
                <div className="mb-6">
                  <div className="relative group">
                    <img
                      src={selectedImage.currentUrl}
                      alt="Selected image"
                      className="w-full h-36 object-cover rounded-2xl shadow-lg border border-gray-100 transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>

                {/* Action Buttons - More elegant */}
                <div className="flex space-x-3 mb-6">
                  <button
                    onClick={handleRegenerateImage}
                    disabled={isRegenerating}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 disabled:opacity-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  >
                    <svg
                      className={`w-4 h-4 text-gray-600 ${
                        isRegenerating ? "animate-spin" : ""
                      }`}
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
                    <span className="text-sm font-medium text-gray-700">
                      {isRegenerating ? "Regenerating..." : "Regenerate"}
                    </span>
                  </button>

                  <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-sm">
                    <svg
                      className="w-4 h-4 text-gray-600"
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
                    <span className="text-sm font-medium text-gray-700">
                      Change
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleChangeImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Alt Text - Enhanced styling */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Alt text
                  </label>
                  <textarea
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    rows={3}
                    placeholder="Describe the image to improve SEO and accessibility"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Describe the image to improve SEO and accessibility
                  </p>
                </div>

                {/* Image Position - Enhanced controls */}
                <div className="space-y-5">
                  <label className="block text-sm font-semibold text-gray-800">
                    Image position
                  </label>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-medium text-gray-600">
                          Horizontal
                        </label>
                        <span className="text-xs font-semibold text-gray-900 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                          {imagePosition.horizontal}%
                        </span>
                      </div>
                      <div className="relative">
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
                          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${imagePosition.horizontal}%, #e5e7eb ${imagePosition.horizontal}%, #e5e7eb 100%)`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-medium text-gray-600">
                          Vertical
                        </label>
                        <span className="text-xs font-semibold text-gray-900 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                          {imagePosition.vertical}%
                        </span>
                      </div>
                      <div className="relative">
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
                          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${imagePosition.vertical}%, #e5e7eb ${imagePosition.vertical}%, #e5e7eb 100%)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      {/* Button Settings Side Panel - Durable AI Style */}
      {(showButtonSettings || panelVisibility.button.show) &&
        selectedButton &&
        !isPreviewMode && (
          <>
            {/* Side Panel - slides from right with Durable-like styling */}
            <div
              className="fixed top-6 bottom-6 bg-white z-50 transform transition-all duration-500 ease-out"
              style={{
                left: `${
                  typeof window !== "undefined"
                    ? Math.min(
                        panelPosition.x,
                        window.innerWidth - panelPosition.width
                      )
                    : panelPosition.x
                }px`,
                width: `${
                  typeof window !== "undefined"
                    ? Math.min(panelPosition.width, window.innerWidth)
                    : panelPosition.width
                }px`,
                borderRadius: "20px",
                maxHeight: "520px",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                border: "none",
                backdropFilter: "blur(20px)",
                opacity: panelVisibility.button.show
                  ? panelVisibility.button.opacity
                  : showButtonSettings
                  ? 1
                  : 0,
                transform: `translateX(${
                  showButtonSettings || panelVisibility.button.show
                    ? "0"
                    : "100%"
                })`,
              }}
            >
              {/* Resize Handle - Hidden on mobile, better positioned */}
              <div
                className="absolute left-0 top-4 bottom-4 w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-all duration-200 hidden sm:block opacity-0 hover:opacity-100"
                onMouseDown={handleMouseDown}
                style={{ borderRadius: "0 2px 2px 0", marginLeft: "-1px" }}
              />

              <div className="p-6 h-full overflow-y-auto flex flex-col">
                {/* Header - More refined */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <button
                    onClick={() => {
                      setShowButtonSettings(false);
                      setSelectedButton(null);
                    }}
                    className="flex items-center text-gray-500 hover:text-gray-700 transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5"
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
                    <span className="text-sm font-medium">Back</span>
                  </button>

                  <h3 className="text-lg font-semibold text-gray-900">
                    Button settings
                  </h3>

                  <button
                    onClick={() => {
                      setShowButtonSettings(false);
                      setSelectedButton(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>

                {/* Link Type Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Link type
                  </label>
                  <div className="relative">
                    <select
                      value={buttonLinkType}
                      onChange={(e) =>
                        setButtonLinkType(
                          e.target.value as
                            | "section"
                            | "page"
                            | "url"
                            | "email"
                            | "phone"
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="section">Section</option>
                      <option value="page">Page</option>
                      <option value="url">External</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                    <svg
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Label Field */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Label
                  </label>
                  <input
                    type="text"
                    value={buttonLabel}
                    onChange={(e) => {
                      setButtonLabel(e.target.value);
                      // Update the button text in real-time
                      handleTextChange(
                        selectedButton.blockId,
                        selectedButton.field,
                        e.target.value
                      );
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter button text"
                  />
                </div>

                {/* Section Selection - Only show when Link Type is "Section" */}
                {buttonLinkType === "section" && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Section
                    </label>
                    <div className="relative">
                      <select
                        value={buttonSection}
                        onChange={(e) => setButtonSection(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                      >
                        <option value="hero">Hero</option>
                        <option value="about">About</option>
                        <option value="services">Service-list</option>
                        <option value="features">Features</option>
                        <option value="contact">Contact</option>
                        <option value="cta">Banner</option>
                      </select>
                      <svg
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      A section on this page
                    </p>
                  </div>
                )}

                {/* URL Field - Only show when Link Type is "url" */}
                {buttonLinkType === "url" && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      URL
                    </label>
                    <input
                      type="url"
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {/* Email Field - Only show when Link Type is "email" */}
                {buttonLinkType === "email" && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Email
                    </label>
                    <input
                      type="email"
                      value={buttonEmail}
                      onChange={(e) => setButtonEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="contact@example.com"
                    />
                  </div>
                )}

                {/* Phone Field - Only show when Link Type is "phone" */}
                {buttonLinkType === "phone" && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={buttonPhone}
                      onChange={(e) => setButtonPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      {/* Text+Image Panel - Durable AI Style */}
      {(showTextImagePanel || panelVisibility.textImage.show) &&
        selectedTextImageBlock &&
        !isPreviewMode && (
          <>
            {/* Side Panel - slides from right with Durable-like styling */}
            <div
              className="fixed top-6 bottom-6 bg-white z-50 transform transition-all duration-500 ease-out"
              style={{
                left: `${
                  typeof window !== "undefined"
                    ? Math.min(
                        panelPosition.x,
                        window.innerWidth - panelPosition.width
                      )
                    : panelPosition.x
                }px`,
                width: `${
                  typeof window !== "undefined"
                    ? Math.min(panelPosition.width, window.innerWidth)
                    : panelPosition.width
                }px`,
                borderRadius: "20px",
                maxHeight: "520px",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                border: "none",
                backdropFilter: "blur(20px)",
                opacity: panelVisibility.textImage.show
                  ? panelVisibility.textImage.opacity
                  : showTextImagePanel
                  ? 1
                  : 0,
                transform: `translateX(${
                  showTextImagePanel || panelVisibility.textImage.show
                    ? "0"
                    : "100%"
                })`,
              }}
            >
              {/* Resize Handle - Hidden on mobile, better positioned */}
              <div
                className="absolute left-0 top-4 bottom-4 w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-all duration-200 hidden sm:block opacity-0 hover:opacity-100"
                onMouseDown={handleMouseDown}
                style={{ borderRadius: "0 2px 2px 0", marginLeft: "-1px" }}
              />

              <div className="p-6 h-full overflow-y-auto flex flex-col">
                {/* Header - More refined */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <button
                    onClick={() => {
                      setShowTextImagePanel(false);
                      setSelectedTextImageBlock(null);
                    }}
                    className="flex items-center text-gray-500 hover:text-gray-700 transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5"
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
                    <span className="text-sm font-medium">Back</span>
                  </button>

                  <h3 className="text-lg font-semibold text-gray-900">
                    Text + Image
                  </h3>

                  <button
                    onClick={() => {
                      setShowTextImagePanel(false);
                      setSelectedTextImageBlock(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setTextImageActiveTab("content")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      textImageActiveTab === "content"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Content</span>
                  </button>
                  <button
                    onClick={() => setTextImageActiveTab("style")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      textImageActiveTab === "style"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
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
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4v.01"
                      />
                    </svg>
                    <span>Style</span>
                  </button>
                </div>

                {/* Content Tab */}
                {textImageActiveTab === "content" && (
                  <div className="space-y-6">
                    {/* Text Content */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <button
                          onClick={async () => {
                            if (!selectedTextImageBlock) return;

                            try {
                              // Get business info for content regeneration
                              const businessInfoStr = safeLocalStorage.getItem(
                                `business_info_${user?.id}`
                              );
                              const businessInfo: BusinessInfo = businessInfoStr
                                ? JSON.parse(businessInfoStr)
                                : null;

                              if (!businessInfo) {
                                alert(
                                  "Business information not found. Please go back to onboarding."
                                );
                                return;
                              }

                              // Generate new content using AI
                              const prompt = `Generate new content for the about section of a ${businessInfo.type} business named "${businessInfo.name}" located in ${businessInfo.location}. 

Create fresh, engaging content with:
1. A compelling title (different from previous versions)
2. A detailed description highlighting what makes this business unique

Return as JSON with this structure:
{
  "title": "New compelling title",
  "description": "Detailed description of the business and what makes it special"
}`;

                              const response = await fetch(
                                "/api/generate-content",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    prompt,
                                    businessInfo,
                                  }),
                                }
                              );

                              if (response.ok) {
                                const data = await response.json();
                                const newContent = data.content;

                                // Update the website content
                                setWebsite((prev) => {
                                  if (!prev) return prev;
                                  const updatedWebsite = {
                                    ...prev,
                                    blocks: prev.blocks.map((block) =>
                                      block.id ===
                                      selectedTextImageBlock.blockId
                                        ? {
                                            ...block,
                                            content: {
                                              ...block.content,
                                              title: newContent.title,
                                              description:
                                                newContent.description,
                                            },
                                          }
                                        : block
                                    ),
                                  };

                                  // Save updated website to localStorage
                                  if (user?.id) {
                                    safeLocalStorage.setItem(
                                      `generated_website_${user.id}`,
                                      JSON.stringify(updatedWebsite)
                                    );
                                    saveToRecentProjects(updatedWebsite);
                                  }

                                  return updatedWebsite;
                                });

                                // Update the panel state
                                setTextImageContent((prev) => ({
                                  ...prev,
                                  title: newContent.title,
                                  description: newContent.description,
                                }));

                                console.log("Content regenerated successfully");
                              } else {
                                throw new Error(
                                  "Failed to generate AI content"
                                );
                              }
                            } catch (error) {
                              console.error(
                                "Failed to regenerate content:",
                                error
                              );
                              alert(
                                `Failed to regenerate content: ${
                                  error instanceof Error
                                    ? error.message
                                    : "Unknown error"
                                }. Please check your GROQ_API_KEY.`
                              );
                            }
                          }}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Regenerate content"
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
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 transition-colors">
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
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 transition-colors">
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
                              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Title */}
                      <div className="mb-4">
                        <textarea
                          value={textImageContent.title}
                          onChange={(e) => {
                            setTextImageContent({
                              ...textImageContent,
                              title: e.target.value,
                            });
                            // Update website in real-time
                            handleTextChange(
                              selectedTextImageBlock.blockId,
                              "title",
                              e.target.value
                            );
                          }}
                          className="w-full text-2xl font-bold border-none outline-none resize-none bg-transparent"
                          placeholder="Pioneering Technology for a Better Tomorrow life"
                          rows={2}
                        />
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <textarea
                          value={textImageContent.description}
                          onChange={(e) => {
                            setTextImageContent({
                              ...textImageContent,
                              description: e.target.value,
                            });
                            // Update website in real-time
                            handleTextChange(
                              selectedTextImageBlock.blockId,
                              "description",
                              e.target.value
                            );
                          }}
                          className="w-full text-sm text-gray-700 border-none outline-none resize-none bg-transparent leading-relaxed"
                          placeholder="Located in the vibrant heart of Seoul, South Korea, life is at the forefront of technological innovation. Our mission is to explore and develop cutting-edge advancements that shape the future, enhancing everyday living through smart solutions. At life, we believe in harnessing the power of technology to create positive impacts on communities across the globe."
                          rows={6}
                        />
                      </div>
                    </div>

                    {/* Image Section */}
                    <div>
                      <div className="relative group mb-4">
                        <img
                          src={textImageContent.imageUrl}
                          alt={textImageContent.imageAltText}
                          className="w-full h-36 object-cover rounded-2xl shadow-lg border border-gray-100 transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                        <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-medium text-gray-600">
                            0
                          </span>
                        </div>
                      </div>

                      {/* Image Action Buttons */}
                      <div className="flex space-x-3 mb-4">
                        <button
                          onClick={async () => {
                            if (!selectedTextImageBlock) return;

                            setIsRegenerating(true);
                            try {
                              // Get business info for better image generation
                              const businessInfoStr = safeLocalStorage.getItem(
                                `business_info_${user?.id}`
                              );
                              const businessInfo: BusinessInfo = businessInfoStr
                                ? JSON.parse(businessInfoStr)
                                : null;

                              if (!businessInfo) {
                                alert(
                                  "Business information not found. Please go back to onboarding."
                                );
                                return;
                              }

                              // Create business-specific query for text+image sections
                              const businessType =
                                businessInfo.type.toLowerCase();
                              const location = businessInfo.location;
                              const finalQuery =
                                createBusinessSpecificImageQuery(
                                  businessType,
                                  "about",
                                  location
                                );

                              console.log(
                                `Regenerating text+image section image with query: "${finalQuery}"`
                              );

                              const newImageUrl = await fetchPexelsImage(
                                finalQuery
                              );

                              // Update the image in the website
                              setWebsite((prev) => {
                                if (!prev) return prev;
                                const updatedWebsite = {
                                  ...prev,
                                  blocks: prev.blocks.map((block) =>
                                    block.id === selectedTextImageBlock.blockId
                                      ? {
                                          ...block,
                                          content: {
                                            ...block.content,
                                            image: newImageUrl,
                                          },
                                        }
                                      : block
                                  ),
                                };

                                // Save updated website to localStorage
                                if (user?.id) {
                                  safeLocalStorage.setItem(
                                    `generated_website_${user.id}`,
                                    JSON.stringify(updatedWebsite)
                                  );
                                  saveToRecentProjects(updatedWebsite);
                                }

                                return updatedWebsite;
                              });

                              // Update the panel state
                              setTextImageContent((prev) => ({
                                ...prev,
                                imageUrl: newImageUrl,
                              }));
                            } catch (error) {
                              console.error(
                                "Failed to regenerate image:",
                                error
                              );
                              alert(
                                `Failed to regenerate image: ${
                                  error instanceof Error
                                    ? error.message
                                    : "Unknown error"
                                }. Please check your PEXELS_API_KEY.`
                              );
                            } finally {
                              setIsRegenerating(false);
                            }
                          }}
                          disabled={isRegenerating}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 disabled:opacity-50 border border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        >
                          <svg
                            className={`w-4 h-4 text-gray-600 ${
                              isRegenerating ? "animate-spin" : ""
                            }`}
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
                          <span className="text-sm font-medium text-gray-700">
                            {isRegenerating ? "Regenerating..." : "Regenerate"}
                          </span>
                        </button>

                        <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-sm">
                          <svg
                            className="w-4 h-4 text-gray-600"
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
                          <span className="text-sm font-medium text-gray-700">
                            Change
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (!file || !selectedTextImageBlock) return;

                              const imageUrl = URL.createObjectURL(file);

                              // Update the image in the website
                              setWebsite((prev) => {
                                if (!prev) return null;
                                const updatedWebsite = {
                                  ...prev,
                                  blocks: prev.blocks.map((block) =>
                                    block.id === selectedTextImageBlock.blockId
                                      ? {
                                          ...block,
                                          content: {
                                            ...block.content,
                                            image: imageUrl,
                                          },
                                        }
                                      : block
                                  ),
                                };

                                // Save updated website to localStorage
                                if (user?.id) {
                                  safeLocalStorage.setItem(
                                    `generated_website_${user.id}`,
                                    JSON.stringify(updatedWebsite)
                                  );
                                  saveToRecentProjects(updatedWebsite);
                                }

                                return updatedWebsite;
                              });

                              // Update the panel state
                              setTextImageContent((prev) => ({
                                ...prev,
                                imageUrl: imageUrl,
                              }));
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Alt Text */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Alt text
                        </label>
                        <textarea
                          value={textImageContent.imageAltText}
                          onChange={(e) =>
                            setTextImageContent({
                              ...textImageContent,
                              imageAltText: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          rows={2}
                          placeholder="Futuristic, hologram and black woman wit"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Describe the image to improve SEO and accessibility
                        </p>
                      </div>

                      {/* Image Position */}
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-800">
                          Image position
                        </label>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-600">
                              Horizontal
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={textImageContent.imagePosition.horizontal}
                              onChange={(e) =>
                                setTextImageContent({
                                  ...textImageContent,
                                  imagePosition: {
                                    ...textImageContent.imagePosition,
                                    horizontal: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${textImageContent.imagePosition.horizontal}%, #e5e7eb ${textImageContent.imagePosition.horizontal}%, #e5e7eb 100%)`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-600">
                              Vertical
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={textImageContent.imagePosition.vertical}
                              onChange={(e) =>
                                setTextImageContent({
                                  ...textImageContent,
                                  imagePosition: {
                                    ...textImageContent.imagePosition,
                                    vertical: parseInt(e.target.value),
                                  },
                                })
                              }
                              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${textImageContent.imagePosition.vertical}%, #e5e7eb ${textImageContent.imagePosition.vertical}%, #e5e7eb 100%)`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Button Section */}
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Button
                        </label>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Add button
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={textImageContent.hasButton}
                              onChange={(e) =>
                                setTextImageContent({
                                  ...textImageContent,
                                  hasButton: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {textImageContent.hasButton && (
                          <div className="mt-4">
                            <input
                              type="text"
                              value={textImageContent.buttonText}
                              onChange={(e) =>
                                setTextImageContent({
                                  ...textImageContent,
                                  buttonText: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              placeholder="Button text"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Style Tab */}
                {textImageActiveTab === "style" && (
                  <div className="space-y-6">
                    {/* Colors */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-semibold text-gray-800">
                          Colors
                        </label>
                        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                          Change
                        </button>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-900">
                            Custom
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Background image/video */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Background image/video
                      </label>
                      <div className="h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Layout */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Layout
                      </label>
                    </div>

                    {/* Image position */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Image position
                      </label>
                      <div className="flex space-x-2">
                        {["left", "center", "right", "full"].map((position) => (
                          <button
                            key={position}
                            onClick={() =>
                              setTextImageStyle({
                                ...textImageStyle,
                                imagePosition: position as
                                  | "left"
                                  | "center"
                                  | "right"
                                  | "full",
                              })
                            }
                            className={`flex-1 p-3 border-2 rounded-xl transition-all duration-200 ${
                              textImageStyle.imagePosition === position
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="w-6 h-6 mx-auto bg-gray-300 rounded"></div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content alignment */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Content alignment
                      </label>
                      <div className="flex space-x-2">
                        {["left", "center", "right"].map((align) => (
                          <button
                            key={align}
                            onClick={() =>
                              setTextImageStyle({
                                ...textImageStyle,
                                contentAlignment: align as
                                  | "left"
                                  | "center"
                                  | "right",
                              })
                            }
                            className={`flex-1 p-3 border-2 rounded-xl transition-all duration-200 ${
                              textImageStyle.contentAlignment === align
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <svg
                              className="w-5 h-5 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Invert image and content on mobile */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-800">
                          Invert image and content on mobile
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={textImageStyle.invertMobile}
                            onChange={(e) =>
                              setTextImageStyle({
                                ...textImageStyle,
                                invertMobile: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Borderless image */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-800">
                          Borderless image
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={textImageStyle.borderlessImage}
                            onChange={(e) =>
                              setTextImageStyle({
                                ...textImageStyle,
                                borderlessImage: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Image */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Image
                      </label>
                    </div>

                    {/* Image fit */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Image fit
                      </label>
                      <div className="relative">
                        <select
                          value={textImageStyle.imageFit}
                          onChange={(e) =>
                            setTextImageStyle({
                              ...textImageStyle,
                              imageFit: e.target.value as
                                | "cover"
                                | "contain"
                                | "fill",
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="fill">Fill</option>
                        </select>
                        <svg
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Aspect ratio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Aspect ratio
                      </label>
                      <div className="relative">
                        <select
                          value={textImageStyle.aspectRatio}
                          onChange={(e) =>
                            setTextImageStyle({
                              ...textImageStyle,
                              aspectRatio: e.target.value as
                                | "1:1"
                                | "2:3"
                                | "3:2"
                                | "16:9",
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                        >
                          <option value="1:1">1:1 square</option>
                          <option value="2:3">2:3 portrait</option>
                          <option value="3:2">3:2 landscape</option>
                          <option value="16:9">16:9 widescreen</option>
                        </select>
                        <svg
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Rounded corners */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Rounded corners
                      </label>
                      <div className="relative">
                        <select
                          value={textImageStyle.roundedCorners}
                          onChange={(e) =>
                            setTextImageStyle({
                              ...textImageStyle,
                              roundedCorners: e.target.value as
                                | "none"
                                | "small"
                                | "medium"
                                | "large",
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                        >
                          <option value="none">From theme (None)</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                        <svg
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Animations */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Animations
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        The animation style for how section elements appear
                      </p>
                      <div className="relative">
                        <select
                          value={textImageStyle.animationStyle}
                          onChange={(e) =>
                            setTextImageStyle({
                              ...textImageStyle,
                              animationStyle: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                        >
                          <option value="slideUp">From theme (Slide up)</option>
                          <option value="fadeIn">Fade in</option>
                          <option value="slideLeft">Slide from left</option>
                          <option value="slideRight">Slide from right</option>
                        </select>
                        <svg
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Spacing */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Spacing
                      </label>
                    </div>

                    {/* Top */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Top
                      </label>
                      <div className="relative">
                        <select
                          value={textImageStyle.topSpacing}
                          onChange={(e) =>
                            setTextImageStyle({
                              ...textImageStyle,
                              topSpacing: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                        >
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="xlarge">Extra Large</option>
                        </select>
                        <svg
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Bottom
                      </label>
                      <div className="relative">
                        <select
                          value={textImageStyle.bottomSpacing}
                          onChange={(e) =>
                            setTextImageStyle({
                              ...textImageStyle,
                              bottomSpacing: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                        >
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="xlarge">Extra Large</option>
                        </select>
                        <svg
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Min. height */}
                    <div>
                      <div className="flex items-center space-x-4 mb-3">
                        <label className="block text-sm font-semibold text-gray-800">
                          Min. height
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setTextImageStyle({
                                ...textImageStyle,
                                minHeight: "content",
                              })
                            }
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                              textImageStyle.minHeight === "content"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            Content
                          </button>
                          <button
                            onClick={() =>
                              setTextImageStyle({
                                ...textImageStyle,
                                minHeight: "screen",
                              })
                            }
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                              textImageStyle.minHeight === "screen"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            Screen
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-semibold text-gray-800">
                          Divider
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={textImageStyle.hasDivider}
                            onChange={(e) =>
                              setTextImageStyle({
                                ...textImageStyle,
                                hasDivider: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {textImageStyle.hasDivider && (
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                            Change
                          </button>
                          <div className="mt-3 h-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl"></div>
                        </div>
                      )}
                    </div>

                    {/* Border */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-800">
                          Border
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={textImageStyle.hasBorder}
                            onChange={(e) =>
                              setTextImageStyle({
                                ...textImageStyle,
                                hasBorder: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
    </div>
  );
}
