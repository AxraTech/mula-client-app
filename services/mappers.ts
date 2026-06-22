import { Artwork, Artist, Video, Article, Event } from "@/constants/data";

const BASE_URL = (process.env.EXPO_PUBLIC_MULA_URL ?? "").replace(/\/$/, "");

// Extract medium/category value from API item across many possible field shapes.
function pickMedium(item: any): string | null {
  const candidates = [
    item.medium_name,
    item.medium,
    item.art_medium,
    item.artwork_medium,
    item.medium?.name,
    item.medium?.title,
    item.technique,
    item.technique_name,
    item.technique?.name,
    item.style,
    item.style_name,
    item.style?.name,
    item.genre,
    item.genre_name,
    item.category?.name,
    item.category?.title,
    item.category_name,
    typeof item.category === "string" ? item.category : null,
    item.material,
    item.material_name,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i;
const IMAGE_KEYS = [
  "image_url",
  "artwork_image_url",
  "digital_artwork_image_url",
  "artist_profile_image_url",
  "artist_image_url",
  "product_image_url",
  "cover_image",
  "cover_image_url",
  "thumbnail_url",
  "thumbnail",
  "photo_url",
  "profile_image_url",
  "avatar_url",
  "avatar",
  "img_url",
  "image",
  "photo",
  "banner",
  "banner_url",
  "media_url",
  "file_url",
  "url",
  "src",
  "poster",
  "poster_url",
  "artwork_url",
  "digital_image",
  "artwork_image",
];

function toAbsolute(url: string): string {
  if (url.startsWith("http")) return url;
  if (url.startsWith("/") && BASE_URL) return `${BASE_URL}${url}`;
  return url;
}

function isImageUrl(url: string): boolean {
  return url.startsWith("http") || url.startsWith("/");
}

function extractUrlFromValue(val: any): string | null {
  if (typeof val === "string" && isImageUrl(val)) {
    return toAbsolute(val);
  }
  if (Array.isArray(val) && val.length > 0) {
    const first = val[0];
    if (typeof first === "string" && isImageUrl(first)) return toAbsolute(first);
    if (first && typeof first === "object") {
      for (const k of IMAGE_KEYS) {
        if (typeof first[k] === "string" && isImageUrl(first[k])) return toAbsolute(first[k]);
      }
    }
  }
  return null;
}

function resolveImage(item: any, fallbackIdx: number = 0): any {
  if (!item) return getFallback(fallbackIdx);

  // 1. Check well-known image field names first
  for (const key of IMAGE_KEYS) {
    const found = extractUrlFromValue(item[key]);
    if (found) return { uri: found };
  }

  // 2. Deep scan all top-level values
  for (const key of Object.keys(item)) {
    const val = item[key];
    if (typeof val === "string" && isImageUrl(val) && IMAGE_EXTENSIONS.test(val)) {
      return { uri: toAbsolute(val) };
    }
    // Check nested object
    if (val && typeof val === "object" && !Array.isArray(val)) {
      for (const innerKey of IMAGE_KEYS) {
        const found = extractUrlFromValue(val[innerKey]);
        if (found) return { uri: found };
      }
      for (const innerKey of Object.keys(val)) {
        const innerVal = val[innerKey];
        if (typeof innerVal === "string" && isImageUrl(innerVal) && IMAGE_EXTENSIONS.test(innerVal)) {
          return { uri: toAbsolute(innerVal) };
        }
      }
    }
    // Check array of objects or strings
    if (Array.isArray(val) && val.length > 0) {
      const found = extractUrlFromValue(val);
      if (found) return { uri: found };
    }
  }

  // 3. Last resort — any HTTP/relative string value that could be a URL
  for (const key of Object.keys(item)) {
    const val = item[key];
    if (typeof val === "string" && isImageUrl(val)) {
      return { uri: toAbsolute(val) };
    }
  }

  return getFallback(fallbackIdx);
}

function getFallback(idx: number) {
  const fallbacks = [
    require("../assets/images/art1.png"),
    require("../assets/images/art2.png"),
    require("../assets/images/art3.png"),
  ];
  return fallbacks[idx % fallbacks.length];
}

export function extractArray(res: any): any[] {
  if (Array.isArray(res)) return res;

  if (res && typeof res === "object") {
    const ARRAY_KEYS = [
      "data",
      "res",
      "result",
      "results",
      "items",
      "list",
      "records",
      "rows",
      "artworks",
      "artwork_list",
      "products",
      "product_list",
      "artists",
      "artist_list",
      "videos",
      "video_list",
      "articles",
      "article_list",
      "events",
      "event_list",
      "payload",
      "body",
      "content",
      "collection",
      "entries",
    ];

    for (const key of ARRAY_KEYS) {
      if (Array.isArray(res[key])) return res[key];
    }

    for (const key of ARRAY_KEYS) {
      if (res[key] && typeof res[key] === "object") {
        for (const innerKey of ARRAY_KEYS) {
          if (Array.isArray(res[key][innerKey])) return res[key][innerKey];
        }
      }
    }

    for (const key of Object.keys(res)) {
      if (Array.isArray(res[key]) && res[key].length > 0) return res[key];
    }
  }

  return [];
}

export function extractSingle(res: any): any {
  if (res && typeof res === "object" && !Array.isArray(res)) {
    const SINGLE_KEYS = ["article", "event", "artist", "artwork", "product", "data", "res", "result", "item", "record", "payload", "body"];
    for (const key of SINGLE_KEYS) {
      if (res[key] && typeof res[key] === "object" && !Array.isArray(res[key])) {
        return res[key];
      }
    }
    return res;
  }
  return res;
}

export function mapTraditionalArtwork(item: any, idx = 0): Artwork {
  const artworkId = item.id ?? item.artwork_id ?? item.traditional_artwork_id ?? item._id ?? "";
  return {
    id: String(artworkId),
    title:
      item.title ??
      item.name ??
      item.artwork_title ??
      item.artwork_name ??
      item.art_title ??
      item.art_name ??
      item.traditional_artwork_title ??
      item.traditional_artwork_name ??
      item.caption ??
      item.label ??
      item.heading ??
      item.subject ??
      "Untitled",
    artist:
      item.artist?.fullname ??
      item.artist?.name ??
      item.artist_name ??
      item.creator?.fullname ??
      item.created_by ??
      "Unknown Artist",
    artistId: String(
      item.artist?.id ?? item.fk_artist_id ?? item.artist_id ?? item.artist?.artist_id ?? ""
    ),
    type: "manual",
    medium: pickMedium(item) ?? "",
    year: Number(item.year ?? item.created_year ?? new Date().getFullYear()),
    dimensions: item.dimensions ?? item.size ?? item.artwork_size ?? "",
    price: Number(
      item.current_price ??
      item.update_price ??
      item.price ??
      item.selling_price ??
      item.amount ??
      item.artwork_price ??
      item.product_price ??
      item.cost ??
      item.value ??
      item.total ??
      item.price_amount ??
      item.sale_price ??
      item.unit_price ??
      item.list_price ??
      0
    ),
    currency: item.currency ?? item.price_currency ?? item.product_currency ?? "MMK",
    image: resolveImage(item, 0),
    description:
      item.description ??
      item.description_html ??
      item.about ??
      item.detail ??
      "",
    isSoldOut: !!(item.is_sold_out ?? item.sold_out ?? item.disabled ?? false),
    isLiked: false,
    category: item.category?.name ?? item.category_name ?? item.category ?? "Traditional",
  };
}

export function mapDigitalArtwork(item: any, idx = 0): Artwork {
  const artworkId = item.id ?? item.artwork_id ?? item.digital_artwork_id ?? item._id ?? "";
  return {
    id: String(artworkId),
    title:
      item.title ??
      item.name ??
      item.artwork_title ??
      item.artwork_name ??
      item.art_title ??
      item.art_name ??
      item.digital_artwork_title ??
      item.digital_artwork_name ??
      item.caption ??
      item.label ??
      item.heading ??
      item.subject ??
      "Untitled",
    artist:
      item.artist?.fullname ??
      item.artist?.name ??
      item.artist_name ??
      item.creator?.fullname ??
      "Unknown Artist",
    artistId: String(
      item.artist?.id ?? item.fk_artist_id ?? item.artist_id ?? ""
    ),
    type: "digital",
    medium: pickMedium(item) ?? "",
    year: Number(item.year ?? new Date().getFullYear()),
    dimensions: item.dimensions ?? item.resolution ?? "",
    price: Number(
      item.current_price ??
      item.update_price ??
      item.price ??
      item.selling_price ??
      item.amount ??
      item.artwork_price ??
      item.product_price ??
      item.cost ??
      item.value ??
      item.total ??
      item.price_amount ??
      item.sale_price ??
      item.unit_price ??
      item.list_price ??
      0
    ),
    currency: item.currency ?? item.price_currency ?? item.product_currency ?? "MMK",
    image: resolveImage(item, 1),
    description: item.description ?? item.description_html ?? item.about ?? "",
    isSoldOut: !!(item.is_sold_out ?? item.sold_out ?? item.disabled ?? false),
    isLiked: false,
    category: item.category?.name ?? item.category_name ?? item.category ?? "Digital",
  };
}

export function mapProduct(item: any, idx = 0): Artwork {
  const catName = (
    item.category?.name ??
    item.category_name ??
    item.category ??
    ""
  ).toLowerCase();
  const isDigital =
    catName.includes("digital") ||
    item.category_id === 2 ||
    item.is_digital === true;
  // Use the product ID from API
  const productId = item.id ?? item._id ?? "";
  return {
    id: String(productId),
    title: item.title ?? item.name ?? item.product_name ?? "Untitled",
    artist:
      item.artist?.fullname ??
      item.artist?.name ??
      item.artist_name ??
      item.brand_name ??
      "MULA",
    artistId: String(
      item.fk_artist_id ?? item.artist_id ?? item.artist?.id ?? ""
    ),
    type: isDigital ? "digital" : "manual",
    medium: item.medium ?? (isDigital ? "Digital Illustration" : "Oil Painting"),
    year: Number(item.year ?? new Date().getFullYear()),
    dimensions: item.dimensions ?? item.size ?? "",
    price: Number(item.price ?? item.selling_price ?? item.amount ?? 0),
    currency: item.currency ?? "MMK",
    image: resolveImage(item, 0),
    description: item.description_html ?? item.description ?? item.about ?? "",
    isSoldOut: !!(item.disabled ?? item.is_sold_out ?? item.sold_out ?? false),
    isLiked: false,
    category: item.category?.name ?? item.category_name ?? item.brand_name ?? "Product",
  };
}

export function mapArtist(item: any): Artist {
  const avatarUrl = resolveImage(item, 2);
  const rawBio = item.bio ?? item.biography ?? item.description ?? item.about ?? "";
  const bio = rawBio ? stripHtml(String(rawBio)) : "Myanmar artist";
  return {
    id: String(item.id ?? item.artist_id ?? item._id ?? ""),
    name: item.fullname ?? item.name ?? item.artist_name ?? "Unknown Artist",
    bio,
    avatar: avatarUrl,
    image: avatarUrl, // For backward compatibility
    thumbnail: avatarUrl,
    artworkCount:
      Number(item.artwork_count ?? item.artworkCount ?? item.total_artworks ?? 0),
    followers: Number(item.followers ?? item.follower_count ?? item.fans ?? 0),
    specialization: (() => {
      const raw =
        item.specialization ??
        item.medium ??
        item.specialty ??
        item.category?.name ??
        item.traditional_or_digital_preferred ??
        "";
      if (!raw) return "Fine Art";
      const s = String(raw).toLowerCase();
      if (s === "traditional" || s === "1" || s === "true") return "Traditional Art";
      if (s === "digital" || s === "0" || s === "false") return "Digital Art";
      return String(raw);
    })(),
  };
}

function formatDuration(input: any): string {
  if (input === undefined || input === null || input === "") return "0:00";
  const num = Number(input);
  if (!Number.isFinite(num)) {
    // already a string like "3:45"
    return String(input);
  }
  // duration_minute can be either total minutes (e.g. 3.5) or seconds. Treat as minutes.
  const totalSeconds = Math.round(num * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function mapVideo(item: any): Video {
  const traditionalRaw =
    item.is_traditional ??
    item.isTraditional ??
    item.traditional ??
    item.creator?.is_traditional;
  const isTraditional =
    traditionalRaw === undefined || traditionalRaw === null
      ? undefined
      : traditionalRaw === true ||
        traditionalRaw === "true" ||
        traditionalRaw === 1 ||
        traditionalRaw === "1";

  return {
    id: String(item.id ?? item.video_id ?? item._id ?? ""),
    title:
      item.video_name ??
      item.title ??
      item.video_title ??
      item.name ??
      "Untitled Video",
    artist:
      item.creator_name ??
      item.creator?.fullname ??
      item.creator?.name ??
      item.artist?.fullname ??
      item.artist ??
      item.author ??
      "MULA",
    duration: formatDuration(
      item.duration_minute ??
        item.duration ??
        item.video_duration ??
        item.length
    ),
    views: Number(
      item.view_count ?? item.views ?? item.total_views ?? 0
    ),
    thumbnail: resolveImage(item, 0),
    url: item.video_url ?? item.url ?? item.link ?? item.video_link ?? undefined,
    category:
      item.category_name ??
      item.cat
  };

}

// Strip HTML tags and decode entities for plain text display
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&emsp;/g, "  ")
    .replace(/&ensp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "...")
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®")
    .replace(/&trade;/g, "™")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function mapArticle(item: any): Article {
  // Backend uses 'name' for title and 'description_1' for content
  const title = item.name ?? "Untitled Article";
  const rawContent = item.description_1 ?? item.description_2 ?? item.description_3 ?? "";
  const content = stripHtml(rawContent);
  const category = item.category_name ?? item.category ?? "Art";
  
  return {
    id: String(item.id ?? ""),
    title: title,
    category: category,
    readTime: Number(item.duration_time ?? 3),
    date: item.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    image: item.image_url ?? item.image_url_1 ?? item.image_url_2 ?? null,
    content: content,
  };
}

export function mapEvent(item: any): Event {
  const now = new Date();
  const startDate = item.event_start_date ?? item.start_date ?? item.date ?? item.from_date ?? null;
  const endDate = item.event_end_date ?? item.end_date ?? null;
  const status = (() => {
    const s = (item.status ?? "").toLowerCase();
    if (s === "current" || s === "ongoing" || s === "live") return "current";
    if (s === "past" || s === "ended" || s === "finished") return "past";
    if (endDate && new Date(endDate) < now) return "past";
    if (startDate && new Date(startDate) <= now && (!endDate || new Date(endDate) >= now)) return "current";
    return "upcoming";
  })();

  const stripHtml = (html: string) =>
    html?.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() ?? "";

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatTime = (t: string | null) => {
    if (!t) return null;
    const [h, m] = t.replace(/\+.*/, "").split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return {
    id: String(item.id ?? item.event_id ?? item._id ?? ""),
    title: item.event_name ?? item.title ?? item.name ?? "Untitled Event",
    title_mm: item.event_name_mm ?? null,
    date: formatDate(startDate) ?? new Date().toISOString().slice(0, 10),
    end_date: formatDate(endDate),
    start_time: formatTime(item.event_start_time),
    end_time: formatTime(item.event_end_time),
    location: item.event_location ?? item.location ?? item.venue ?? "Yangon",
    location_mm: item.event_location_mm ?? null,
    image: item.event_thumbnail_url ? { uri: item.event_thumbnail_url } : resolveImage(item, 2),
    status,
    description: stripHtml(item.event_description ?? item.description ?? item.detail ?? ""),
    description_mm: stripHtml(item.event_description_mm ?? ""),
  };
}
