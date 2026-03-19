import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

// Same field map as MLSImport.tsx — normalizes MLS headers to our internal field names
const FIELD_MAP: Record<string, string> = {
  'street address': 'address',
  'address': 'address',
  'property address': 'address',
  'street': 'address',
  'city': 'city',
  'state': 'state',
  'zip': 'zip',
  'zip code': 'zip',
  'postal code': 'zip',
  'subdivision': 'neighborhood',
  'neighborhood': 'neighborhood',
  'county': 'county',

  'list price': 'price',
  'listing price': 'price',
  'price': 'price',
  'asking price': 'price',
  'close price': 'price',
  'sold price': 'price',

  'bedrooms': 'bedrooms',
  'beds': 'bedrooms',
  'bedroom count': 'bedrooms',
  'br': 'bedrooms',
  'bathrooms': 'bathrooms',
  'baths': 'bathrooms',
  'bath': 'bathrooms',
  'full baths': 'bathrooms',
  'half baths': 'halfBathrooms',
  'half bath': 'halfBathrooms',
  'square feet': 'sqft',
  'sq ft': 'sqft',
  'sqft': 'sqft',
  'living area': 'sqft',
  'heated sq ft': 'sqft',
  'total sq ft': 'sqft',
  'approx sqft': 'sqft',
  'lot size': 'lotSize',
  'lot': 'lotSize',
  'lot acres': 'lotSize',
  'year built': 'yearBuilt',
  'yr built': 'yearBuilt',
  'built': 'yearBuilt',
  'garage': 'garage',
  'garage spaces': 'garage',
  'parking': 'garage',
  'stories': 'stories',
  'levels': 'stories',
  'property type': 'propertyType',
  'type': 'propertyType',
  'sub type': 'propertyType',
  'style': 'propertyType',

  'remarks': 'description',
  'public remarks': 'description',
  'description': 'description',
  'marketing remarks': 'description',
  'agent remarks': 'description',
  'private remarks': 'description',

  'listing agent name': 'agentName',
  'list agent': 'agentName',
  'agent name': 'agentName',
  'agent': 'agentName',
  'listing agent': 'agentName',
  'listing agent phone': 'agentPhone',
  'agent phone': 'agentPhone',
  'list agent phone': 'agentPhone',
  'listing agent email': 'agentEmail',
  'agent email': 'agentEmail',
  'list agent email': 'agentEmail',
  'list office': 'brokerageName',
  'office name': 'brokerageName',
  'brokerage': 'brokerageName',
  'company': 'brokerageName',

  'mls #': 'mlsNumber',
  'mls number': 'mlsNumber',
  'mls id': 'mlsNumber',
  'listing id': 'mlsNumber',
  'mls': 'mlsNumber',

  'elementary school': 'elementarySchool',
  'elementary': 'elementarySchool',
  'middle school': 'middleSchool',
  'middle': 'middleSchool',
  'high school': 'highSchool',
  'high': 'highSchool',

  'hoa fee': 'hoaFee',
  'hoa': 'hoaFee',
  'hoa fees': 'hoaFee',
  'hoa amount': 'hoaFee',
  'annual taxes': 'annualTaxes',
  'taxes': 'annualTaxes',
  'tax amount': 'annualTaxes',
  'annual tax': 'annualTaxes',

  'latitude': 'latitude',
  'lat': 'latitude',
  'longitude': 'longitude',
  'lng': 'longitude',
  'lon': 'longitude',
};

function mapRow(row: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const normalized = key.toLowerCase().trim();
    const mapped = FIELD_MAP[normalized];
    if (mapped && value && value.trim()) {
      result[mapped] = value.trim();
    }
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();

    const text = new TextDecoder().decode(bytes);
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (result.data.length > 0) {
      return NextResponse.json(mapRow(result.data[0]));
    }

    return NextResponse.json({});
  } catch (err) {
    console.error('parse-mls error:', err);
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 });
  }
}
