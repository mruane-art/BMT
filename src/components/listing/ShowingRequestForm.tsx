'use client';

import { useEffect } from 'react';

interface ShowingRequestFormProps {
  propertyAddress: string;
  agentEmail?: string;
  agentPhone?: string;
}

export default function ShowingRequestForm({ propertyAddress }: ShowingRequestFormProps) {
  useEffect(() => {
    // JotForm auto-resize script
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.async = true;
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).jotformEmbedHandler) {
        (window as unknown as Record<string, (selector: string, domain: string) => void>).jotformEmbedHandler(
          "iframe[id='JotFormIFrame-261098826662063']",
          'https://form.jotform.com/'
        );
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-xl font-bold mb-1" style={{ color: '#1a2744' }}>Request a Showing</h3>
        <p className="text-gray-600 text-sm">
          Schedule a private tour of {propertyAddress}
        </p>
      </div>
      <iframe
        id="JotFormIFrame-261098826662063"
        title="Showing Request"
        src="https://form.jotform.com/261098826662063"
        allow="geolocation; microphone; camera"
        allowFullScreen
        style={{
          width: '100%',
          minWidth: '100%',
          border: 'none',
          height: '700px',
        }}
        scrolling="no"
      />
    </div>
  );
}
