import { NextRequest, NextResponse } from 'next/server';
import { getAllListings, saveListing, generateSlug } from '@/lib/storage';
import { Listing } from '@/types/listing';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const listings = getAllListings();
  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = uuidv4();
  const slug = generateSlug(body.address || '', body.city || '') + '-' + id.slice(0, 6);
  const now = new Date().toISOString();

  const listing: Listing = {
    id,
    slug,
    status: body.status || 'draft',
    createdAt: now,
    updatedAt: now,
    address: body.address || '',
    city: body.city || '',
    state: body.state || '',
    zip: body.zip || '',
    neighborhood: body.neighborhood,
    county: body.county,
    price: Number(body.price) || 0,
    propertyType: body.propertyType || 'Single Family',
    listingType: body.listingType || 'For Sale',
    bedrooms: Number(body.bedrooms) || 0,
    bathrooms: Number(body.bathrooms) || 0,
    halfBathrooms: body.halfBathrooms ? Number(body.halfBathrooms) : undefined,
    sqft: Number(body.sqft) || 0,
    lotSize: body.lotSize,
    yearBuilt: body.yearBuilt ? Number(body.yearBuilt) : undefined,
    garage: body.garage,
    stories: body.stories ? Number(body.stories) : undefined,
    description: body.description || '',
    features: body.features || [],
    photos: body.photos || [],
    virtualTourUrl: body.virtualTourUrl,
    videoUrl: body.videoUrl,
    latitude: body.latitude ? Number(body.latitude) : undefined,
    longitude: body.longitude ? Number(body.longitude) : undefined,
    agentName: body.agentName || '',
    agentPhone: body.agentPhone || '',
    agentEmail: body.agentEmail || '',
    agentPhoto: body.agentPhoto,
    brokerageName: body.brokerageName,
    mlsNumber: body.mlsNumber,
    elementarySchool: body.elementarySchool,
    middleSchool: body.middleSchool,
    highSchool: body.highSchool,
    hoaFee: body.hoaFee ? Number(body.hoaFee) : undefined,
    hoaFrequency: body.hoaFrequency,
    annualTaxes: body.annualTaxes ? Number(body.annualTaxes) : undefined,
  };

  saveListing(listing);
  return NextResponse.json(listing, { status: 201 });
}
