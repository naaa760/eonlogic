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

    // Add randomization to get different images
    const randomPage = Math.floor(Math.random() * 10) + 1; // Random page 1-10
    const perPage = 15; // Get more results to choose from
    const randomIndex = Math.floor(Math.random() * perPage); // Random image from results

    console.log(
      `Fetching images: query="${query}", page=${randomPage}, selecting index=${randomIndex}`
    );

    // Fetch from Pexels API with randomization
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&per_page=${perPage}&page=${randomPage}&orientation=landscape`,
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
      // Select a random photo from the results, or fall back to first if index is out of range
      const photoIndex = Math.min(randomIndex, data.photos.length - 1);
      const photo = data.photos[photoIndex];

      console.log(
        `Selected photo ${photoIndex + 1} of ${data.photos.length} results`
      );

      return NextResponse.json({
        imageUrl: photo.src.large || photo.src.medium,
        photographer: photo.photographer,
        alt: photo.alt || query,
      });
    } else {
      // If no results on random page, try page 1
      console.log(`No results on page ${randomPage}, trying page 1`);

      const fallbackResponse = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          query
        )}&per_page=${perPage}&page=1&orientation=landscape`,
        {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        }
      );

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.photos && fallbackData.photos.length > 0) {
          const randomPhoto =
            fallbackData.photos[
              Math.floor(Math.random() * fallbackData.photos.length)
            ];
          return NextResponse.json({
            imageUrl: randomPhoto.src.large || randomPhoto.src.medium,
            photographer: randomPhoto.photographer,
            alt: randomPhoto.alt || query,
          });
        }
      }

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
