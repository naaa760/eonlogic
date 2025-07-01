import { NextRequest, NextResponse } from "next/server";

interface BusinessInfo {
  name: string;
  type: string;
  location: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessInfo } = body;

    // Proxy to backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

    const response = await fetch(`${backendUrl}/api/ai/generate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "page",
        topic: `${businessInfo?.type || "business"} content`,
        tone: "professional",
        length: "medium",
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    // If backend returns the expected format, use it
    if (data.success && data.data) {
      return NextResponse.json({ content: data.data });
    }

    // Otherwise, return fallback content
    return NextResponse.json({ content: getFallbackContent(businessInfo) });
  } catch (error) {
    console.error("Error generating content:", error);

    // Return fallback content instead of error
    const body = await request.json().catch(() => ({}));
    const fallbackContent = getFallbackContent(body?.businessInfo);
    return NextResponse.json({ content: fallbackContent });
  }
}

function getFallbackContent(businessInfo: BusinessInfo) {
  if (!businessInfo) {
    businessInfo = {
      name: "Your Business",
      type: "Business",
      location: "Your Location",
    };
  }

  return {
    hero: {
      title: `Welcome to ${businessInfo.name}`,
      subtitle: `Professional ${businessInfo.type} services in ${businessInfo.location}. We deliver excellence and innovation to help your business succeed.`,
      buttonText: "Get Started Today",
    },
    about: {
      title: `About ${businessInfo.name}`,
      description: `We are a leading ${businessInfo.type} company based in ${businessInfo.location}. Our team is dedicated to providing exceptional services that meet your unique requirements and exceed your expectations.`,
      highlights: ["Expert Team", "Quality Service", "Customer Focused"],
    },
    services: {
      title: "Our Services",
      subtitle: `Comprehensive ${businessInfo.type} solutions tailored to your needs`,
      items: [
        {
          title: "Consulting",
          description: `Expert ${businessInfo.type} consulting to guide your business forward`,
          icon: "🎯",
        },
        {
          title: "Implementation",
          description: `Professional implementation of ${businessInfo.type} solutions`,
          icon: "⚡",
        },
        {
          title: "Support",
          description: `Ongoing support and maintenance for your ${businessInfo.type} needs`,
          icon: "🛠️",
        },
      ],
    },
    features: {
      title: "Why Choose Us",
      subtitle: "What sets us apart in the industry",
      items: [
        {
          title: "Experience",
          description: "Years of expertise in the industry",
          icon: "⭐",
        },
        {
          title: "Quality",
          description: "Commitment to delivering the highest quality",
          icon: "🏆",
        },
        {
          title: "Innovation",
          description: "Cutting-edge solutions and approaches",
          icon: "💡",
        },
        {
          title: "Support",
          description: "24/7 customer support and assistance",
          icon: "🤝",
        },
      ],
    },
    contact: {
      title: "Get In Touch",
      subtitle: `Ready to get started? Contact us today to learn more about our ${businessInfo.type} services.`,
    },
    cta: {
      title: "Ready to Get Started?",
      subtitle: `Contact us today to discuss your ${businessInfo.type} needs`,
      buttonText: "Contact Us Now",
    },
  };
}
