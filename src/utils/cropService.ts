const BASE = "https://www.iita.org/wp-json/wp/v2";

// YouTube config
const YT_KEY = "AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg";
const YT_CHANNEL_ID = "UCWOAtXUd8F-MCx2-AfBE_8A";

// ─── Generic WP REST fetcher ──────────────────────────────────────────────────
export const wpFetch = async <T = unknown>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): Promise<T[]> => {
  const query = new URLSearchParams({
    per_page: "10",
    _embed: "true",
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  }).toString();

  const url = `${BASE}/${endpoint}?${query}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`${endpoint} fetch failed: ${res.status}`);
  }

  const data: unknown = await res.json();

  // Normalize response safely
  if (Array.isArray(data)) return data as T[];

  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as any).items)
  ) {
    return (data as { items: T[] }).items;
  }

  if (data && typeof data === "object") {
    return Object.values(data) as T[];
  }

  return [];
};

// ─── Image extractor ──────────────────────────────────────────────────────────
export const getItemImage = (item: unknown): string => {
  if (!item || typeof item !== "object") {
    return "https://iita.org/wp-content/uploads/2016/06/IITA-default.jpg";
  }

  const obj = item as any;

  // 1. _embedded featured media
  const embedded = obj?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  if (typeof embedded === "string") return embedded;

  // 2. ACF fields
  const acf = obj?.acf;
  if (acf && typeof acf === "object") {
    const candidates = [
      acf.thumbnail,
      acf.image,
      acf.cover_image,
      acf.document_thumbnail,
      acf.tool_logo,
      acf.event_image,
      acf.project_image,
    ];

    const found = candidates.find(
      (c) => typeof c === "string" && c.startsWith("http")
    );
    if (found) return found;

    const objCandidate = candidates.find(
      (c) => c && typeof c === "object" && "url" in c
    ) as { url?: string } | undefined;

    if (objCandidate?.url) return objCandidate.url;
  }

  // 3. meta fields
  const meta = obj?.meta ?? obj?.metadata;
  if (meta && typeof meta === "object") {
    for (const key of Object.keys(meta)) {
      const value = Array.isArray(meta[key]) ? meta[key][0] : meta[key];

      if (
        typeof value === "string" &&
        value.startsWith("http") &&
        /\.(jpg|jpeg|png|webp|gif)/i.test(value)
      ) {
        return value;
      }
    }
  }

  // 4. fallback
  return "https://iita.org/wp-content/uploads/2016/06/IITA-default.jpg";
};

// ─── Public API ───────────────────────────────────────────────────────────────

// You can optionally pass a type when calling these:
// fetchCropNews<MyType>()

export const fetchCropNews = <T = unknown>(cropKey: string, page = 1) =>
  wpFetch<T>("news-item", { search: cropKey, page });

export const fetchCropPublications = <T = unknown>(cropKey: string, page = 1) =>
  wpFetch<T>("iitadocument", { search: cropKey, page });

export const fetchCropDigitalTools = <T = unknown>(cropKey: string, page = 1) =>
  wpFetch<T>("iita-digital-tools", { search: cropKey, page });

export const fetchCropEvents = <T = unknown>(cropKey: string, page = 1) =>
  wpFetch<T>("ajde_events", { search: cropKey, page });

export const fetchCropProjects = <T = unknown>(cropKey: string, page = 1) =>
  wpFetch<T>("iita-project", { search: cropKey, page });

export const fetchCropFeatured = <T = unknown>(cropKey: string, page = 1) =>
  wpFetch<T>("featured-post", { search: cropKey, page });

export const fetchCropPictures = <T = unknown>(cropKey: string, page = 1) =>
  wpFetch<T>("media", {
    search: cropKey,
    page,
    media_type: "image",
  });

// ─── YouTube API ──────────────────────────────────────────────────────────────

type YouTubeSearchResponse<T = unknown> = {
  items: T[];
  nextPageToken: string | null;
};

export const fetchCropVideos = async <T = unknown>(
  cropKey: string,
  pageToken = ""
): Promise<YouTubeSearchResponse<T>> => {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${YT_CHANNEL_ID}&q=${encodeURIComponent(
    cropKey
  )}&part=snippet&maxResults=10&type=video${
    pageToken ? `&pageToken=${pageToken}` : ""
  }`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`YouTube fetch failed: ${res.status}`);
  }

  const data: any = await res.json();

  return {
    items: (data.items || []).filter(
      (v: any) =>
        v?.snippet?.title !== "Private video" &&
        v?.snippet?.title !== "Deleted video"
    ) as T[],
    nextPageToken: data.nextPageToken ?? null,
  };
};
