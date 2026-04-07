export interface SocialPost {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest' | 'other';
  postUrl?: string;
  postDate?: string;
  description?: string;
  reach?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  platformLabel?: string; // for 'other'
}

export interface OpenHouse {
  date: string;
  startTime: string;
  endTime: string;
  attendance?: number;
  notes?: string;
}

export interface OnlineListing {
  site: 'zillow' | 'realtor' | 'redfin' | 'homes' | 'trulia' | 'mls' | 'other';
  siteName?: string;
  url?: string;
  views?: number;
  active: boolean;
}

export interface MarketingActivity {
  date: string;
  title: string;
  description?: string;
  completed: boolean;
  category?: 'digital' | 'social' | 'print' | 'event' | 'other';
}

export interface MarketingData {
  listingDate?: string;
  sellerName?: string;
  agentMessage?: string;

  // Manual stats
  totalViews?: number;
  totalInquiries?: number;
  totalShowings?: number;
  totalReach?: number;

  // Social media
  socialPosts?: SocialPost[];

  // Open houses
  openHouses?: OpenHouse[];

  // Online listings / syndication
  onlineListings?: OnlineListing[];

  // Marketing activities timeline
  activities?: MarketingActivity[];

  // Showing service (ShowingTime, ShowingSmart, etc.)
  showingServiceUrl?: string;
  showingServiceName?: string;
}

export interface Listing {
  id: string;
  slug: string;
  status: 'active' | 'pending' | 'sold' | 'draft';
  createdAt: string;
  updatedAt: string;

  // Address
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood?: string;
  county?: string;

  // Price & Type
  price: number;
  propertyType: string;
  listingType: 'For Sale' | 'For Rent' | 'Sold';

  // Key Stats
  bedrooms: number;
  bathrooms: number;
  halfBathrooms?: number;
  sqft: number;
  lotSize?: string;
  yearBuilt?: number;
  garage?: string;
  stories?: number;

  // Details
  description: string;
  features: string[];

  // Media
  photos: string[];
  virtualTourUrl?: string;
  videoUrl?: string;

  // Location
  latitude?: number;
  longitude?: number;

  // Agent
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentPhoto?: string;
  agentTeam?: string;
  brokerageName?: string;
  schedulingUrl?: string;        // Calendly / Cal.com / Acuity link for inline scheduler

  // MLS
  mlsNumber?: string;

  // School info
  elementarySchool?: string;
  middleSchool?: string;
  highSchool?: string;

  // HOA
  hoaFee?: number;
  hoaFrequency?: string;

  // Taxes
  annualTaxes?: number;

  // Marketing report data
  marketing?: MarketingData;
}
