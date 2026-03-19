import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
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

// Extract key-value pairs from PDF text lines like "List Price: $450,000" or "Beds: 4"
function extractFromPdfText(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Strategy 1: Match "Key: Value" or "Key Value" patterns line by line
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Look for "Key: Value" (colon separator)
    const colonMatch = line.match(/^([A-Za-z#\s\/()&,.']+?):\s*(.+)$/);
    if (colonMatch) {
      const rawKey = colonMatch[1].trim().toLowerCase();
      const value = colonMatch[2].trim();
      const mapped = FIELD_MAP[rawKey];
      if (mapped && value) {
        result[mapped] = value;
      }
    }
  }

  // Strategy 2: Look for known labels followed by values on the same or next line
  const fullText = text.toLowerCase();
  const knownPatterns: Array<[RegExp, string]> = [
    [/list price[:\s]+\$?([\d,]+)/i, 'price'],
    [/price[:\s]+\$?([\d,]+)/i, 'price'],
    [/beds?[:\s]+(\d+)/i, 'bedrooms'],
    [/bedrooms?[:\s]+(\d+)/i, 'bedrooms'],
    [/baths?[:\s]+([\d.]+)/i, 'bathrooms'],
    [/bathrooms?[:\s]+([\d.]+)/i, 'bathrooms'],
    [/sq\.?\s*ft\.?[:\s]+([\d,]+)/i, 'sqft'],
    [/square\s+feet[:\s]+([\d,]+)/i, 'sqft'],
    [/year\s+built[:\s]+(\d{4})/i, 'yearBuilt'],
    [/yr\.?\s+built[:\s]+(\d{4})/i, 'yearBuilt'],
    [/mls\s*#?[:\s]+([A-Z0-9-]+)/i, 'mlsNumber'],
    [/lot\s+size[:\s]+([^\n]+)/i, 'lotSize'],
    [/garage[:\s]+([^\n]+)/i, 'garage'],
    [/hoa\s+fee[:\s]+\$?([\d,.]+)/i, 'hoaFee'],
    [/annual\s+taxes?[:\s]+\$?([\d,.]+)/i, 'annualTaxes'],
    [/elementary\s+school[:\s]+([^\n]+)/i, 'elementarySchool'],
    [/middle\s+school[:\s]+([^\n]+)/i, 'middleSchool'],
    [/high\s+school[:\s]+([^\n]+)/i, 'highSchool'],
    [/subdivision[:\s]+([^\n]+)/i, 'neighborhood'],
  ];

  for (const [pattern, field] of knownPatterns) {
    if (result[field]) continue; // already found via colon strategy
    const match = fullText.match(pattern);
    if (match && match[1]) {
      result[field] = match[1].trim();
    }
  }

  // Strategy 3: Try to find address — look for a line that looks like a street address
  if (!result.address) {
    for (const line of lines) {
      if (/^\d+\s+[A-Za-z]/.test(line) && line.length < 80) {
        result.address = line;
        break;
      }
    }
  }

  // Strategy 4: Find description — usually the longest block of prose
  if (!result.description) {
    const longLines = lines.filter((l) => l.length > 60 && /[a-z]{3,}/.test(l));
    if (longLines.length > 0) {
      result.description = longLines.slice(0, 5).join(' ');
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
    const buffer = Buffer.from(bytes);
    const name = file.name.toLowerCase();

    // PDF path
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      const mapped = extractFromPdfText(pdfData.text);
      return NextResponse.json(mapped);
    }

    // CSV / Excel / TXT path
    const text = new TextDecoder().decode(buffer);
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
