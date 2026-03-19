'use client';

import { useEffect, useState } from 'react';

interface MapEmbedProps {
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

export default function MapEmbed({ address, city, state, zip, latitude, longitude }: MapEmbedProps) {
  const [MapComponents, setMapComponents] = useState<React.ComponentType<{ lat: number; lng: number; label: string }> | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  // Geocode address if no coords provided
  useEffect(() => {
    if (!coords) {
      const fullAddress = `${address}, ${city}, ${state} ${zip}`;
      const encoded = encodeURIComponent(fullAddress);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data[0]) {
            setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
          }
        })
        .catch(() => {});
    }
  }, [address, city, state, zip, coords]);

  // Lazy-load leaflet (client only)
  useEffect(() => {
    import('./LeafletMap').then((mod) => {
      setMapComponents(() => mod.default);
    });
  }, []);

  const fullAddress = `${address}, ${city}, ${state} ${zip}`;

  return (
    <section className="py-12 bg-gray-50" id="map">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-navy-900 mb-2" style={{ color: '#1a2744' }}>Location</h2>
        <p className="text-gray-500 mb-6">{fullAddress}</p>
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height: 420 }}>
          {coords && MapComponents ? (
            <MapComponents lat={coords.lat} lng={coords.lng} label={fullAddress} />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>Loading map…</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    </section>
  );
}
