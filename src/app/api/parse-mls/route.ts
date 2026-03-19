import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFParser = require('pdf2json');
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataError', (err: { parserError: Error }) => reject(err.parserError));
    parser.on('pdfParser_dataReady', (data: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
      const lines: string[] = [];
      for (const page of data.Pages ?? []) {
        for (const textBlock of page.Texts ?? []) {
          const decoded = textBlock.R?.map((r) => decodeURIComponent(r.T)).join('') ?? '';
          if (decoded.trim()) lines.push(decoded.trim());
        }
      }
      resolve(lines.join('\n'));
    });
    parser.parseBuffer(Buffer.from(buffer));
  });
}

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

function extractFromPdfText(rawText: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = rawText.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);

  // Strategy 1: "Key: Value" colon-separated pairs
  for (const line of lines) {
    const m = line.match(/^([A-Za-z#\s/()&,.']+?):\s*(.+)$/);
    if (m) {
      const rawKey = m[1].trim().toLowerCase();
      const value = m[2].trim();
      const mapped = FIELD_MAP[rawKey];
      if (mapped && value) result[mapped] = value;
    }
  }

  // Strategy 2: regex patterns for common MLS fields
  const fullText = rawText;
  const patterns: Array<[RegExp, string]> = [
    [/list\s*price[:\s]+\$?([\d,]+)/i, 'price'],
    [/price[:\s]+\$?([\d,]+)/i, 'price'],
    [/beds?[:\s]+(\d+)/i, 'bedrooms'],
    [/bedrooms?[:\s]+(\d+)/i, 'bedrooms'],
    [/baths?[:\s]+([\d.]+)/i, 'bathrooms'],
    [/bathrooms?[:\s]+([\d.]+)/i, 'bathrooms'],
    [/sq\.?\s*ft\.?[:\s]+([\d,]+)/i, 'sqft'],
    [/square\s*feet[:\s]+([\d,]+)/i, 'sqft'],
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
    [/city[:\s]+([A-Za-z\s]+)/i, 'city'],
    [/state[:\s]+([A-Za-z]{2})/i, 'state'],
    [/zip(?:\s*code)?[:\s]+(\d{5})/i, 'zip'],
  ];
  for (const [pattern, field] of patterns) {
    if (result[field]) continue;
    const m = fullText.match(pattern);
    if (m?.[1]) result[field] = m[1].trim();
  }

  // Strategy 3: first line that looks like a street address
  if (!result.address) {
    for (const line of lines) {
      if (/^\d+\s+[A-Za-z]/.test(line) && line.length < 100) {
        result.address = line;
        break;
      }
    }
  }

  // Strategy 4: longest prose block as description
  if (!result.description) {
    const longLines = lines.filter((l) => l.length > 80 && /[a-z]{4,}/.test(l));
    if (longLines.length > 0) result.description = longLines.slice(0, 6).join(' ');
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

    // PDF path
    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      const rawText = await extractTextFromPdf(bytes);
      const mapped = extractFromPdfText(rawText);
      // Temporary: include raw text so we can see the PDF format
      return NextResponse.json({ ...mapped, _rawText: rawText.slice(0, 3000) });
    }

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
