import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PDFParser = require('pdf2json');
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataError', (err: { parserError: Error }) => reject(err.parserError));
    parser.on('pdfParser_dataReady', (data: {
      Pages: Array<{ Texts: Array<{ x: number; y: number; R: Array<{ T: string }> }> }>
    }) => {
      const allLines: string[] = [];

      for (const page of data.Pages ?? []) {
        // Group text fragments by y-coordinate (round to 1dp so nearby items merge)
        const lineMap = new Map<string, Array<{ x: number; text: string }>>();
        for (const block of page.Texts ?? []) {
          const text = block.R?.map((r) => decodeURIComponent(r.T)).join('') ?? '';
          if (!text.trim()) continue;
          const yKey = block.y.toFixed(1);
          if (!lineMap.has(yKey)) lineMap.set(yKey, []);
          lineMap.get(yKey)!.push({ x: block.x, text });
        }

        // Reconstruct each line: sort fragments by x, add a space only when there
        // is a meaningful gap between fragments (word boundary vs adjacent letters)
        const sortedYs = Array.from(lineMap.keys()).sort((a, b) => parseFloat(a) - parseFloat(b));
        for (const yKey of sortedYs) {
          const items = lineMap.get(yKey)!.sort((a, b) => a.x - b.x);
          let line = '';
          for (let i = 0; i < items.length; i++) {
            if (i > 0) {
              const gap = items[i].x - (items[i - 1].x + items[i - 1].text.length * 0.35);
              if (gap > 1.2) line += ' ';
            }
            line += items[i].text;
          }
          if (line.trim()) allLines.push(line.trim());
        }
      }

      resolve(allLines.join('\n'));
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
    // Price — handles "$915,000" and "915000"
    [/\$\s*([\d,]+)\s*\n/m, 'price'],
    [/list\s*price[:\s]+\$?([\d,]+)/i, 'price'],
    [/asking\s*price[:\s]+\$?([\d,]+)/i, 'price'],
    // Beds / Baths
    [/beds?\s*:\s*(\d+)/i, 'bedrooms'],
    [/bedrooms?\s*:\s*(\d+)/i, 'bedrooms'],
    // "Baths: 3 / 0" or "Baths: 3" — capture full baths before the slash
    [/baths?\s*:\s*(\d+)\s*\//i, 'bathrooms'],
    [/baths?\s*:\s*(\d+)/i, 'bathrooms'],
    [/full\s*baths?\s*:\s*(\d+)/i, 'bathrooms'],
    [/baths?\s+full\s*:\s*(\d+)/i, 'bathrooms'],
    // Sqft — "Above Grade Fin SQFT: 3,870" or "Total Fin SQFT: 3,870"
    [/above\s+grade\s+fin\s+sqft\s*:\s*([\d,]+)/i, 'sqft'],
    [/total\s+fin\s+sqft\s*:\s*([\d,]+)/i, 'sqft'],
    [/sq\.?\s*ft\.?\s*:\s*([\d,]+)/i, 'sqft'],
    [/square\s*feet\s*:\s*([\d,]+)/i, 'sqft'],
    [/living\s+area\s*:\s*([\d,]+)/i, 'sqft'],
    // Year built
    [/year\s+built\s*:\s*(\d{4})/i, 'yearBuilt'],
    [/yr\.?\s+built\s*:\s*(\d{4})/i, 'yearBuilt'],
    // MLS number — "MLS #: PACT2118480"
    [/mls\s*#\s*:\s*([A-Z0-9-]+)/i, 'mlsNumber'],
    [/mls\s+number\s*:\s*([A-Z0-9-]+)/i, 'mlsNumber'],
    [/listing\s+id\s*:\s*([A-Z0-9-]+)/i, 'mlsNumber'],
    // Lot / Garage / Stories
    [/lot\s+size\s*:\s*([^\n]+)/i, 'lotSize'],
    [/garage\s*:\s*([^\n]+)/i, 'garage'],
    [/levels?\s*\/?\s*stories\s*:\s*(\d+)/i, 'stories'],
    // HOA — "HOA Fee: $165 / Monthly"
    [/hoa\s+fee\s*:\s*\$?([\d,.]+)/i, 'hoaFee'],
    [/association\s+fee\s*:\s*\$?([\d,.]+)/i, 'hoaFee'],
    // Taxes — "Tax Annual Amt / Year: $13,449 / 2025"
    [/tax\s+annual\s+amt[^:]*:\s*\$?([\d,]+)/i, 'annualTaxes'],
    [/annual\s+taxes?\s*:\s*\$?([\d,]+)/i, 'annualTaxes'],
    // Schools
    [/elementary\s+school\s*:\s*([^\n]+)/i, 'elementarySchool'],
    [/middle\s+school\s*:\s*([^\n]+)/i, 'middleSchool'],
    [/high\s+school\s*:\s*([^\n]+)/i, 'highSchool'],
    [/school\s+district\s*:\s*([^\n]+)/i, 'elementarySchool'],
    // Location
    [/subdiv\s*\/\s*neigh\s*:\s*([^\n]+)/i, 'neighborhood'],
    [/subdivision\s*:\s*([^\n]+)/i, 'neighborhood'],
    [/county\s*:\s*([A-Za-z\s]+?)(?:,|\n)/i, 'county'],
    [/zip(?:\s*code)?\s*:\s*(\d{5})/i, 'zip'],
  ];
  for (const [pattern, field] of patterns) {
    if (result[field]) continue;
    const m = fullText.match(pattern);
    if (m?.[1]) result[field] = m[1].trim();
  }

  // Strategy 3: find address line and extract city/state/zip from it if present
  // Handles "132 Violet Way, Spring City, PA 19475" all on one line
  for (const line of lines) {
    if (/^\d+\s+[A-Za-z]/.test(line) && line.length < 120) {
      // Try to parse "Street, City, ST 12345" format
      const addrMatch = line.match(/^(.+?),\s*(.+?),\s*([A-Z]{2})\s+(\d{5})/);
      if (addrMatch) {
        if (!result.address) result.address = addrMatch[1].trim();
        if (!result.city) result.city = addrMatch[2].trim();
        if (!result.state) result.state = addrMatch[3].trim();
        if (!result.zip) result.zip = addrMatch[4].trim();
      } else if (!result.address) {
        result.address = line;
      }
      break;
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
      return NextResponse.json(mapped);
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
