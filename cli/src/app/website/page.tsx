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
  price?: string;
  period?: string;
  features?: string[];
  buttonText?: string;
  popular?: boolean;
  items?: Array<{
    name: string;
    price: string;
    description: string;
  }>;
  role?: string;
  bio?: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  image?: string;
  date?: string;
  readTime?: string;
  role?: string;
  bio?: string;
}

interface TestimonialItem {
  text: string;
  author: string;
  company: string;
  rating?: number;
  image?: string;
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
    slides?: Array<{
      title: string;
      subtitle: string;
      buttonText: string;
      backgroundImage: string;
    }>;
    videoUrl?: string;
    mapUrl?: string;
    formFields?: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
    }>;
    hours?: Array<{
      day: string;
      time: string;
    }>;
    calendarUrl?: string;
    socialLinks?: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
    htmlContent?: string;
  };
  styles: {
    backgroundColor?: string;
    color?: string;
    padding?: string;
    textAlign?: string;
    height?: string;
    minHeight?: string;
    position?: string;
    overflow?: string;
    maxWidth?: string;
    margin?: string;
    paddingLeft?: string;
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
  const [] = useState(false);
  const [] = useState<string | null>(null);

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

  // Text + Image panel states
  const [showTextImagePanel, setShowTextImagePanel] = useState(false);
  const [selectedTextImageBlock, setSelectedTextImageBlock] = useState<{
    blockId: string;
    blockType: string;
  } | null>(null);
  const [textImageActiveTab, setTextImageActiveTab] = useState<
    "content" | "style"
  >("content");

  // Content regeneration states
  const [isRegeneratingContent, setIsRegeneratingContent] = useState(false);
  const [isRegeneratingTextImage, setIsRegeneratingTextImage] = useState(false);

  // New comprehensive section system states
  const [showSectionPanel, setShowSectionPanel] = useState(false);
  const [activeSectionCategory, setActiveSectionCategory] = useState<
    string | null
  >(null);
  const [sectionSearchQuery, setSectionSearchQuery] = useState("");

  // Carousel state management for banner auto-rotation
  const [carouselStates, setCarouselStates] = useState<Record<string, number>>(
    {}
  );

  // Auto-rotate carousel slides every 2 seconds
  useEffect(() => {
    if (!website?.blocks) return;

    const intervals: NodeJS.Timeout[] = [];

    website.blocks.forEach((block) => {
      if (
        block.type === "hero" &&
        block.content.slides &&
        block.content.slides.length > 1
      ) {
        const interval = setInterval(() => {
          setCarouselStates((prev) => ({
            ...prev,
            [block.id]:
              ((prev[block.id] || 0) + 1) % block.content.slides!.length,
          }));
        }, 2000);
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [website?.blocks]);

  // Section categories and their subsections
  interface SectionItem {
    id: string;
    name: string;
    description: string;
    icon: string;
  }

  interface SectionCategory {
    name: string;
    icon: string;
    sections: SectionItem[];
  }

  // Section Categories Data
  const sectionCategories: Record<string, SectionCategory> = {
    banner: {
      name: "Banner",
      icon: "banner",
      sections: [
        {
          id: "hero",
          name: "Banner",
          description: "Add a hero section with headline and CTA",
          icon: "banner",
        },
        {
          id: "hero-left",
          name: "Banner centered left",
          description: "Hero section with left-aligned content",
          icon: "banner",
        },
        {
          id: "hero-slider",
          name: "Banner image slider",
          description: "Rotating background images",
          icon: "banner",
        },
        {
          id: "hero-double",
          name: "Banner double image slider",
          description: "Two side-by-side image areas",
          icon: "banner",
        },
        {
          id: "hero-carousel",
          name: "Banner carousel",
          description: "Multiple slides with different content",
          icon: "banner",
        },
        {
          id: "hero-split",
          name: "Banner large split",
          description: "Half image, half text layout",
          icon: "banner",
        },
        {
          id: "hero-grid",
          name: "Banner grid",
          description: "Grid of smaller banner elements",
          icon: "banner",
        },
      ],
    },
    services: {
      name: "Services",
      icon: "services",
      sections: [
        {
          id: "services",
          name: "Services",
          description: "Grid of service cards with icons",
          icon: "services",
        },
        {
          id: "services-list",
          name: "List",
          description: "Simple bulleted list of services",
          icon: "list",
        },
        {
          id: "pricing",
          name: "Pricing tables",
          description: "Comparison tables with pricing tiers",
          icon: "pricing",
        },
      ],
    },
    content: {
      name: "Content",
      icon: "content",
      sections: [
        {
          id: "about",
          name: "Text + image",
          description: "Side-by-side text and image blocks",
          icon: "text-image",
        },
        {
          id: "text",
          name: "Text",
          description: "Simple text blocks with rich formatting",
          icon: "text",
        },
        {
          id: "header-text",
          name: "Header text",
          description: "Large headline sections",
          icon: "header",
        },
        {
          id: "restaurant-menu",
          name: "Restaurant menu",
          description: "Special menu layout with prices",
          icon: "menu",
        },
        {
          id: "blog-posts",
          name: "Recent blog posts",
          description: "Auto-pulls from blog if connected",
          icon: "blog",
        },
        {
          id: "faq",
          name: "FAQ",
          description: "Expandable question/answer sections",
          icon: "faq",
        },
      ],
    },
    clients: {
      name: "Clients",
      icon: "clients",
      sections: [
        {
          id: "logo-showcase",
          name: "Logo showcase",
          description: "Grid of client logos",
          icon: "logos",
        },
        {
          id: "testimonials",
          name: "Quote/testimonial",
          description: "Customer testimonial cards",
          icon: "testimonial",
        },
      ],
    },
    "image-gallery": {
      name: "Image gallery",
      icon: "gallery",
      sections: [
        {
          id: "image-carousel",
          name: "Image carousel",
          description: "Sliding image gallery",
          icon: "carousel",
        },
        {
          id: "image-grid",
          name: "Image grid",
          description: "Static grid layout of images",
          icon: "grid",
        },
        {
          id: "gallery",
          name: "Image",
          description: "Single image display",
          icon: "image",
        },
      ],
    },
    "video-content": {
      name: "Video content",
      icon: "video",
      sections: [
        {
          id: "video",
          name: "Video",
          description: "Embed YouTube, Vimeo, or upload direct video",
          icon: "video",
        },
      ],
    },
    "team-members": {
      name: "Team members",
      icon: "team",
      sections: [
        {
          id: "team",
          name: "Team members",
          description: "Staff profile cards with photos and details",
          icon: "team",
        },
      ],
    },
    "business-hours": {
      name: "Business hours",
      icon: "hours",
      sections: [
        {
          id: "hours",
          name: "Business hours",
          description: "Display operating hours and location",
          icon: "hours",
        },
      ],
    },
    testimonials: {
      name: "Testimonials",
      icon: "testimonials",
      sections: [
        {
          id: "testimonials",
          name: "Quote/testimonial",
          description: "Customer review cards",
          icon: "testimonial",
        },
        {
          id: "google-reviews",
          name: "Google reviews",
          description: "Auto-import from Google Business",
          icon: "reviews",
        },
      ],
    },
    "map-location": {
      name: "Map location",
      icon: "map",
      sections: [
        {
          id: "contact",
          name: "Location",
          description: "Interactive map with business location",
          icon: "location",
        },
      ],
    },
    "contact-form": {
      name: "Contact form",
      icon: "contact",
      sections: [
        {
          id: "contact-form",
          name: "Contact form",
          description: "Lead capture form with fields",
          icon: "form",
        },
      ],
    },
    schedule: {
      name: "Schedule",
      icon: "schedule",
      sections: [
        {
          id: "calendar",
          name: "Calendar",
          description: "Allow customers to book meetings",
          icon: "calendar",
        },
      ],
    },
    "social-media": {
      name: "Social media",
      icon: "social",
      sections: [
        {
          id: "social-links",
          name: "Social media links",
          description: "Links to your social media profiles",
          icon: "social",
        },
      ],
    },
    "custom-code": {
      name: "Custom code",
      icon: "code",
      sections: [
        {
          id: "custom-html",
          name: "Custom HTML",
          description: "Add custom HTML, CSS, or JavaScript",
          icon: "code",
        },
      ],
    },
  };

  // Function to render clean minimal icons
  const renderSectionIcon = (iconType: string) => {
    switch (iconType) {
      case "banner":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        );
      case "services":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      case "content":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "clients":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        );
      case "gallery":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "video":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case "team":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case "hours":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "testimonials":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      case "map":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case "contact":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            />
          </svg>
        );
      case "schedule":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "social":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4"
            />
          </svg>
        );
      case "code":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        );
    }
  };

  // Filter sections based on search query
  const getFilteredSections = (): Record<string, SectionCategory> => {
    if (!sectionSearchQuery) return sectionCategories;

    const filtered: Record<string, SectionCategory> = {};
    Object.entries(sectionCategories).forEach(([key, category]) => {
      const matchingSections = category.sections.filter(
        (section) =>
          section.name
            .toLowerCase()
            .includes(sectionSearchQuery.toLowerCase()) ||
          section.description
            .toLowerCase()
            .includes(sectionSearchQuery.toLowerCase())
      );
      if (matchingSections.length > 0) {
        filtered[key] = { ...category, sections: matchingSections };
      }
    });
    return filtered;
  };

  // Enhanced section creation with proper content
  const createAdvancedSection = async (
    sectionId: string,
    afterBlockId?: string
  ) => {
    console.log(`Creating section: ${sectionId}`);
    const content = await getAdvancedDefaultContent(sectionId);
    console.log(`Generated content for ${sectionId}:`, content);

    const newBlock: ContentBlock = {
      id: `${sectionId}-${Date.now()}`,
      type: getBlockTypeFromSectionId(sectionId),
      content,
      styles: getAdvancedDefaultStyles(sectionId),
    };

    console.log(`Created block:`, newBlock);

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
        saveToRecentProjects(updatedWebsite);
      }

      return updatedWebsite;
    });

    setShowSectionPanel(false);
    setActiveSectionCategory(null);
    setSectionSearchQuery("");
  };

  // Map section IDs to block types
  const getBlockTypeFromSectionId = (
    sectionId: string
  ): ContentBlock["type"] => {
    const mapping: Record<string, ContentBlock["type"]> = {
      hero: "hero",
      "hero-left": "hero",
      "hero-slider": "hero",
      "hero-double": "hero",
      "hero-carousel": "hero",
      "hero-split": "hero",
      "hero-grid": "hero",
      services: "services",
      "services-list": "services",
      pricing: "services",
      about: "about",
      text: "about",
      "header-text": "about",
      "restaurant-menu": "services",
      "blog-posts": "about",
      faq: "features",
      "logo-showcase": "features",
      testimonials: "testimonials",
      "image-carousel": "gallery",
      "image-grid": "gallery",
      gallery: "gallery",
      video: "gallery",
      team: "features",
      hours: "contact",
      "google-reviews": "testimonials",
      contact: "contact",
      "contact-form": "contact",
      calendar: "contact",
    };
    return mapping[sectionId] || "about";
  };

  // Enhanced content generation for different section types
  const getAdvancedDefaultContent = async (sectionId: string) => {
    const businessInfoStr = safeLocalStorage.getItem(
      `business_info_${user?.id}`
    );
    const businessInfo: BusinessInfo = businessInfoStr
      ? JSON.parse(businessInfoStr)
      : null;
    const businessName = businessInfo?.name || "Your Business";
    const businessType = businessInfo?.type || "Business";
    const location = businessInfo?.location || "Your City";

    switch (sectionId) {
      case "hero":
        const heroImage = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "hero banner",
            location
          )
        );
        return {
          title: `Welcome to ${businessName}`,
          subtitle: `Professional ${businessType} services you can trust`,
          buttonText: "Get Started",
          backgroundImage: heroImage,
        };

      case "hero-left":
        const heroLeftImage = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "professional team",
            location
          )
        );
        return {
          title: `Transform Your ${businessType} Experience`,
          subtitle: `${businessName} delivers exceptional results with personalized service`,
          buttonText: "Learn More",
          backgroundImage: heroLeftImage,
        };

      case "hero-slider":
        const sliderImage1 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "modern office",
            location
          )
        );
        const sliderImage2 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "professional workspace",
            location
          )
        );
        const sliderImage3 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "business team",
            location
          )
        );
        return {
          title: `Premium ${businessType} Solutions`,
          subtitle: "Discover excellence in every service we provide",
          buttonText: "Explore Services",
          images: [sliderImage1, sliderImage2, sliderImage3],
        };

      case "hero-double":
        const doubleImage1 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "corporate office",
            location
          )
        );
        const doubleImage2 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "business meeting",
            location
          )
        );
        return {
          title: `${businessName} Excellence`,
          subtitle: "Two decades of trusted service and innovation",
          buttonText: "Get Quote",
          images: [doubleImage1, doubleImage2],
        };

      case "hero-carousel":
        const carouselImage1 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "professional service",
            location
          )
        );
        const carouselImage2 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "expert consultation",
            location
          )
        );
        const carouselImage3 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "customer support",
            location
          )
        );
        return {
          title: "Multiple Solutions, One Company",
          slides: [
            {
              title: `${businessName} Services`,
              subtitle: "Professional solutions for your needs",
              buttonText: "Learn More",
              backgroundImage: carouselImage1,
            },
            {
              title: "Expert Consultation",
              subtitle: "Get professional advice from industry experts",
              buttonText: "Book Consultation",
              backgroundImage: carouselImage2,
            },
            {
              title: "24/7 Support",
              subtitle: "Round-the-clock assistance when you need it",
              buttonText: "Contact Support",
              backgroundImage: carouselImage3,
            },
          ],
        };

      case "hero-split":
        const splitImage = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "professional team",
            location
          )
        );
        return {
          title: `Why Choose ${businessName}?`,
          subtitle: `Leading ${businessType} provider with proven results`,
          description:
            "We combine innovation with expertise to deliver outstanding results. Our team is dedicated to your success.",
          buttonText: "Start Today",
          image: splitImage,
          highlights: ["Expert Team", "Proven Results", "24/7 Support"],
        };

      case "hero-grid":
        const gridImage1 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "service quality",
            location
          )
        );
        const gridImage2 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "expert consultation",
            location
          )
        );
        const gridImage3 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "customer support",
            location
          )
        );
        const gridImage4 = await fetchPexelsImage(
          createBusinessSpecificImageQuery(
            businessType,
            "custom solutions",
            location
          )
        );
        return {
          title: `${businessName} Services`,
          subtitle: "Comprehensive solutions for your business",
          services: [
            {
              title: "Service 1",
              description: "Professional service description",
              icon: "⭐",
              image: gridImage1,
            },
            {
              title: "Service 2",
              description: "Expert consultation and support",
              icon: "🎯",
              image: gridImage2,
            },
            {
              title: "Service 3",
              description: "24/7 customer assistance",
              icon: "🛟",
              image: gridImage3,
            },
            {
              title: "Service 4",
              description: "Custom solutions for your needs",
              icon: "🚀",
              image: gridImage4,
            },
          ],
        };

      case "services":
        return {
          title: "Our Services",
          subtitle: `Comprehensive ${businessType} solutions`,
          services: [
            {
              title: "Premium Service",
              description: "High-quality service tailored to your needs",
              icon: "⭐",
              image:
                "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop&q=80",
            },
            {
              title: "Expert Consultation",
              description: "Professional guidance from industry experts",
              icon: "🎯",
              image:
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop&q=80",
            },
            {
              title: "24/7 Support",
              description: "Round-the-clock assistance when you need it",
              icon: "🛟",
              image:
                "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop&q=80",
            },
          ],
        };

      case "services-list":
        return {
          title: "What We Offer",
          subtitle: `Complete ${businessType} services`,
          highlights: [
            "Professional Consultation",
            "Custom Solutions",
            "Implementation Support",
            "Ongoing Maintenance",
            "24/7 Customer Service",
            "Quality Guarantee",
          ],
        };

      case "pricing":
        return {
          title: "Choose Your Plan",
          subtitle: "Flexible pricing options for every need",
          services: [
            {
              title: "Basic",
              description: "Perfect for getting started",
              icon: "💎",
              price: "$99",
              period: "/month",
              features: [
                "Feature 1",
                "Feature 2",
                "Feature 3",
                "Email Support",
              ],
              buttonText: "Get Started",
              popular: false,
            },
            {
              title: "Professional",
              description: "Most popular choice",
              icon: "🚀",
              price: "$199",
              period: "/month",
              features: [
                "Everything in Basic",
                "Advanced Features",
                "Priority Support",
                "Custom Integration",
              ],
              buttonText: "Choose Plan",
              popular: true,
            },
            {
              title: "Enterprise",
              description: "For large organizations",
              icon: "🏢",
              price: "Custom",
              period: "",
              features: [
                "Everything in Professional",
                "Custom Development",
                "Dedicated Manager",
                "SLA Guarantee",
              ],
              buttonText: "Contact Sales",
              popular: false,
            },
          ],
        };

      case "about":
        return {
          title: `About ${businessName}`,
          description: `We are a leading ${businessType} company dedicated to providing exceptional service and innovative solutions. Our team of experts brings years of experience to help you achieve your goals.`,
          image:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
          highlights: ["Quality Service", "Expert Team", "Proven Results"],
        };

      case "text":
        return {
          title: "Your Content Header",
          description:
            "Add your text content here. You can include multiple paragraphs, format text, and create engaging content for your visitors. This section is perfect for detailed explanations, company information, or any other text-based content.",
        };

      case "header-text":
        return {
          title: `Welcome to ${businessName}`,
          subtitle: `Your trusted ${businessType} partner in ${location}`,
          description:
            "We deliver exceptional results through innovative solutions and dedicated service.",
        };

      case "restaurant-menu":
        return {
          title: "Our Menu",
          subtitle: "Delicious options for every taste",
          services: [
            {
              title: "Appetizers",
              description: "Fresh starters to begin your meal",
              icon: "🥗",
              items: [
                {
                  name: "Caesar Salad",
                  price: "$12",
                  description: "Fresh romaine, parmesan, croutons",
                },
                {
                  name: "Soup of the Day",
                  price: "$8",
                  description: "Chef's daily selection",
                },
                {
                  name: "Bruschetta",
                  price: "$10",
                  description: "Toasted bread with tomato and basil",
                },
              ],
            },
            {
              title: "Main Courses",
              description: "Hearty dishes made with premium ingredients",
              icon: "🍽️",
              items: [
                {
                  name: "Grilled Salmon",
                  price: "$24",
                  description: "Atlantic salmon with seasonal vegetables",
                },
                {
                  name: "Ribeye Steak",
                  price: "$32",
                  description: "12oz prime cut with garlic mashed potatoes",
                },
                {
                  name: "Pasta Primavera",
                  price: "$18",
                  description: "Fresh vegetables in cream sauce",
                },
              ],
            },
            {
              title: "Desserts",
              description: "Sweet endings to your perfect meal",
              icon: "🍰",
              items: [
                {
                  name: "Chocolate Cake",
                  price: "$8",
                  description: "Rich chocolate with berry compote",
                },
                {
                  name: "Tiramisu",
                  price: "$9",
                  description: "Classic Italian dessert",
                },
                {
                  name: "Ice Cream",
                  price: "$6",
                  description: "Vanilla, chocolate, or strawberry",
                },
              ],
            },
          ],
        };

      case "blog-posts":
        return {
          title: "Latest News & Updates",
          subtitle: "Stay informed with our latest insights",
          features: [
            {
              title: "Industry Trends 2024",
              description:
                "Discover the latest trends shaping our industry and how they impact your business.",
              icon: "📈",
              image:
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=250&fit=crop&q=80",
              date: "March 15, 2024",
              readTime: "5 min read",
            },
            {
              title: "Success Story: Client Achievement",
              description:
                "Learn how we helped a client achieve remarkable results through our innovative approach.",
              icon: "🏆",
              image:
                "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop&q=80",
              date: "March 10, 2024",
              readTime: "3 min read",
            },
            {
              title: "Tips for Better Results",
              description:
                "Expert advice and best practices to help you maximize your success.",
              icon: "💡",
              image:
                "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=250&fit=crop&q=80",
              date: "March 5, 2024",
              readTime: "7 min read",
            },
          ],
        };

      case "faq":
        return {
          title: "Frequently Asked Questions",
          subtitle: "Find answers to common questions",
          features: [
            {
              title: "What services do you offer?",
              description: `We offer comprehensive ${businessType} services including consultation, implementation, and ongoing support.`,
              icon: "❓",
            },
            {
              title: "How do I get started?",
              description:
                "Simply contact us through our website or call us directly. We'll schedule a consultation to discuss your needs.",
              icon: "🚀",
            },
            {
              title: "What are your hours?",
              description:
                "We're open Monday through Friday, 9 AM to 6 PM. Emergency support is available 24/7.",
              icon: "🕒",
            },
            {
              title: "Do you offer support?",
              description:
                "Yes, we provide comprehensive support including phone, email, and live chat assistance.",
              icon: "🛟",
            },
          ],
        };

      case "logo-showcase":
        return {
          title: "Trusted by Leading Companies",
          subtitle: "Join hundreds of satisfied clients",
          images: [
            "https://via.placeholder.com/200x100/4F46E5/FFFFFF?text=Company+1",
            "https://via.placeholder.com/200x100/7C3AED/FFFFFF?text=Company+2",
            "https://via.placeholder.com/200x100/2563EB/FFFFFF?text=Company+3",
            "https://via.placeholder.com/200x100/DC2626/FFFFFF?text=Company+4",
            "https://via.placeholder.com/200x100/059669/FFFFFF?text=Company+5",
            "https://via.placeholder.com/200x100/D97706/FFFFFF?text=Company+6",
          ],
        };

      case "testimonials":
      case "google-reviews":
        return {
          title: "What Our Clients Say",
          subtitle: "Real feedback from real customers",
          testimonials: [
            {
              text: `${businessName} exceeded our expectations. Their professional service and attention to detail made all the difference.`,
              author: "Sarah Johnson",
              company: "Tech Solutions Inc.",
              rating: 5,
              image:
                "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&q=80",
            },
            {
              text: "Outstanding results and excellent customer service. Highly recommend their services.",
              author: "Michael Chen",
              company: "Innovation Labs",
              rating: 5,
              image:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80",
            },
            {
              text: "Professional, reliable, and delivers on promises. Great experience working with them.",
              author: "Emily Rodriguez",
              company: "Growth Partners",
              rating: 5,
              image:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
            },
          ],
        };

      case "image-carousel":
        return {
          title: "Our Gallery",
          subtitle: "Explore our work and achievements",
          images: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop&q=80",
            "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop&q=80",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&q=80",
            "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop&q=80",
          ],
        };

      case "image-grid":
        return {
          title: "Our Portfolio",
          subtitle: "A showcase of our best work",
          images: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop&q=80",
            "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&q=80",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop&q=80",
            "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop&q=80",
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&q=80",
          ],
        };

      case "gallery":
        return {
          title: "Featured Image",
          subtitle: "Highlighting our excellence",
          image:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&q=80",
          description:
            "This image represents our commitment to quality and excellence in everything we do.",
        };

      case "video":
        return {
          title: "Watch Our Story",
          subtitle: "Learn more about what we do",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          description:
            "Discover how we can help transform your business with our innovative solutions.",
        };

      case "team":
        return {
          title: "Meet Our Team",
          subtitle: "The experts behind our success",
          features: [
            {
              title: "John Smith",
              description: "CEO & Founder - 15+ years of industry experience",
              icon: "👨‍💼",
              image:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&q=80",
              role: "CEO & Founder",
              bio: "John leads our company with vision and expertise, bringing over 15 years of industry experience.",
            },
            {
              title: "Sarah Wilson",
              description: "Lead Consultant - Expert in client relations",
              icon: "👩‍💼",
              image:
                "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=300&fit=crop&q=80",
              role: "Lead Consultant",
              bio: "Sarah ensures our clients receive exceptional service and achieve their goals.",
            },
            {
              title: "David Brown",
              description: "Technical Director - Innovation specialist",
              icon: "👨‍💻",
              image:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80",
              role: "Technical Director",
              bio: "David drives our technical innovation and ensures we stay ahead of industry trends.",
            },
          ],
        };

      case "hours":
        return {
          title: "Business Hours",
          subtitle: "When you can reach us",
          address:
            businessInfo?.location || "123 Business St, City, State 12345",
          phone: "+1 (555) 123-4567",
          email: `info@${businessName.toLowerCase().replace(/\s+/g, "")}.com`,
          hours: [
            { day: "Monday", time: "9:00 AM - 6:00 PM" },
            { day: "Tuesday", time: "9:00 AM - 6:00 PM" },
            { day: "Wednesday", time: "9:00 AM - 6:00 PM" },
            { day: "Thursday", time: "9:00 AM - 6:00 PM" },
            { day: "Friday", time: "9:00 AM - 6:00 PM" },
            { day: "Saturday", time: "10:00 AM - 4:00 PM" },
            { day: "Sunday", time: "Closed" },
          ],
        };

      case "contact":
        return {
          title: "Visit Our Location",
          subtitle: "Find us at our convenient location",
          address:
            businessInfo?.location || "123 Business St, City, State 12345",
          email: `contact@${businessName
            .toLowerCase()
            .replace(/\s+/g, "")}.com`,
          phone: "+1 (555) 123-4567",
          mapUrl: `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
            businessInfo?.location || "New York, NY"
          )}`,
        };

      case "contact-form":
        return {
          title: "Get In Touch",
          subtitle: "Send us a message and we'll get back to you soon",
          formFields: [
            { name: "name", label: "Full Name", type: "text", required: true },
            {
              name: "email",
              label: "Email Address",
              type: "email",
              required: true,
            },
            {
              name: "phone",
              label: "Phone Number",
              type: "tel",
              required: false,
            },
            { name: "subject", label: "Subject", type: "text", required: true },
            {
              name: "message",
              label: "Message",
              type: "textarea",
              required: true,
            },
          ],
          buttonText: "Send Message",
        };

      case "calendar":
        return {
          title: "Schedule an Appointment",
          subtitle: "Book a time that works for you",
          description:
            "Choose from our available time slots and we'll confirm your appointment.",
          calendarUrl: "https://calendly.com/your-business",
          services: [
            {
              title: "Consultation",
              description: "30 minute consultation session",
              icon: "📅",
              price: "Free",
              period: "",
            },
            {
              title: "Strategy Session",
              description: "60 minute strategy planning session",
              icon: "💡",
              price: "$150",
              period: "",
            },
            {
              title: "Full Assessment",
              description: "90 minute comprehensive assessment",
              icon: "📊",
              price: "$250",
              period: "",
            },
          ],
        };

      case "social-links":
        return {
          title: "Follow Us",
          subtitle: "Stay connected on social media",
          socialLinks: [
            {
              platform: "Facebook",
              url: "https://facebook.com/yourbusiness",
              icon: "📘",
            },
            {
              platform: "Twitter",
              url: "https://twitter.com/yourbusiness",
              icon: "🐦",
            },
            {
              platform: "LinkedIn",
              url: "https://linkedin.com/company/yourbusiness",
              icon: "💼",
            },
            {
              platform: "Instagram",
              url: "https://instagram.com/yourbusiness",
              icon: "📷",
            },
            {
              platform: "YouTube",
              url: "https://youtube.com/yourbusiness",
              icon: "📺",
            },
          ],
        };

      case "custom-html":
        return {
          title: "Custom Content",
          subtitle: "Add your custom HTML, CSS, or JavaScript",
          htmlContent: `<div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 8px;">
            <h3>Custom HTML Section</h3>
            <p>You can add any custom HTML, CSS, or JavaScript code here.</p>
            <button style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
              Custom Button
            </button>
          </div>`,
        };

      default:
        return getDefaultContent(getBlockTypeFromSectionId(sectionId));
    }
  };

  // Enhanced styles for different section types
  const getAdvancedDefaultStyles = (sectionId: string) => {
    switch (sectionId) {
      case "hero-left":
        return {
          height: "70vh",
          minHeight: "600px",
          textAlign: "left",
          paddingLeft: "10%",
        };

      case "hero-slider":
        return {
          height: "80vh",
          minHeight: "700px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        };

      case "pricing":
        return {
          padding: "80px 0",
          backgroundColor: "#f8fafc",
          textAlign: "center",
        };

      case "text":
        return {
          padding: "60px 0",
          backgroundColor: "#ffffff",
          maxWidth: "800px",
          margin: "0 auto",
        };

      case "faq":
        return {
          padding: "80px 0",
          backgroundColor: "#f1f5f9",
        };

      case "team":
        return {
          padding: "80px 0",
          backgroundColor: "#ffffff",
        };

      case "contact-form":
        return {
          padding: "80px 0",
          backgroundColor: "#f8fafc",
        };

      default:
        return getDefaultStyles(getBlockTypeFromSectionId(sectionId));
    }
  };

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

    // Single click - just select the block, don't show floating actions yet
    setSelectedBlock(blockId);

    // Only show floating actions on double click
    if (event.detail === 2) {
      setShowFloatingActions(true);
      setFloatingActionsPosition({
        x: event.clientX,
        y: event.clientY - 60,
      });
    }
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
    console.log("🗑️ Delete function called with blockId:", blockId);

    setWebsite((prev) => {
      if (!prev) return null;

      console.log(
        "📝 Current blocks before deletion:",
        prev.blocks.map((b) => b.id)
      );

      const updatedWebsite = {
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== blockId),
      };

      console.log(
        "✅ Updated blocks after deletion:",
        updatedWebsite.blocks.map((b) => b.id)
      );

      // Save updated website to localStorage
      if (user?.id) {
        safeLocalStorage.setItem(
          `generated_website_${user.id}`,
          JSON.stringify(updatedWebsite)
        );
        // Update recent projects with the change
        saveToRecentProjects(updatedWebsite);
        console.log("💾 Website saved to localStorage");
      }

      // Hide floating actions after deletion
      setShowFloatingActions(false);
      setSelectedBlock(null);
      console.log("🎯 Floating actions hidden and selectedBlock cleared");

      return updatedWebsite;
    });
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
          <>
            {/* Banner Image Slider - Rotating background images, static content */}
            {block.content.images && block.content.images.length > 0 ? (
              <div className="relative h-full overflow-hidden">
                {block.content.images.map((img, index) => {
                  const currentImg = carouselStates[block.id] || 0;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentImg
                          ? "opacity-100 z-10"
                          : "opacity-0 z-0"
                      }`}
                      style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${img})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        minHeight: block.styles.minHeight || "600px",
                      }}
                    >
                      <div className="relative h-full flex items-center justify-center text-white">
                        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
                          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                            {block.content.title}
                          </h1>
                          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-90">
                            {block.content.subtitle}
                          </p>
                          {block.content.buttonText && (
                            <button className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors">
                              {block.content.buttonText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Image slider indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {block.content.images.map((_, index) => {
                    const currentImg = carouselStates[block.id] || 0;
                    return (
                      <button
                        key={index}
                        onClick={() =>
                          setCarouselStates((prev) => ({
                            ...prev,
                            [block.id]: index,
                          }))
                        }
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImg ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ) : block.content.slides && block.content.slides.length > 0 ? (
              // ... existing carousel code ...
              <div className="relative h-full overflow-hidden">
                {block.content.slides.map((slide, index) => {
                  const currentSlide = carouselStates[block.id] || 0;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                        index === currentSlide
                          ? "translate-x-0"
                          : index < currentSlide
                          ? "-translate-x-full"
                          : "translate-x-full"
                      }`}
                    >
                      <div
                        className="relative h-full flex items-center justify-center text-white"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.backgroundImage})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          minHeight: block.styles.minHeight || "600px",
                        }}
                      >
                        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
                          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                            {slide.title}
                          </h1>
                          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-90">
                            {slide.subtitle}
                          </p>
                          <button className="bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors">
                            {slide.buttonText}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Carousel indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {block.content.slides.map((_, index) => {
                    const currentSlide = carouselStates[block.id] || 0;
                    return (
                      <button
                        key={index}
                        onClick={() =>
                          setCarouselStates((prev) => ({
                            ...prev,
                            [block.id]: index,
                          }))
                        }
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentSlide ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Standard Banner (static) - Durable AI Style */
              <div
                className="relative h-full flex items-center justify-center text-white"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${block.content.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "80vh",
                }}
                onClick={() =>
                  handleImageClick(
                    block.id,
                    "backgroundImage",
                    block.content.backgroundImage || ""
                  )
                }
              >
                <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                    {block.content.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed font-light">
                    {block.content.subtitle}
                  </p>
                  {block.content.buttonText && (
                    <button className="bg-white text-gray-900 px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      {block.content.buttonText}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
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
                    onClick={() =>
                      handleImageClick(
                        block.id,
                        "image",
                        block.content.image || ""
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
                        onClick={() =>
                          handleImageClick(
                            block.id,
                            `services[${index}].image`,
                            service.image || ""
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
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSectionPanel(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm font-medium whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Add section</span>
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

    // Setup new panel data immediately
    setupCallback();

    // Clean up transition state
    setTimeout(() => {
      setPanelTransition({
        isTransitioning: false,
        fromPanel: null,
        toPanel: null,
      });
    }, 300);
  };

  // Handle image clicks to show settings popup
  const handleImageClick = (
    blockId: string,
    field: string,
    currentUrl: string
  ) => {
    if (isPreviewMode) return;

    createSmoothTransition("image", () => {
      setSelectedImage({ blockId, field, currentUrl, altText: "" });
      setShowImageSettings(true);
      setImageAltText("");
      setImagePosition({ horizontal: 50, vertical: 50 });
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
          blocks: prev.blocks.map((block) => {
            if (block.id !== selectedImage.blockId) return block;

            // Handle nested service images
            if (
              selectedImage.field.includes("services[") &&
              selectedImage.field.includes("].image")
            ) {
              const serviceIndexMatch = selectedImage.field.match(
                /services\[(\d+)\]\.image/
              );
              if (serviceIndexMatch && block.content.services) {
                const serviceIndex = parseInt(serviceIndexMatch[1]);
                const updatedServices = [...block.content.services];
                if (updatedServices[serviceIndex]) {
                  updatedServices[serviceIndex] = {
                    ...updatedServices[serviceIndex],
                    image: newImageUrl,
                  };
                }
                return {
                  ...block,
                  content: {
                    ...block.content,
                    services: updatedServices,
                  },
                };
              }
            }

            // Handle direct field updates (like backgroundImage, image)
            return {
              ...block,
              content: {
                ...block.content,
                [selectedImage.field]: newImageUrl,
              },
            };
          }),
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
        blocks: prev.blocks.map((block) => {
          if (block.id !== selectedImage.blockId) return block;

          // Handle nested service images
          if (
            selectedImage.field.includes("services[") &&
            selectedImage.field.includes("].image")
          ) {
            const serviceIndexMatch = selectedImage.field.match(
              /services\[(\d+)\]\.image/
            );
            if (serviceIndexMatch && block.content.services) {
              const serviceIndex = parseInt(serviceIndexMatch[1]);
              const updatedServices = [...block.content.services];
              if (updatedServices[serviceIndex]) {
                updatedServices[serviceIndex] = {
                  ...updatedServices[serviceIndex],
                  image: imageUrl,
                };
              }
              return {
                ...block,
                content: {
                  ...block.content,
                  services: updatedServices,
                },
              };
            }
          }

          // Handle direct field updates (like backgroundImage, image)
          return {
            ...block,
            content: {
              ...block.content,
              [selectedImage.field]: imageUrl,
            },
          };
        }),
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

      setSelectedTextImageBlock({ blockId, blockType });
      setShowTextImagePanel(true);
    });
  };

  // Apply style changes to the selected block
  const applyStyleToBlock = (
    blockId: string,
    styles: Record<string, string | number>
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
                  ...styles,
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
  };

  // Handle content regeneration for Text + Image
  const handleRegenerateContent = async () => {
    if (!selectedTextImageBlock) return;

    setIsRegeneratingContent(true);
    try {
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

      const prompt = `Generate new content for a ${businessInfo.type} business named "${businessInfo.name}" located in ${businessInfo.location}. Create a compelling title and description for an "About Us" or "Text + Image" section. Return as JSON with this structure: {"title": "", "description": ""}`;

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
        const newContent = data.content;

        // Update the website with new content
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
                      title: newContent.title,
                      description: newContent.description,
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
      } else {
        throw new Error("Failed to generate content");
      }
    } catch (error) {
      console.error("Failed to regenerate content:", error);
      alert(
        "Failed to regenerate content. Please check your API configuration."
      );
    } finally {
      setIsRegeneratingContent(false);
    }
  };

  // Handle image regeneration for Text + Image
  const handleRegenerateTextImage = async () => {
    if (!selectedTextImageBlock) return;

    setIsRegeneratingTextImage(true);
    try {
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

      const imageQuery = createBusinessSpecificImageQuery(
        businessInfo.type,
        "about",
        businessInfo.location
      );

      const newImageUrl = await fetchPexelsImage(imageQuery);

      // Update the website with new image
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
    } catch (error) {
      console.error("Failed to regenerate image:", error);
      alert("Failed to regenerate image. Please check your API configuration.");
    } finally {
      setIsRegeneratingTextImage(false);
    }
  };

  // Handle image upload for Text + Image
  const handleTextImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTextImageBlock) return;

    const imageUrl = URL.createObjectURL(file);

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
  };

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

          /* Durable AI Style Range Sliders */
          .slider {
            background: linear-gradient(to right, #3b82f6 0%, #3b82f6 50%, #e5e7eb 50%, #e5e7eb 100%);
          }
          
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }
          
          .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }

          /* Animation Keyframes */
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
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
              onClick={() => setShowSectionPanel(true)}
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
            onClick={() => {
              console.log(
                "🖱️ Delete button clicked! selectedBlock:",
                selectedBlock
              );
              deleteBlock(selectedBlock);
            }}
            className="p-2 hover:bg-red-100 rounded text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}

      {/* Add Section Panel */}
      {showSectionPanel && !isPreviewMode && (
        <div
          className="fixed bg-white shadow-xl border border-gray-200 z-50"
          style={{
            right: "20px",
            top: "80px",
            width: "300px",
            height: "calc(100vh - 100px)",
            borderRadius: "12px",
          }}
        >
          <div className="w-full h-full flex flex-col overflow-hidden">
            {!activeSectionCategory ? (
              /* Main Categories View */
              <>
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add section
                    </h3>
                    <button
                      onClick={() => {
                        setShowSectionPanel(false);
                        setActiveSectionCategory(null);
                        setSectionSearchQuery("");
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={sectionSearchQuery}
                      onChange={(e) => setSectionSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Categories List */}
                <div className="flex-1 overflow-y-auto">
                  {Object.entries(getFilteredSections()).map(
                    ([key, category]) => (
                      <button
                        key={key}
                        onClick={() => setActiveSectionCategory(key)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {renderSectionIcon(category.icon)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )
                  )}
                </div>
              </>
            ) : (
              /* Individual Category Sections View */
              <>
                {/* Header with Back Button */}
                <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setActiveSectionCategory(null)}
                        className="text-gray-600 hover:text-gray-800 p-1"
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sectionCategories[activeSectionCategory]?.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowSectionPanel(false);
                        setActiveSectionCategory(null);
                        setSectionSearchQuery("");
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Sections List */}
                <div className="flex-1 overflow-y-auto">
                  {sectionCategories[activeSectionCategory]?.sections.map(
                    (section) => (
                      <button
                        key={section.id}
                        onClick={async () => {
                          await createAdvancedSection(section.id);
                          setShowSectionPanel(false);
                          setActiveSectionCategory(null);
                          setSectionSearchQuery("");
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {renderSectionIcon(section.icon)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {section.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {section.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Settings Panel */}
      {showImageSettings && selectedImage && !isPreviewMode && (
        <div
          className="fixed bg-white shadow-xl border border-gray-200 z-50"
          style={{
            right: "20px",
            top: "80px",
            width: "320px",
            height: "calc(100vh - 100px)",
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowImageSettings(false);
                  setSelectedImage(null);
                }}
                className="text-gray-600 hover:text-gray-800"
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
              <h3 className="text-lg font-semibold text-gray-900">
                Image settings
              </h3>
            </div>
            <button
              onClick={() => {
                setShowImageSettings(false);
                setSelectedImage(null);
              }}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Content */}
          <div
            className="p-4 overflow-y-auto"
            style={{ height: "calc(100% - 73px)" }}
          >
            {/* Image Preview */}
            <div className="mb-6">
              <div className="relative">
                <img
                  src={selectedImage.currentUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg"
                  key={selectedImage.currentUrl} // Force re-render when URL changes
                />
                <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-6">
              <button
                onClick={handleRegenerateImage}
                disabled={isRegenerating}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                <span className="text-sm font-medium">Regenerate</span>
              </button>
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChangeImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm font-medium">Change</span>
                </button>
              </div>
            </div>

            {/* Alt Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt text
              </label>
              <input
                type="text"
                value={imageAltText}
                onChange={(e) => setImageAltText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Science, teamwork and scientist with tablet in..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the image to improve SEO and accessibility
              </p>
            </div>

            {/* Image Position */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Image position
              </h4>
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Horizontal
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={imagePosition.horizontal}
                  onChange={(e) =>
                    setImagePosition((prev) => ({
                      ...prev,
                      horizontal: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Vertical
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={imagePosition.vertical}
                  onChange={(e) =>
                    setImagePosition((prev) => ({
                      ...prev,
                      vertical: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Button Settings Panel */}
      {showButtonSettings && selectedButton && !isPreviewMode && (
        <div
          className="fixed bg-white shadow-xl border border-gray-200 z-50"
          style={{
            right: "20px",
            top: "80px",
            width: "320px",
            height: "calc(100vh - 100px)",
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowButtonSettings(false);
                  setSelectedButton(null);
                }}
                className="text-gray-600 hover:text-gray-800"
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
              <h3 className="text-lg font-semibold text-gray-900">
                Button settings
              </h3>
            </div>
            <button
              onClick={() => {
                setShowButtonSettings(false);
                setSelectedButton(null);
              }}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Content */}
          <div
            className="p-4 overflow-y-auto"
            style={{ height: "calc(100% - 73px)" }}
          >
            {/* Link Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="section">Section</option>
                  <option value="page">Page</option>
                  <option value="url">External URL</option>
                  <option value="email">Email Address</option>
                  <option value="phone">Phone Number</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

            {/* Label */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                type="text"
                value={buttonLabel}
                onChange={(e) => {
                  setButtonLabel(e.target.value);
                  setWebsite((prev) => {
                    if (!prev || !selectedButton) return prev;
                    return {
                      ...prev,
                      blocks: prev.blocks.map((block) =>
                        block.id === selectedButton.blockId
                          ? {
                              ...block,
                              content: {
                                ...block.content,
                                [selectedButton.field]: e.target.value,
                              },
                            }
                          : block
                      ),
                    };
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Join the Innovation"
              />
            </div>

            {/* Section (conditional) */}
            {buttonLinkType === "section" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <div className="relative">
                  <select
                    value={buttonSection}
                    onChange={(e) => setButtonSection(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="hero">Service-list</option>
                    <option value="about">About</option>
                    <option value="services">Services</option>
                    <option value="contact">Contact</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
                <p className="text-xs text-gray-500 mt-1">
                  A section on this page
                </p>
              </div>
            )}

            {/* URL Field (conditional) */}
            {buttonLinkType === "url" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* Email Field (conditional) */}
            {buttonLinkType === "email" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={buttonEmail}
                  onChange={(e) => setButtonEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@example.com"
                />
              </div>
            )}

            {/* Phone Field (conditional) */}
            {buttonLinkType === "phone" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={buttonPhone}
                  onChange={(e) => setButtonPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text + Image Panel */}
      {showTextImagePanel && selectedTextImageBlock && !isPreviewMode && (
        <div
          className="fixed bg-white shadow-xl border border-gray-200 z-50"
          style={{
            right: "20px",
            top: "80px",
            width: "320px",
            height: "calc(100vh - 100px)",
            borderRadius: "12px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowTextImagePanel(false);
                  setSelectedTextImageBlock(null);
                }}
                className="text-gray-600 hover:text-gray-800"
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
              <h3 className="text-lg font-semibold text-gray-900">
                Text + Image
              </h3>
            </div>
            <button
              onClick={() => {
                setShowTextImagePanel(false);
                setSelectedTextImageBlock(null);
              }}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setTextImageActiveTab("content")}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                  textImageActiveTab === "content"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Content</span>
                </div>
              </button>
              <button
                onClick={() => setTextImageActiveTab("style")}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                  textImageActiveTab === "style"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
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
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4l-1.5-1.5M9 15l-2-2"
                    />
                  </svg>
                  <span>Style</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="overflow-y-auto"
            style={{ height: "calc(100% - 121px)" }}
          >
            {textImageActiveTab === "content" && (
              <div className="p-4">
                {/* Content Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Content
                    </h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRegenerateContent}
                        disabled={isRegeneratingContent}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Regenerate content"
                      >
                        {isRegeneratingContent ? (
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
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
                        )}
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
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
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Text Editor Toolbar */}
                  <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    <button className="p-1 text-gray-600 hover:text-gray-800">
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
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800">
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
                          d="M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2z"
                        />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800 font-bold">
                      T
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800">
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
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800">
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
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800">
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
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800 italic">
                      I
                    </button>
                  </div>

                  {/* Live Content Editing */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={
                          website?.blocks.find(
                            (b) => b.id === selectedTextImageBlock?.blockId
                          )?.content.title || ""
                        }
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            handleTextChange(
                              selectedTextImageBlock.blockId,
                              "title",
                              e.target.value
                            );
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter title..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={
                          website?.blocks.find(
                            (b) => b.id === selectedTextImageBlock?.blockId
                          )?.content.description || ""
                        }
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            handleTextChange(
                              selectedTextImageBlock.blockId,
                              "description",
                              e.target.value
                            );
                          }
                        }}
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter description..."
                      />
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="mb-6">
                  <div className="relative mb-4">
                    <img
                      src={
                        website?.blocks.find(
                          (b) => b.id === selectedTextImageBlock?.blockId
                        )?.content.image ||
                        "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=200&fit=crop&q=80"
                      }
                      alt="Section image"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Image Action Buttons */}
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={handleRegenerateTextImage}
                      disabled={isRegeneratingTextImage}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {isRegeneratingTextImage ? (
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
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
                      )}
                      <span className="text-sm">Regenerate</span>
                    </button>
                    <div className="relative flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTextImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="text-sm">Change</span>
                      </button>
                    </div>
                  </div>

                  {/* Alt Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alt text
                    </label>
                    <input
                      type="text"
                      defaultValue={`Professional ${
                        website?.businessType || "business"
                      } image`}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the image..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Describe the image to improve SEO and accessibility
                    </p>
                  </div>

                  {/* Image Position */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">
                      Image position
                    </h5>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">
                        Horizontal
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="50"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              backgroundPositionX: `${e.target.value}%`,
                            });
                          }
                        }}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">
                        Vertical
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="50"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              backgroundPositionY: `${e.target.value}%`,
                            });
                          }
                        }}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  {/* Button Toggle */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-700">
                        Button
                      </h5>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          onChange={(e) => {
                            if (selectedTextImageBlock) {
                              setWebsite((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  blocks: prev.blocks.map((block) =>
                                    block.id === selectedTextImageBlock.blockId
                                      ? {
                                          ...block,
                                          content: {
                                            ...block.content,
                                            buttonText: e.target.checked
                                              ? "Learn More"
                                              : "",
                                          },
                                        }
                                      : block
                                  ),
                                };
                              });
                            }
                          }}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    {website?.blocks.find(
                      (b) => b.id === selectedTextImageBlock?.blockId
                    )?.content.buttonText && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={
                            website?.blocks.find(
                              (b) => b.id === selectedTextImageBlock?.blockId
                            )?.content.buttonText || ""
                          }
                          onChange={(e) => {
                            if (selectedTextImageBlock) {
                              handleTextChange(
                                selectedTextImageBlock.blockId,
                                "buttonText",
                                e.target.value
                              );
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Button text..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {textImageActiveTab === "style" && (
              <div className="p-4 space-y-6">
                {/* Colors */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Colors
                    </h4>
                    <button className="text-xs text-blue-600 font-medium">
                      Change
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                    <span className="text-sm text-gray-600">Theme Colors</span>
                  </div>
                </div>

                {/* Background Image/Video Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Background image/video
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Layout */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Layout
                  </h4>
                </div>

                {/* Image Position */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Image position
                  </h5>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            flexDirection: "row",
                            textAlign: "left",
                          });
                        }
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                      title="Image left"
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
                          d="M4 6h16M4 12h8m-8 6h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            flexDirection: "column",
                            textAlign: "center",
                          });
                        }
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                      title="Image center"
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
                          d="M4 6h16M8 12h8M4 18h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            flexDirection: "row-reverse",
                            textAlign: "right",
                          });
                        }
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                      title="Image right"
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
                          d="M4 6h16M12 12h8M4 18h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            flexDirection: "column",
                            textAlign: "center",
                            width: "100%",
                          });
                        }
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                      title="Full width"
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
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content Alignment */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    Content alignment
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            textAlign: "left",
                          });
                        }
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                      title="Left align"
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
                          d="M4 6h16M4 12h8M4 18h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            textAlign: "center",
                          });
                        }
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                      title="Center align"
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
                          d="M4 6h16M8 12h8M4 18h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            textAlign: "right",
                          });
                        }
                      }}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
                      title="Right align"
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
                          d="M4 6h16M12 12h8M4 18h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Invert Image and Content on Mobile */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Invert image and content on mobile
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      onChange={(e) => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            flexDirection: e.target.checked
                              ? "column-reverse"
                              : "column",
                          });
                        }
                      }}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Borderless Image */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Borderless image
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                      onChange={(e) => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            borderRadius: e.target.checked ? "0" : "12px",
                            boxShadow: e.target.checked
                              ? "none"
                              : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          });
                        }
                      }}
                    />
                    <div className="w-9 h-5 bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Image Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Image
                  </h4>

                  {/* Image Fit */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image fit
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              objectFit: e.target.value,
                            });
                          }
                        }}
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

                  {/* Aspect Ratio */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aspect ratio
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              aspectRatio: e.target.value,
                            });
                          }
                        }}
                      >
                        <option value="3/2">3:2 - landscape</option>
                        <option value="1/1">1:1 - square</option>
                        <option value="2/3">2:3 - portrait</option>
                        <option value="16/9">16:9 - widescreen</option>
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

                  {/* Rounded Corners */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rounded corners
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            const radiusMap = {
                              none: "0",
                              small: "4px",
                              medium: "8px",
                              large: "16px",
                            };
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              borderRadius:
                                radiusMap[
                                  e.target.value as keyof typeof radiusMap
                                ] || "0",
                            });
                          }
                        }}
                      >
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
                </div>

                {/* Animations */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animations
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    The animation style for how section elements appear
                  </p>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      onChange={(e) => {
                        if (selectedTextImageBlock) {
                          applyStyleToBlock(selectedTextImageBlock.blockId, {
                            animation: e.target.value,
                          });
                        }
                      }}
                    >
                      <option value="slideInUp 0.6s ease-out">
                        From theme (Slide up)
                      </option>
                      <option value="fadeIn 0.6s ease-out">Fade in</option>
                      <option value="slideInLeft 0.6s ease-out">
                        Slide left
                      </option>
                      <option value="slideInRight 0.6s ease-out">
                        Slide right
                      </option>
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Spacing
                  </h4>

                  {/* Top */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            const spacingMap = {
                              none: "0",
                              small: "20px",
                              medium: "40px",
                              large: "80px",
                              "extra-large": "120px",
                            };
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              paddingTop:
                                spacingMap[
                                  e.target.value as keyof typeof spacingMap
                                ] || "80px",
                            });
                          }
                        }}
                      >
                        <option value="large">Large</option>
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="extra-large">Extra Large</option>
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bottom
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            const spacingMap = {
                              none: "0",
                              small: "20px",
                              medium: "40px",
                              large: "80px",
                              "extra-large": "120px",
                            };
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              paddingBottom:
                                spacingMap[
                                  e.target.value as keyof typeof spacingMap
                                ] || "80px",
                            });
                          }
                        }}
                      >
                        <option value="large">Large</option>
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="extra-large">Extra Large</option>
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

                  {/* Min Height */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min. height
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (selectedTextImageBlock) {
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              minHeight: "auto",
                            });
                          }
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-blue-50 border-blue-300 text-blue-700 transition-colors"
                      >
                        Content
                      </button>
                      <button
                        onClick={() => {
                          if (selectedTextImageBlock) {
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              minHeight: "100vh",
                            });
                          }
                        }}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Screen
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      Divider
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              borderTop: e.target.checked
                                ? "1px solid #e5e7eb"
                                : "none",
                              borderBottom: e.target.checked
                                ? "1px solid #e5e7eb"
                                : "none",
                            });
                          }
                        }}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Border */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Border
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        onChange={(e) => {
                          if (selectedTextImageBlock) {
                            applyStyleToBlock(selectedTextImageBlock.blockId, {
                              border: e.target.checked
                                ? "2px solid #e5e7eb"
                                : "none",
                              borderRadius: e.target.checked ? "12px" : "0",
                            });
                          }
                        }}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Panel */}
      {showEditPanel && selectedElement && !isPreviewMode && (
        <div
          className="fixed bg-white shadow-xl border border-gray-200 z-50"
          style={{
            right: "20px",
            top: "80px",
            width: "320px",
            height: "calc(100vh - 100px)",
            borderRadius: "12px",
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowEditPanel(false);
                  setSelectedElement(null);
                }}
                className="text-gray-600 hover:text-gray-800"
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
              <h3 className="text-lg font-semibold text-gray-900">
                Edit {selectedElement?.elementType}
              </h3>
            </div>
            <button className="text-blue-600 text-sm font-medium">Done</button>
          </div>
          <div
            className="p-4 overflow-y-auto"
            style={{ height: "calc(100% - 73px)" }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Element Type: {selectedElement?.elementType}
                </label>
                <p className="text-sm text-gray-500">
                  Field: {selectedElement?.field}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove old section selector */}
    </div>
  );
}
