'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

interface MLSImportProps {
  onImport: (data: Record<string, string>) => void;
}

// Common MLS field mappings (handles various export formats)
const FIELD_MAP: Record<string, string> = {
  // Address
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

  // Price
  'list price': 'price',
  'listing price': 'price',
  'price': 'price',
  'asking price': 'price',

  // Stats
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
  'lot size': 'lotSize',
  'lot': 'lotSize',
  'year built': 'yearBuilt',
  'yr built': 'yearBuilt',
  'garage': 'garage',
  'garage spaces': 'garage',
  'stories': 'stories',
  'property type': 'propertyType',
  'type': 'propertyType',
  'sub type': 'propertyType',

  // Description
  'remarks': 'description',
  'public remarks': 'description',
  'description': 'description',
  'marketing remarks': 'description',

  // Agent
  'listing agent name': 'agentName',
  'list agent': 'agentName',
  'agent name': 'agentName',
  'listing agent phone': 'agentPhone',
  'agent phone': 'agentPhone',
  'listing agent email': 'agentEmail',
  'agent email': 'agentEmail',
  'list office': 'brokerageName',
  'office name': 'brokerageName',
  'brokerage': 'brokerageName',

  // MLS
  'mls #': 'mlsNumber',
  'mls number': 'mlsNumber',
  'mls id': 'mlsNumber',
  'listing id': 'mlsNumber',

  // Schools
  'elementary school': 'elementarySchool',
  'middle school': 'middleSchool',
  'high school': 'highSchool',

  // Financial
  'hoa fee': 'hoaFee',
  'hoa': 'hoaFee',
  'hoa fees': 'hoaFee',
  'annual taxes': 'annualTaxes',
  'taxes': 'annualTaxes',
  'tax amount': 'annualTaxes',

  // Location
  'latitude': 'latitude',
  'lat': 'latitude',
  'longitude': 'longitude',
  'lng': 'longitude',
  'lon': 'longitude',
};

function mapMLSRow(row: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const normalized = key.toLowerCase().trim();
    const mapped = FIELD_MAP[normalized];
    if (mapped && value) {
      result[mapped] = value.trim();
    }
  }
  return result;
}

export default function MLSImport({ onImport }: MLSImportProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, string>[];
          if (rows.length > 0) {
            const mapped = mapMLSRow(rows[0]);
            onImport(mapped);
          }
        },
      });
    },
    [onImport]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.xls'], 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
        isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-3xl mb-2">📋</div>
      {isDragActive ? (
        <p className="text-blue-600 font-medium">Drop MLS export here…</p>
      ) : (
        <div>
          <p className="text-gray-600 font-medium">Import from MLS Sheet</p>
          <p className="text-gray-400 text-sm mt-1">Drag & drop a CSV export from your MLS</p>
          <p className="text-gray-400 text-xs mt-1">Supports most MLS formats · auto-maps common fields</p>
        </div>
      )}
    </div>
  );
}
