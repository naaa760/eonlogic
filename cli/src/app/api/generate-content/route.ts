import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface BusinessInfo {
  name: string;
  type: string;
  location: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, businessInfo } = body;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a professional website content generator. Create engaging, professional content for businesses. Always respond with valid JSON only, no additional text or formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 2048,
    });

    const generatedContent = chatCompletion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    // Parse the JSON response
    let content;
    try {
      content = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Return fallback content if parsing fails
      content = getFallbackContent(businessInfo);
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

function getFallbackContent(businessInfo: BusinessInfo) {
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
