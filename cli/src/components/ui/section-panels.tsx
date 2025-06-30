"use client";

import React from "react";

import { FileText, Settings, Sparkles, Image as RefreshCw } from "lucide-react";

interface SectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  activeTab: "content" | "style";
  onTabChange: (tab: "content" | "style") => void;
  blockContent: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
  };
  onContentChange: (field: string, value: string) => void;
  onStyleChange: (styles: Record<string, string>) => void;
  onRegenerateContent: (contentType: string) => void;
}

export function SectionPanel({
  isOpen,
  onClose,
  sectionType,
  activeTab,
  onTabChange,
  blockContent,
  onContentChange,
  onStyleChange,
  onRegenerateContent,
}: SectionPanelProps) {
  if (!isOpen) return null;

  const sectionTitles = {
    services: "Services Section",
    about: "About Section",
    testimonials: "Testimonials Section",
    contact: "Contact Section",
    features: "Features Section",
    gallery: "Gallery Section",
    cta: "Call-to-Action Section",
    hero: "Hero Section",
  };

  const colorPresets = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Green", value: "#10B981" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Pink", value: "#EC4899" },
  ];

  return (
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
            onClick={onClose}
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
            {sectionTitles[sectionType as keyof typeof sectionTitles] ||
              "Section Settings"}
          </h3>
        </div>
        <button onClick={onClose} className="text-blue-600 text-sm font-medium">
          Done
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => onTabChange("content")}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
            activeTab === "content"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1">
            <FileText className="w-4 h-4" />
            Content
          </span>
        </button>
        <button
          onClick={() => onTabChange("style")}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
            activeTab === "style"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1">
            <Settings className="w-4 h-4" />
            Style
          </span>
        </button>
      </div>

      {/* Panel Content */}
      <div className="overflow-y-auto" style={{ height: "calc(100% - 120px)" }}>
        {activeTab === "content" && (
          <div className="p-4 space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={blockContent?.title || ""}
                  onChange={(e) => onContentChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter section title..."
                />
                <button
                  onClick={() => onRegenerateContent("title")}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Title
                </button>
              </div>
            </div>

            {/* Subtitle Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={blockContent?.subtitle || ""}
                  onChange={(e) => onContentChange("subtitle", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter section subtitle..."
                />
                <button
                  onClick={() => onRegenerateContent("subtitle")}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Subtitle
                </button>
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="space-y-2">
                <textarea
                  value={blockContent?.description || ""}
                  onChange={(e) =>
                    onContentChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter section description..."
                />
                <button
                  onClick={() => onRegenerateContent("description")}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Description
                </button>
              </div>
            </div>

            {/* Button Text Field (for applicable sections) */}
            {(sectionType === "hero" || sectionType === "cta") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={blockContent?.buttonText || ""}
                    onChange={(e) =>
                      onContentChange("buttonText", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter button text..."
                  />
                  <button
                    onClick={() => onRegenerateContent("buttonText")}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate Button Text
                  </button>
                </div>
              </div>
            )}

            {/* Regenerate All Content */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => onRegenerateContent("all")}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate All Content
              </button>
            </div>
          </div>
        )}

        {activeTab === "style" && (
          <div className="p-4 space-y-6">
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Background Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color.name}
                    onClick={() =>
                      onStyleChange({ backgroundColor: color.value })
                    }
                    className="w-full h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors flex items-center justify-center text-xs font-medium text-white shadow-sm"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Text Alignment
              </label>
              <div className="flex space-x-2">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    onClick={() => onStyleChange({ textAlign: align })}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors capitalize"
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Padding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Padding
              </label>
              <div className="flex space-x-2">
                {["40px 0", "60px 0", "80px 0", "100px 0"].map((padding) => (
                  <button
                    key={padding}
                    onClick={() => onStyleChange({ padding })}
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {padding === "40px 0"
                      ? "Small"
                      : padding === "60px 0"
                      ? "Medium"
                      : padding === "80px 0"
                      ? "Large"
                      : "XL"}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => onStyleChange({ animation: e.target.value })}
              >
                <option value="fadeIn">Fade In</option>
                <option value="slideInUp">Slide In Up</option>
                <option value="slideInLeft">Slide In Left</option>
                <option value="slideInRight">Slide In Right</option>
                <option value="scaleIn">Scale In</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
