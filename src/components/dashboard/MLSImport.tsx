'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

interface MLSImportProps {
  onImport: (data: Record<string, string>) => void;
}

const FIELD_MAP: Record<string, string> = {
  'street address': 'address', 'address': 'address', 'property address': 'address', 'street': 'address',
  'city': 'city', 'state': 'state', 'zip': 'zip', 'zip code': 'zip', 'postal code': 'zip',
  'subdivision': 'neighborhood', 'neighborhood': 'neighborhood', 'county': 'county',
  'list price': 'price', 'listing price': 'price', 'price': 'price', 'asking price': 'price', 'close price': 'price', 'sold price': 'price',
  'bedrooms': 'bedrooms', 'beds': 'bedrooms', 'bedroom count': 'bedrooms', 'br': 'bedrooms',
  'bathrooms': 'bathrooms', 'baths': 'bathrooms', 'bath': 'bathrooms', 'full baths': 'bathrooms',
  'half baths': 'halfBathrooms', 'half bath': 'halfBathrooms',
  'square feet': 'sqft', 'sq ft': 'sqft', 'sqft': 'sqft', 'living area': 'sqft',
  'heated sq ft': 'sqft', 'total sq ft': 'sqft', 'approx sqft': 'sqft', 'above grade fin sqft': 'sqft',
  'lot size': 'lotSize', 'lot': 'lotSize', 'lot acres': 'lotSize',
  'year built': 'yearBuilt', 'yr built': 'yearBuilt', 'built': 'yearBuilt',
  'garage': 'garage', 'garage spaces': 'garage', 'parking': 'garage',
  'stories': 'stories', 'levels': 'stories',
  'property type': 'propertyType', 'type': 'propertyType', 'sub type': 'propertyType', 'style': 'propertyType',
  'remarks': 'description', 'public remarks': 'description', 'description': 'description',
  'marketing remarks': 'description', 'agent remarks': 'description',
  'listing agent name': 'agentName', 'list agent': 'agentName', 'agent name': 'agentName',
  'agent': 'agentName', 'listing agent': 'agentName',
  'listing agent phone': 'agentPhone', 'agent phone': 'agentPhone', 'list agent phone': 'agentPhone',
  'listing agent email': 'agentEmail', 'agent email': 'agentEmail', 'list agent email': 'agentEmail',
  'list office': 'brokerageName', 'office name': 'brokerageName', 'brokerage': 'brokerageName',
  'mls #': 'mlsNumber', 'mls number': 'mlsNumber', 'mls id': 'mlsNumber', 'listing id': 'mlsNumber', 'mls': 'mlsNumber',
  'elementary school': 'elementarySchool', 'elementary': 'elementarySchool',
  'middle school': 'middleSchool', 'middle': 'middleSchool',
  'high school': 'highSchool', 'high': 'highSchool',
  'hoa fee': 'hoaFee', 'hoa': 'hoaFee', 'hoa fees': 'hoaFee', 'hoa amount': 'hoaFee',
  'annual taxes': 'annualTaxes', 'taxes': 'annualTaxes', 'tax amount': 'annualTaxes', 'annual tax': 'annualTaxes',
  'tax annual amt': 'annualTaxes',
  'latitude': 'latitude', 'lat': 'latitude', 'longitude': 'longitude', 'lng': 'longitude', 'lon': 'longitude',
};

function mapRow(row: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const mapped = FIELD_MAP[key.toLowerCase().trim()];
    if (mapped && value?.trim()) result[mapped] = value.trim();
  }
  return result;
}

function extractFromPdfText(rawText: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = rawText.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);
  const fullText = rawText;

  for (const line of lines) {
    const m = line.match(/^([A-Za-z#\s/()&,.']+?):\s*(.+)$/);
    if (m) {
      const mapped = FIELD_MAP[m[1].trim().toLowerCase()];
      if (mapped && m[2].trim()) result[mapped] = m[2].trim();
    }
  }

  const patterns: Array<[RegExp, string]> = [
    [/list\s*price[:\s]+\$?([\d,]+)/i, 'price'],
    [/\$\s*([\d,]+)\s*\n/m, 'price'],
    [/beds?\s*:\s*(\d+)/i, 'bedrooms'],
    [/bedrooms?\s*:\s*(\d+)/i, 'bedrooms'],
    [/baths?\s*:\s*(\d+)\s*\//i, 'bathrooms'],
    [/full\s*baths?\s*:\s*(\d+)/i, 'bathrooms'],
    [/above\s+grade\s+fin\s+sqft\s*:\s*([\d,]+)/i, 'sqft'],
    [/sq\.?\s*ft\.?\s*:\s*([\d,]+)/i, 'sqft'],
    [/living\s+area\s*:\s*([\d,]+)/i, 'sqft'],
    [/year\s+built\s*:\s*(\d{4})/i, 'yearBuilt'],
    [/mls\s*#\s*:\s*([A-Z0-9-]+)/i, 'mlsNumber'],
    [/mls\s+number\s*:\s*([A-Z0-9-]+)/i, 'mlsNumber'],
    [/lot\s+size\s*:\s*([^\n]+)/i, 'lotSize'],
    [/hoa\s+fee\s*:\s*\$?([\d,.]+)/i, 'hoaFee'],
    [/tax\s+annual\s+amt[^:]*:\s*\$?([\d,]+)/i, 'annualTaxes'],
    [/annual\s+taxes?\s*:\s*\$?([\d,]+)/i, 'annualTaxes'],
    [/elementary\s+school\s*:\s*([^\n]+)/i, 'elementarySchool'],
    [/middle\s+school\s*:\s*([^\n]+)/i, 'middleSchool'],
    [/high\s+school\s*:\s*([^\n]+)/i, 'highSchool'],
    [/zip(?:\s*code)?\s*:\s*(\d{5})/i, 'zip'],
    [/county\s*:\s*([A-Za-z\s]+?)(?:,|\n)/i, 'county'],
  ];
  for (const [pattern, field] of patterns) {
    if (result[field]) continue;
    const m = fullText.match(pattern);
    if (m?.[1]) result[field] = m[1].trim();
  }

  for (const line of lines) {
    if (/^\d+\s+[A-Za-z]/.test(line) && line.length < 120) {
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

  if (!result.description) {
    const remarksMatch = fullText.match(/public\s+remarks?\s*:\s*([\s\S]+?)(?=\n[A-Z][a-z]+\s+(?:Info|Details|Remarks?)|\n\n|$)/i);
    if (remarksMatch?.[1]) result.description = remarksMatch[1].replace(/\s+/g, ' ').trim();
  }

  return result;
}

async function parsePdfClientSide(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n');
}

export default function MLSImport({ onImport }: MLSImportProps) {
  const [status, setStatus] = useState<'idle' | 'parsing' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFile = useCallback(
    async (file: File) => {
      setStatus('parsing');
      setErrorMsg('');

      const name = file.name.toLowerCase();
      const isPDF = name.endsWith('.pdf') || file.type === 'application/pdf';

      try {
        if (isPDF) {
          const rawText = await parsePdfClientSide(file);
          const mapped = extractFromPdfText(rawText);
          if (Object.keys(mapped).length === 0) {
            throw new Error('No MLS fields found in this PDF. Try a CSV export instead.');
          }
          setStatus('idle');
          onImport(mapped);
        } else {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const rows = results.data as Record<string, string>[];
              if (rows.length > 0) {
                const mapped = mapRow(rows[0]);
                setStatus('idle');
                onImport(mapped);
              } else {
                setStatus('error');
                setErrorMsg('No rows found in this file.');
              }
            },
            error: () => {
              setStatus('error');
              setErrorMsg('Could not read this file.');
            },
          });
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Failed to parse file.');
      }
    },
    [onImport]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => { if (acceptedFiles[0]) handleFile(acceptedFiles[0]); },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          isDragActive ? 'border-amber-400 bg-amber-50'
          : status === 'error' ? 'border-red-300 bg-red-50'
          : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {status === 'parsing' ? (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-400 border-t-transparent" />
            <span>Reading MLS file…</span>
          </div>
        ) : isDragActive ? (
          <p className="text-amber-600 font-medium">Drop your MLS file here…</p>
        ) : (
          <div>
            <div className="text-3xl mb-2">📋</div>
            <p className="text-gray-600 font-medium">Import from MLS</p>
            <p className="text-gray-400 text-sm mt-1">Drag & drop a PDF or CSV export from your MLS</p>
            <p className="text-gray-400 text-xs mt-1">Supports PDF · CSV · XLS · auto-maps common fields</p>
          </div>
        )}
      </div>
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
