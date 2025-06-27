import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subdomain, projectId, theme, content, businessInfo } = body;

    // Log the website data (in a real app, you'd save to database)
    console.log("Saving website:", {
      name,
      subdomain,
      projectId,
      theme,
      contentBlocks: content?.length || 0,
      businessInfo,
    });

    // For now, return success (you can integrate with your actual database later)
    const websiteData = {
      id: `website-${Date.now()}`,
      name,
      subdomain,
      projectId,
      theme,
      content,
      businessInfo,
      createdAt: new Date().toISOString(),
      status: "published",
    };

    return NextResponse.json({
      success: true,
      website: websiteData,
      message: "Website saved successfully",
    });
  } catch (error) {
    console.error("Error saving website:", error);
    return NextResponse.json(
      { error: "Failed to save website" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Websites API endpoint",
    endpoints: {
      POST: "Create/save a website",
      GET: "Get website information",
    },
  });
}
