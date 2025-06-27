"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Palette,
  FileText,
  Plus,
  HelpCircle,
  Eye,
  Globe,
  ArrowUp,
  ArrowDown,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Types for our content blocks
interface ContentBlock {
  id: string;
  type:
    | "hero"
    | "text"
    | "image"
    | "gallery"
    | "testimonial"
    | "contact"
    | "cta";
  content: Record<string, unknown>;
  styles: Record<string, unknown>;
}

interface Website {
  id: string;
  title: string;
  blocks: ContentBlock[];
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
}

export default function WebsiteBuilder() {
  const { isLoaded, isSignedIn } = useUser();
  const [website, setWebsite] = useState<Website>({
    id: "sample-website",
    title: "Your Business Website",
    blocks: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          title: "Welcome to Your Business",
          subtitle:
            "Professional services tailored to your needs. We deliver excellence and quality in everything we do.",
          buttonText: "Get Started",
          backgroundImage: "/api/placeholder/1200/600",
        },
        styles: {
          textAlign: "center",
          overlay: "dark",
          height: "600px",
        },
      },
      {
        id: "text-1",
        type: "text",
        content: {
          text: "We are dedicated to providing exceptional services that meet your unique requirements. Our team of professionals is committed to delivering results that exceed your expectations and help your business thrive.",
        },
        styles: {
          fontSize: "18px",
          lineHeight: "1.8",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "60px 20px",
        },
      },
      {
        id: "cta-1",
        type: "cta",
        content: {
          title: "Ready to Get Started?",
          subtitle:
            "Contact us today to learn more about how we can help your business succeed.",
          buttonText: "Contact Us",
        },
        styles: {
          backgroundColor: "#1f2937",
          color: "white",
          padding: "80px 20px",
          textAlign: "center",
        },
      },
    ],
    theme: {
      colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#f59e0b",
        background: "#ffffff",
        text: "#1f2937",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
    },
  });

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

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = "/";
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    setWebsite((prev) => ({
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
    }));
  };

  const addSection = (type: ContentBlock["type"], afterBlockId?: string) => {
    const newBlock: ContentBlock = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };

    setWebsite((prev) => {
      const blocks = [...prev.blocks];
      if (afterBlockId) {
        const index = blocks.findIndex((b) => b.id === afterBlockId);
        blocks.splice(index + 1, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }
      return { ...prev, blocks };
    });

    setShowSectionSelector(false);
    setSectionSelectorPosition(null);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    setWebsite((prev) => {
      const blocks = [...prev.blocks];
      const index = blocks.findIndex((b) => b.id === blockId);

      if (direction === "up" && index > 0) {
        [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
      } else if (direction === "down" && index < blocks.length - 1) {
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      }

      return { ...prev, blocks };
    });
  };

  const deleteBlock = (blockId: string) => {
    setWebsite((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== blockId),
    }));
    setSelectedBlock(null);
    setShowFloatingActions(false);
  };

  const generateAIContent = async (blockId: string) => {
    // AI content generation will be implemented with Groq API
    console.log("Generating AI content for block:", blockId);
    // Placeholder for now
  };

  const regenerateImages = async (blockId: string) => {
    // Image regeneration with AI/Pexels API
    console.log("Regenerating images for block:", blockId);
    // Placeholder for now
  };

  const getDefaultContent = (type: ContentBlock["type"]) => {
    switch (type) {
      case "hero":
        return {
          title: "Your Amazing Title",
          subtitle: "Describe your business in a compelling way",
          buttonText: "Get Started",
          backgroundImage: "/api/placeholder/1200/600",
        };
      case "text":
        return {
          text: "Add your content here. Double-click to edit this text and make it your own.",
        };
      case "image":
        return {
          src: "/api/placeholder/800/400",
          alt: "Description",
          caption: "",
        };
      case "gallery":
        return {
          images: [
            "/api/placeholder/400/300",
            "/api/placeholder/400/300",
            "/api/placeholder/400/300",
          ],
        };
      case "testimonial":
        return {
          quote: "This service exceeded my expectations!",
          author: "John Doe",
          company: "Company Name",
          avatar: "/api/placeholder/80/80",
        };
      case "contact":
        return {
          title: "Get In Touch",
          subtitle: "We'd love to hear from you",
          fields: ["name", "email", "message"],
        };
      case "cta":
        return {
          title: "Ready to Get Started?",
          subtitle: "Join thousands of satisfied customers",
          buttonText: "Start Now",
        };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: ContentBlock["type"]) => {
    switch (type) {
      case "hero":
        return {
          height: "600px",
          textAlign: "center",
          overlay: "dark",
        };
      case "text":
        return {
          fontSize: "16px",
          lineHeight: "1.6",
          padding: "40px 20px",
          maxWidth: "800px",
          margin: "0 auto",
        };
      case "gallery":
        return {
          columns: 3,
          gap: "20px",
          padding: "40px 20px",
        };
      default:
        return {
          padding: "40px 20px",
        };
    }
  };

  const renderBlock = (block: ContentBlock) => {
    const isSelected = selectedBlock === block.id;
    const baseClasses = `relative transition-all duration-200 ${
      !isPreviewMode ? "cursor-pointer hover:shadow-lg" : ""
    } ${
      isSelected && !isPreviewMode ? "ring-2 ring-blue-500 ring-offset-2" : ""
    }`;

    switch (block.type) {
      case "hero":
        return (
          <div
            key={block.id}
            className={baseClasses}
            onClick={(e) => handleBlockClick(block.id, e)}
            style={{
              height: block.styles.height as string,
              backgroundImage: `url(${
                block.content.backgroundImage as string
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-4">
                <h1
                  className="text-4xl md:text-6xl font-bold mb-6"
                  onDoubleClick={() => handleTextDoubleClick(block.id, "title")}
                >
                  {editingText === `${block.id}-title` ? (
                    <input
                      type="text"
                      value={block.content.title as string}
                      onChange={(e) =>
                        handleTextChange(block.id, "title", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setEditingText(null)
                      }
                      className="bg-transparent border-b-2 border-white text-white text-center outline-none"
                      autoFocus
                    />
                  ) : (
                    (block.content.title as string)
                  )}
                </h1>
                <p
                  className="text-xl mb-8 opacity-90"
                  onDoubleClick={() =>
                    handleTextDoubleClick(block.id, "subtitle")
                  }
                >
                  {editingText === `${block.id}-subtitle` ? (
                    <textarea
                      value={block.content.subtitle as string}
                      onChange={(e) =>
                        handleTextChange(block.id, "subtitle", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      className="bg-transparent border-b-2 border-white text-white text-center outline-none resize-none w-full"
                      autoFocus
                    />
                  ) : (
                    (block.content.subtitle as string)
                  )}
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  onDoubleClick={() =>
                    handleTextDoubleClick(block.id, "buttonText")
                  }
                >
                  {editingText === `${block.id}-buttonText` ? (
                    <input
                      type="text"
                      value={block.content.buttonText as string}
                      onChange={(e) =>
                        handleTextChange(block.id, "buttonText", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setEditingText(null)
                      }
                      className="bg-transparent text-white text-center outline-none"
                      autoFocus
                    />
                  ) : (
                    (block.content.buttonText as string)
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case "text":
        return (
          <div
            key={block.id}
            className={baseClasses}
            onClick={(e) => handleBlockClick(block.id, e)}
            style={block.styles as React.CSSProperties}
          >
            <div className="container mx-auto">
              <p
                className="text-gray-700 leading-relaxed"
                onDoubleClick={() => handleTextDoubleClick(block.id, "text")}
                style={{
                  fontSize: block.styles.fontSize as string,
                  lineHeight: block.styles.lineHeight as string,
                }}
              >
                {editingText === `${block.id}-text` ? (
                  <textarea
                    value={block.content.text as string}
                    onChange={(e) =>
                      handleTextChange(block.id, "text", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    className="w-full border-2 border-blue-500 rounded p-4 outline-none resize-none min-h-[120px]"
                    autoFocus
                  />
                ) : (
                  (block.content.text as string)
                )}
              </p>
            </div>
          </div>
        );

      case "gallery":
        return (
          <div
            key={block.id}
            className={baseClasses}
            onClick={(e) => handleBlockClick(block.id, e)}
            style={block.styles as React.CSSProperties}
          >
            <div className="container mx-auto">
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${
                    block.styles.columns as number
                  }, 1fr)`,
                  gap: block.styles.gap as string,
                }}
              >
                {(block.content.images as string[]).map(
                  (image: string, index: number) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg"
                    >
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case "image":
        return (
          <div
            key={block.id}
            className={baseClasses}
            onClick={(e) => handleBlockClick(block.id, e)}
            style={block.styles as React.CSSProperties}
          >
            <div className="container mx-auto text-center">
              <img
                src={block.content.src as string}
                alt={block.content.alt as string}
                className="max-w-full h-auto rounded-lg mx-auto"
              />
              {block.content.caption &&
              typeof block.content.caption === "string" ? (
                <p
                  className="mt-4 text-gray-600 text-sm"
                  onDoubleClick={() =>
                    handleTextDoubleClick(block.id, "caption")
                  }
                >
                  {editingText === `${block.id}-caption` ? (
                    <input
                      type="text"
                      value={block.content.caption as string}
                      onChange={(e) =>
                        handleTextChange(block.id, "caption", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setEditingText(null)
                      }
                      className="bg-transparent border-b-2 border-gray-300 text-center outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    (block.content.caption as string)
                  )}
                </p>
              ) : null}
            </div>
          </div>
        );

      case "testimonial":
        return (
          <div
            key={block.id}
            className={baseClasses}
            onClick={(e) => handleBlockClick(block.id, e)}
            style={block.styles as React.CSSProperties}
          >
            <div className="container mx-auto max-w-4xl text-center">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <blockquote
                  className="text-xl text-gray-700 mb-6 italic"
                  onDoubleClick={() => handleTextDoubleClick(block.id, "quote")}
                >
                  &quot;
                  {editingText === `${block.id}-quote` ? (
                    <textarea
                      value={block.content.quote as string}
                      onChange={(e) =>
                        handleTextChange(block.id, "quote", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      className="border-2 border-blue-500 rounded p-4 outline-none resize-none w-full"
                      autoFocus
                    />
                  ) : (
                    (block.content.quote as string)
                  )}
                  &quot;
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={block.content.avatar as string}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="text-left">
                    <p
                      className="font-semibold text-gray-900"
                      onDoubleClick={() =>
                        handleTextDoubleClick(block.id, "author")
                      }
                    >
                      {editingText === `${block.id}-author` ? (
                        <input
                          type="text"
                          value={block.content.author as string}
                          onChange={(e) =>
                            handleTextChange(block.id, "author", e.target.value)
                          }
                          onBlur={() => setEditingText(null)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setEditingText(null)
                          }
                          className="border-b-2 border-gray-300 outline-none"
                          autoFocus
                        />
                      ) : (
                        (block.content.author as string)
                      )}
                    </p>
                    <p
                      className="text-sm text-gray-500"
                      onDoubleClick={() =>
                        handleTextDoubleClick(block.id, "company")
                      }
                    >
                      {editingText === `${block.id}-company` ? (
                        <input
                          type="text"
                          value={block.content.company as string}
                          onChange={(e) =>
                            handleTextChange(
                              block.id,
                              "company",
                              e.target.value
                            )
                          }
                          onBlur={() => setEditingText(null)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setEditingText(null)
                          }
                          className="border-b-2 border-gray-300 outline-none"
                          autoFocus
                        />
                      ) : (
                        (block.content.company as string)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div
            key={block.id}
            className={baseClasses}
            onClick={(e) => handleBlockClick(block.id, e)}
            style={block.styles as React.CSSProperties}
          >
            <div className="container mx-auto max-w-2xl">
              <div className="text-center mb-8">
                <h2
                  className="text-3xl font-bold text-gray-900 mb-4"
                  onDoubleClick={() => handleTextDoubleClick(block.id, "title")}
                >
                  {editingText === `${block.id}-title` ? (
                    <input
                      type="text"
                      value={block.content.title as string}
                      onChange={(e) =>
                        handleTextChange(block.id, "title", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setEditingText(null)
                      }
                      className="border-b-2 border-gray-300 text-center outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    (block.content.title as string)
                  )}
                </h2>
                <p
                  className="text-gray-600"
                  onDoubleClick={() =>
                    handleTextDoubleClick(block.id, "subtitle")
                  }
                >
                  {editingText === `${block.id}-subtitle` ? (
                    <input
                      type="text"
                      value={block.content.subtitle as string}
                      onChange={(e) =>
                        handleTextChange(block.id, "subtitle", e.target.value)
                      }
                      onBlur={() => setEditingText(null)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setEditingText(null)
                      }
                      className="border-b-2 border-gray-300 text-center outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    (block.content.subtitle as string)
                  )}
                </p>
              </div>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        );

      case "cta":
        return (
          <div
            key={block.id}
            className={baseClasses}
            onClick={(e) => handleBlockClick(block.id, e)}
            style={block.styles as React.CSSProperties}
          >
            <div className="container mx-auto text-center">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                onDoubleClick={() => handleTextDoubleClick(block.id, "title")}
              >
                {editingText === `${block.id}-title` ? (
                  <input
                    type="text"
                    value={block.content.title as string}
                    onChange={(e) =>
                      handleTextChange(block.id, "title", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b-2 border-white text-white text-center outline-none"
                    autoFocus
                  />
                ) : (
                  (block.content.title as string)
                )}
              </h2>
              <p
                className="text-lg mb-8 opacity-90"
                onDoubleClick={() =>
                  handleTextDoubleClick(block.id, "subtitle")
                }
              >
                {editingText === `${block.id}-subtitle` ? (
                  <textarea
                    value={block.content.subtitle as string}
                    onChange={(e) =>
                      handleTextChange(block.id, "subtitle", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    className="bg-transparent border-b-2 border-white text-white text-center outline-none resize-none w-full"
                    autoFocus
                  />
                ) : (
                  (block.content.subtitle as string)
                )}
              </p>
              <button
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                onDoubleClick={() =>
                  handleTextDoubleClick(block.id, "buttonText")
                }
              >
                {editingText === `${block.id}-buttonText` ? (
                  <input
                    type="text"
                    value={block.content.buttonText as string}
                    onChange={(e) =>
                      handleTextChange(block.id, "buttonText", e.target.value)
                    }
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent text-gray-900 text-center outline-none"
                    autoFocus
                  />
                ) : (
                  (block.content.buttonText as string)
                )}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div
            key={block.id}
            className={baseClasses}
            onClick={(e) => handleBlockClick(block.id, e)}
          >
            <div className="p-8 text-center text-gray-500">
              Content block type: {block.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Navigation */}
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <button className="flex items-center space-x-2 text-blue-600 font-medium">
                <Palette className="h-4 w-4" />
                <span className="text-sm">Customize</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Pages</span>
              </button>
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowSectionSelector(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm">Help</span>
              </button>
            </div>

            {/* Center - Website Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {website.title}
              </h1>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
              <Button
                size="sm"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Globe className="h-4 w-4" />
                <span>Publish</span>
              </Button>
            </div>
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
        {website.blocks.map((block) => (
          <div key={block.id} className="relative">
            {renderBlock(block)}

            {/* Add Section Button */}
            {!isPreviewMode && (
              <div className="flex justify-center py-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSectionSelectorPosition(block.id);
                    setShowSectionSelector(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add section</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Action Buttons */}
      {showFloatingActions && selectedBlock && !isPreviewMode && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex space-x-2"
          style={{
            left: floatingActionsPosition.x,
            top: floatingActionsPosition.y,
          }}
        >
          <button
            onClick={() => {
              const block = website.blocks.find((b) => b.id === selectedBlock);
              if (block) generateAIContent(selectedBlock);
            }}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            title="Restyle"
          >
            <Palette className="h-4 w-4" />
          </button>
          <button
            onClick={() => regenerateImages(selectedBlock)}
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

      {/* Preview Mode Overlay */}
      {isPreviewMode && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <span className="text-sm font-medium">
            Preview Mode - Click &quot;Preview&quot; to exit
          </span>
        </div>
      )}

      {/* Section Type Selector Modal */}
      {showSectionSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Section
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  addSection("hero", sectionSelectorPosition || undefined)
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">Hero</div>
                <div className="text-xs text-gray-500 mt-1">
                  Large banner section
                </div>
              </button>
              <button
                onClick={() =>
                  addSection("text", sectionSelectorPosition || undefined)
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">Text</div>
                <div className="text-xs text-gray-500 mt-1">
                  Paragraph content
                </div>
              </button>
              <button
                onClick={() =>
                  addSection("image", sectionSelectorPosition || undefined)
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">Image</div>
                <div className="text-xs text-gray-500 mt-1">Single image</div>
              </button>
              <button
                onClick={() =>
                  addSection("gallery", sectionSelectorPosition || undefined)
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">Gallery</div>
                <div className="text-xs text-gray-500 mt-1">Image grid</div>
              </button>
              <button
                onClick={() =>
                  addSection(
                    "testimonial",
                    sectionSelectorPosition || undefined
                  )
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">
                  Testimonial
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Customer review
                </div>
              </button>
              <button
                onClick={() =>
                  addSection("contact", sectionSelectorPosition || undefined)
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">Contact</div>
                <div className="text-xs text-gray-500 mt-1">Contact form</div>
              </button>
              <button
                onClick={() =>
                  addSection("cta", sectionSelectorPosition || undefined)
                }
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-sm font-medium text-gray-900">
                  Call to Action
                </div>
                <div className="text-xs text-gray-500 mt-1">Action button</div>
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowSectionSelector(false);
                  setSectionSelectorPosition(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
