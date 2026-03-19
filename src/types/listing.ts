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
}
