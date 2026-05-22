export type ArtType = "manual" | "digital";
export type ArtMedium = string;

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  type: ArtType;
  medium: ArtMedium;
  year: number;
  dimensions: string;
  price: number;
  currency: string;
  image: any;
  description: string;
  isSoldOut: boolean;
  isLiked: boolean;
  category: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  avatar: any;
  image?: any;
  thumbnail?: any;
  artworkCount: number;
  followers: number;
  specialization: string;
  specialty?: string;
  location?: string;
}

export interface Event {
  id: string;
  title: string;
  title_mm?: string | null;
  date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location: string;
  location_mm?: string | null;
  image: any;
  status: "current" | "upcoming" | "past";
  description: string;
  description_mm?: string | null;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  readTime: number;
  date: string;
  image: any;
  content: string;
}

export interface Video {
  id: string;
  title: string;
  artist: string;
  duration: string;
  views: number;
  thumbnail: any;
  url?: string;
  category: ArtMedium;
  isTraditional?: boolean;
}

export const ARTISTS: Artist[] = [
  {
    id: "a1",
    name: "Min Min Htun",
    bio: "A renowned Myanmar artist specializing in oil painting with over 20 years of experience capturing the beauty of Burmese landscapes and traditions.",
    avatar: require("../assets/images/art3.png"),
    artworkCount: 47,
    followers: 1240,
    specialization: "Oil Painting & Watercolor",
  },
  {
    id: "a2",
    name: "Aye Aye Khaing",
    bio: "Contemporary digital artist blending traditional Myanmar motifs with modern digital techniques to create stunning visual narratives.",
    avatar: require("../assets/images/art2.png"),
    artworkCount: 31,
    followers: 892,
    specialization: "Digital Illustration",
  },
  {
    id: "a3",
    name: "Zaw Zaw Linn",
    bio: "Master watercolorist known for ethereal landscapes capturing the spiritual essence of Myanmar's ancient temples and mountains.",
    avatar: require("../assets/images/art1.png"),
    artworkCount: 63,
    followers: 2100,
    specialization: "Watercolor",
  },
];

export const ARTWORKS: Artwork[] = [
  {
    id: "w1",
    title: "The Bullock Cart",
    artist: "Min Min Htun",
    artistId: "a1",
    type: "manual",
    medium: "Oil Painting",
    year: 2021,
    dimensions: "4 ft × 3 ft",
    price: 580000,
    currency: "MMK",
    image: require("../assets/images/art1.png"),
    description:
      "A timeless depiction of rural Burmese life, capturing the strength and grace of oxen pulling a traditional cart through golden harvest fields. The artist masterfully uses warm ochres and deep earth tones to evoke nostalgia and respect for Myanmar's agricultural heritage.",
    isSoldOut: true,
    isLiked: false,
    category: "Landscape",
  },
  {
    id: "w2",
    title: "Mystic Pagoda Dawn",
    artist: "Zaw Zaw Linn",
    artistId: "a3",
    type: "manual",
    medium: "Watercolor",
    year: 2023,
    dimensions: "2 ft × 3 ft",
    price: 390000,
    currency: "MMK",
    image: require("../assets/images/art1.png"),
    description:
      "The golden stupa pierces through morning mist as the sun rises over Bagan. Painted en plein air over three consecutive dawns, this piece captures the ephemeral beauty of ancient Myanmar's sacred sites.",
    isSoldOut: false,
    isLiked: true,
    category: "Landscape",
  },
  {
    id: "w3",
    title: "The Parrot",
    artist: "Min Min Htun",
    artistId: "a1",
    type: "manual",
    medium: "Watercolor",
    year: 2022,
    dimensions: "18 in × 24 in",
    price: 390000,
    currency: "MMK",
    image: require("../assets/images/art3.png"),
    description:
      "A being which can speak called parrot, a bird is one of the best friends to humans. It has a lovely colorful feathers and sweet nature. The artist created the cherishingly beauty of the parrot in this watercolor painting.",
    isSoldOut: false,
    isLiked: false,
    category: "Wildlife",
  },
  {
    id: "w4",
    title: "Neon Mandala",
    artist: "Aye Aye Khaing",
    artistId: "a2",
    type: "digital",
    medium: "Digital Illustration",
    year: 2024,
    dimensions: "4K Digital Print",
    price: 250000,
    currency: "MMK",
    image: require("../assets/images/art2.png"),
    description:
      "A hypnotic fusion of traditional Burmese mandala patterns reimagined in vibrant neon hues. This digital masterpiece bridges ancient spirituality with contemporary digital expression.",
    isSoldOut: false,
    isLiked: true,
    category: "Abstract",
  },
  {
    id: "w5",
    title: "Digital Cosmos",
    artist: "Aye Aye Khaing",
    artistId: "a2",
    type: "digital",
    medium: "3D Art",
    year: 2024,
    dimensions: "5K Digital Print",
    price: 320000,
    currency: "MMK",
    image: require("../assets/images/art2.png"),
    description:
      "A breathtaking 3D rendered cosmos blending Myanmar's traditional Thingyan water festival motifs with cosmic imagery. Available as a high-resolution digital print.",
    isSoldOut: false,
    isLiked: false,
    category: "Abstract",
  },
  {
    id: "w6",
    title: "Lady of the Lake",
    artist: "Zaw Zaw Linn",
    artistId: "a3",
    type: "manual",
    medium: "Acrylic",
    year: 2022,
    dimensions: "3 ft × 4 ft",
    price: 450000,
    currency: "MMK",
    image: require("../assets/images/art3.png"),
    description:
      "A serene portrait of an Inle Lake fisherwoman at dusk, rendered in luminous acrylics that capture the reflection of golden light on the still waters.",
    isSoldOut: false,
    isLiked: false,
    category: "Portrait",
  },
];

export const EVENTS: Event[] = [
  {
    id: "e1",
    title: "Myanmar Masters Exhibition",
    date: "2026-04-15",
    location: "Mula Gallery, Yangon",
    image: require("../assets/images/art1.png"),
    status: "upcoming",
    description:
      "A prestigious showcase featuring Myanmar's most celebrated artists presenting their latest masterpieces.",
  },
  {
    id: "e2",
    title: "Digital Art Summit 2026",
    date: "2026-03-20",
    location: "Mula Gallery, Yangon",
    image: require("../assets/images/art2.png"),
    status: "current",
    description:
      "Explore the frontier of digital artistry with interactive installations and live digital painting sessions.",
  },
  {
    id: "e3",
    title: "Bagan Heritage Collection",
    date: "2026-02-10",
    location: "Mula Gallery, Mandalay",
    image: require("../assets/images/art3.png"),
    status: "past",
    description:
      "A sold-out exhibition celebrating the architectural wonder of Bagan through art.",
  },
];

export const ARTICLES: Article[] = [
  {
    id: "ar1",
    title: "Art of Myanmar",
    category: "Art",
    readTime: 2,
    date: "2024-08-05",
    image: require("../assets/images/art1.png"),
    content:
      "Myanmar's rich artistic heritage spans over two millennia, from ancient temple murals to contemporary digital expressions. Discover how traditional craftsmanship informs modern creative practices.",
  },
  {
    id: "ar2",
    title: "Bedroom in Arles — Inspiration",
    category: "Abstract",
    readTime: 2,
    date: "2024-08-05",
    image: require("../assets/images/art2.png"),
    content:
      "Van Gogh's iconic bedroom painting continues to inspire artists worldwide. We explore how this masterpiece influences contemporary abstract artists from Southeast Asia.",
  },
  {
    id: "ar3",
    title: "Art therapy can be a great way to relax",
    category: "Art Therapy",
    readTime: 3,
    date: "2024-08-12",
    image: require("../assets/images/art3.png"),
    content:
      "Scientific studies confirm what artists have long known: creative expression is a powerful tool for mental wellbeing. Discover how art therapy is transforming wellness practices.",
  },
  {
    id: "ar4",
    title: "The Rise of Digital Art Markets",
    category: "Digital Art",
    readTime: 4,
    date: "2024-08-19",
    image: require("../assets/images/art2.png"),
    content:
      "NFTs, digital galleries, and online auctions are reshaping how art is bought and sold. A deep dive into the digital art economy.",
  },
];

export const VIDEOS: Video[] = [
  {
    id: "v1",
    title: "Art Therapy Session",
    artist: "Gone Yee",
    duration: "0:10",
    views: 48,
    thumbnail: require("../assets/images/art3.png"),
    category: "Oil Painting",
  },
  {
    id: "v2",
    title: "Drawing Benefits for Kids",
    artist: "Gone Yee",
    duration: "0:15",
    views: 59,
    thumbnail: require("../assets/images/art1.png"),
    category: "Watercolor",
  },
  {
    id: "v3",
    title: "Digital Illustration Masterclass",
    artist: "Aye Aye Khaing",
    duration: "1:20",
    views: 203,
    thumbnail: require("../assets/images/art2.png"),
    category: "Digital Illustration",
  },
  {
    id: "v4",
    title: "Oil Painting Basics",
    artist: "Min Min Htun",
    duration: "0:45",
    views: 127,
    thumbnail: require("../assets/images/art1.png"),
    category: "Oil Painting",
  },
];

export const ARTICLE_CATEGORIES = ["All", "Art", "Abstract", "Art Therapy", "Digital Art"];
export const VIDEO_CATEGORIES: ArtMedium[] = ["Watercolor", "Oil Painting", "Digital Illustration", "3D Art"];
export const ARTWORK_MEDIUMS: ArtMedium[] = ["Watercolor", "Oil Painting", "Acrylic", "Digital Illustration", "3D Art"];
