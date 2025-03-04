import type { InsertLandmark } from "@shared/schema";
import type { BoundingBox } from "@shared/schema";

interface WikipediaResponse {
  query: {
    geosearch: Array<{
      pageid: number;
      title: string;
      lat: number;
      lon: number;
    }>;
  };
}

interface WikipediaPageResponse {
  query: {
    pages: {
      [key: string]: {
        extract?: string;
        thumbnail?: {
          source: string;
        };
      };
    };
  };
}

// Helper function to handle fetch with timeout
async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchLandmarksInBoundingBox(bbox: BoundingBox): Promise<InsertLandmark[]> {
  const startTime = Date.now();
  console.log(`[Wikipedia API] Fetching landmarks for bbox: ${JSON.stringify(bbox)}`);

  try {
    // Fetch coordinates first
    const geoUrl = new URL("https://en.wikipedia.org/w/api.php");
    geoUrl.search = new URLSearchParams({
      action: "query",
      list: "geosearch",
      gsradius: "10000",
      gslimit: "50",
      format: "json",
      origin: "*",
      gscoord: `${(bbox.north + bbox.south) / 2}|${(bbox.east + bbox.west) / 2}`,
    }).toString();

    console.log(`[Wikipedia API] Fetching geosearch: ${geoUrl}`);
    const geoResponse = await fetchWithTimeout(geoUrl.toString());
    const geoData = (await geoResponse.json()) as WikipediaResponse;

    if (!geoData.query?.geosearch?.length) {
      console.log(`[Wikipedia API] No landmarks found in area. Time taken: ${Date.now() - startTime}ms`);
      return [];
    }

    // Fetch page details for each location
    const pageIds = geoData.query.geosearch.map(item => item.pageid).join("|");
    const detailsUrl = new URL("https://en.wikipedia.org/w/api.php");
    detailsUrl.search = new URLSearchParams({
      action: "query",
      pageids: pageIds,
      prop: "extracts|pageimages",
      exintro: "true",
      explaintext: "true",
      format: "json",
      origin: "*",
      pithumbsize: "400",
    }).toString();

    console.log(`[Wikipedia API] Fetching page details: ${detailsUrl}`);
    const detailsResponse = await fetchWithTimeout(detailsUrl.toString());
    const detailsData = (await detailsResponse.json()) as WikipediaPageResponse;

    const landmarks = geoData.query.geosearch.map(location => {
      const details = detailsData.query.pages[location.pageid.toString()];
      return {
        title: location.title,
        description: details.extract ? 
          (details.extract.length > 200 ? details.extract.slice(0, 197) + "..." : details.extract) : 
          "No description available",
        lat: location.lat.toString(),
        lng: location.lon.toString(),
        wikipediaId: location.title.replace(/ /g, "_"),
        thumbnail: details.thumbnail?.source || null,
      };
    });

    console.log(`[Wikipedia API] Successfully fetched ${landmarks.length} landmarks. Time taken: ${Date.now() - startTime}ms`);
    return landmarks;
  } catch (error) {
    console.error("[Wikipedia API] Error fetching landmarks:", error);
    console.log(`[Wikipedia API] Request failed. Time taken: ${Date.now() - startTime}ms`);
    return [];
  }
}