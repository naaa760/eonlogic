import { NextRequest, NextResponse } from "next/server";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!PEXELS_API_KEY || PEXELS_API_KEY === "YOUR_PEXELS_API_KEY") {
      return NextResponse.json(
        { error: "PEXELS_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Fetch from Pexels API only - NO FALLBACKS
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error("Pexels API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch from Pexels API" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[0];
      return NextResponse.json({
        imageUrl: photo.src.large || photo.src.medium,
        photographer: photo.photographer,
        alt: photo.alt || query,
      });
    } else {
      return NextResponse.json(
        { error: `No images found for query: ${query}` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image from Pexels" },
      { status: 500 }
    );
  }
}
