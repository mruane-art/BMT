'use client';

interface MapEmbedProps {
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

export default function MapEmbed({ address, city, state, zip }: MapEmbedProps) {
  const fullAddress = `${address}, ${city}, ${state} ${zip}`;
  const encoded = encodeURIComponent(fullAddress);
  const embedUrl = `https://maps.google.com/maps?q=${encoded}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  return (
    <section className="py-12 bg-gray-50" id="map">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a2744' }}>Location</h2>
        <p className="text-gray-500 mb-6">{fullAddress}</p>
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <iframe
            src={embedUrl}
            width="100%"
            height="420"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${fullAddress}`}
          />
        </div>
        <div className="mt-4">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: '#c9a84c' }}
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    </section>
  );
}
