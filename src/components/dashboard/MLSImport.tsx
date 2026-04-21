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
          setStatus('error');
          setErrorMsg('PDF import is not supported. Please export your listing as a CSV from Bright MLS: Search Results → Export → Spreadsheet (CSV).');
          return;
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
            <p className="text-gray-400 text-sm mt-1">Drag & drop a CSV export from Bright MLS</p>
            <p className="text-gray-400 text-xs mt-1">In Bright MLS: Search Results → Export → Spreadsheet (CSV)</p>
          </div>
        )}
      </div>
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
