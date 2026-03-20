'use client';

import { useEffect } from 'react';

interface CalendlyEmbedProps {
  url: string;
  prefillName?: string;
  prefillEmail?: string;
}

export default function CalendlyEmbed({ url, prefillName, prefillEmail }: CalendlyEmbedProps) {
  useEffect(() => {
    // Load Calendly widget script once
    if (document.getElementById('calendly-script')) return;
    const script = document.createElement('script');
    script.id = 'calendly-script';
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Append prefill params to URL if provided
  const embedUrl = new URL(url);
  embedUrl.searchParams.set('hide_landing_page_details', '1');
  embedUrl.searchParams.set('hide_gdpr_banner', '1');
  if (prefillName) embedUrl.searchParams.set('name', prefillName);
  if (prefillEmail) embedUrl.searchParams.set('email', prefillEmail);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-xl font-bold mb-1" style={{ color: '#1a2744' }}>Schedule a Showing</h3>
        <p className="text-gray-500 text-sm">Pick a date and time that works for you</p>
      </div>
      <div
        className="calendly-inline-widget"
        data-url={embedUrl.toString()}
        style={{ minWidth: 280, height: 700 }}
      />
    </div>
  );
}
