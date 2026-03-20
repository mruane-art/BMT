'use client';

import { useState } from 'react';

interface GalleryProps {
  photos: string[];
  address: string;
}

export default function Gallery({ photos, address }: GalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!photos || photos.length === 0) return null;

  const main = photos[activeIdx];

  return (
    <section className="bg-white" id="gallery">
      {/* Main large photo */}
      <div
        className="relative w-full cursor-zoom-in overflow-hidden"
        style={{ height: '520px' }}
        onClick={() => setLightboxOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main} alt={address} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <button
          className="absolute bottom-4 right-4 bg-white/90 text-gray-800 px-4 py-2 rounded text-sm font-medium shadow hover:bg-white transition"
          onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
        >
          View All {photos.length} Photos
        </button>
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50 border-t border-gray-200">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative flex-shrink-0 rounded overflow-hidden border-2 transition ${
                idx === activeIdx ? 'border-amber-500 shadow-md' : 'border-transparent hover:border-gray-300'
              }`}
              style={{ width: 100, height: 72 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={`Photo ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-light hover:text-amber-400 transition"
            onClick={() => setLightboxOpen(false)}
          >
            ×
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl font-light hover:text-amber-400 transition px-4"
            onClick={(e) => { e.stopPropagation(); setActiveIdx((activeIdx - 1 + photos.length) % photos.length); }}
          >
            ‹
          </button>
          <div
            className="relative flex items-center justify-center"
            style={{ width: '80vw', height: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={main} alt={address} className="max-w-full max-h-full object-contain" />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl font-light hover:text-amber-400 transition px-4"
            onClick={(e) => { e.stopPropagation(); setActiveIdx((activeIdx + 1) % photos.length); }}
          >
            ›
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeIdx + 1} / {photos.length}
          </p>
        </div>
      )}
    </section>
  );
}
