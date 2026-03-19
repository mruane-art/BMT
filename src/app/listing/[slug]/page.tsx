import { getListingBySlug } from '@/lib/storage';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Gallery from '@/components/listing/Gallery';
import MapEmbed from '@/components/listing/MapEmbed';
import ShowingRequestForm from '@/components/listing/ShowingRequestForm';

// Always render dynamically so newly created listings are immediately accessible
export const dynamic = 'force-dynamic';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

function formatSqft(sqft: number) {
  return new Intl.NumberFormat('en-US').format(sqft);
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const heroPhoto = listing.photos?.[0] || null;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            {listing.brokerageName && (
              <span className="text-sm font-semibold text-gray-700">{listing.brokerageName}</span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <a href="#gallery" className="text-sm text-gray-600 hover:text-amber-600 transition hidden md:block">Photos</a>
            <a href="#details" className="text-sm text-gray-600 hover:text-amber-600 transition hidden md:block">Details</a>
            <a href="#map" className="text-sm text-gray-600 hover:text-amber-600 transition hidden md:block">Map</a>
            <a
              href="#contact"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition"
              style={{ backgroundColor: '#c9a84c' }}
            >
              Schedule Showing
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full" style={{ height: '100vh', minHeight: 600, backgroundColor: '#1a2744' }}>
        {heroPhoto ? (
          <Image
            src={heroPhoto}
            alt={fullAddress}
            fill
            className="object-cover"
            priority
          />
        ) : null}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.65) 100%)' }} />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-6xl mx-auto">
            {listing.status !== 'active' && (
              <span className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-amber-500 text-white mb-4">
                {listing.status}
              </span>
            )}
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">
              {listing.listingType} · {listing.propertyType}
              {listing.neighborhood ? ` · ${listing.neighborhood}` : ''}
            </p>
            <h1 className="text-white text-4xl md:text-6xl font-bold leading-tight mb-3 drop-shadow-lg">
              {listing.address}
            </h1>
            <p className="text-white/80 text-xl md:text-2xl mb-6">
              {listing.city}, {listing.state} {listing.zip}
            </p>

            {/* Key Stats Bar */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="text-white">
                <span className="text-3xl md:text-4xl font-bold">{formatPrice(listing.price)}</span>
              </div>
              <div className="h-8 w-px bg-white/30 hidden md:block" />
              {listing.bedrooms > 0 && (
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">{listing.bedrooms}</div>
                  <div className="text-xs text-white/70 uppercase tracking-wide">Beds</div>
                </div>
              )}
              {listing.bathrooms > 0 && (
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">{listing.bathrooms}{listing.halfBathrooms ? `½` : ''}</div>
                  <div className="text-xs text-white/70 uppercase tracking-wide">Baths</div>
                </div>
              )}
              {listing.sqft > 0 && (
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">{formatSqft(listing.sqft)}</div>
                  <div className="text-xs text-white/70 uppercase tracking-wide">Sq Ft</div>
                </div>
              )}
              {listing.yearBuilt && (
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">{listing.yearBuilt}</div>
                  <div className="text-xs text-white/70 uppercase tracking-wide">Year Built</div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <a
                href="#contact"
                className="px-8 py-3.5 rounded-full font-bold text-white text-sm uppercase tracking-wider transition hover:opacity-90"
                style={{ backgroundColor: '#c9a84c' }}
              >
                Request a Showing
              </a>
              <a
                href="#gallery"
                className="px-8 py-3.5 rounded-full font-bold text-white text-sm uppercase tracking-wider border-2 border-white/60 hover:bg-white/20 transition"
              >
                View Photos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <Gallery photos={listing.photos} address={listing.address} />

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16" id="details">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a2744' }}>About This Property</h2>
                <div className="h-0.5 w-16 mb-6" style={{ backgroundColor: '#c9a84c' }} />
                <p className="text-gray-600 leading-relaxed text-lg">{listing.description}</p>
              </div>
            )}

            {/* Property Details Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a2744' }}>Property Details</h2>
              <div className="h-0.5 w-16 mb-6" style={{ backgroundColor: '#c9a84c' }} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Price', value: formatPrice(listing.price) },
                  { label: 'Bedrooms', value: listing.bedrooms || '—' },
                  { label: 'Bathrooms', value: listing.bathrooms ? `${listing.bathrooms}${listing.halfBathrooms ? ` + ½` : ''}` : '—' },
                  { label: 'Square Feet', value: listing.sqft ? formatSqft(listing.sqft) : '—' },
                  { label: 'Lot Size', value: listing.lotSize || '—' },
                  { label: 'Year Built', value: listing.yearBuilt || '—' },
                  { label: 'Garage', value: listing.garage || '—' },
                  { label: 'Stories', value: listing.stories || '—' },
                  { label: 'Property Type', value: listing.propertyType || '—' },
                  { label: 'MLS #', value: listing.mlsNumber || '—' },
                  { label: 'Annual Taxes', value: listing.annualTaxes ? formatPrice(listing.annualTaxes) : '—' },
                  { label: 'HOA', value: listing.hoaFee ? `${formatPrice(listing.hoaFee)}/${listing.hoaFrequency || 'mo'}` : 'None' },
                ].filter(d => d.value !== '—').map((detail) => (
                  <div key={detail.label} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{detail.label}</div>
                    <div className="font-semibold text-gray-800">{String(detail.value)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a2744' }}>Features & Amenities</h2>
                <div className="h-0.5 w-16 mb-6" style={{ backgroundColor: '#c9a84c' }} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {listing.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <span className="text-amber-500 font-bold">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* School Info */}
            {(listing.elementarySchool || listing.middleSchool || listing.highSchool) && (
              <div>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a2744' }}>Schools</h2>
                <div className="h-0.5 w-16 mb-6" style={{ backgroundColor: '#c9a84c' }} />
                <div className="space-y-3">
                  {listing.elementarySchool && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Elementary</span>
                      <span className="font-medium text-gray-800">{listing.elementarySchool}</span>
                    </div>
                  )}
                  {listing.middleSchool && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Middle School</span>
                      <span className="font-medium text-gray-800">{listing.middleSchool}</span>
                    </div>
                  )}
                  {listing.highSchool && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">High School</span>
                      <span className="font-medium text-gray-800">{listing.highSchool}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-8" id="contact">
            {/* Showing Request Form */}
            <ShowingRequestForm propertyAddress={fullAddress} />

            {/* Agent Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                {listing.agentPhoto ? (
                  <Image
                    src={listing.agentPhoto}
                    alt={listing.agentName}
                    width={64}
                    height={64}
                    className="rounded-full object-cover border-2 border-amber-400"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                    style={{ backgroundColor: '#1a2744' }}
                  >
                    {listing.agentName?.[0] || 'A'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{listing.agentName}</h3>
                  {listing.brokerageName && <p className="text-sm text-gray-500">{listing.brokerageName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                {listing.agentPhone && (
                  <a
                    href={`tel:${listing.agentPhone}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-amber-600 transition"
                  >
                    <span>📞</span> {listing.agentPhone}
                  </a>
                )}
                {listing.agentEmail && (
                  <a
                    href={`mailto:${listing.agentEmail}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-amber-600 transition"
                  >
                    <span>✉️</span> {listing.agentEmail}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapEmbed
        address={listing.address}
        city={listing.city}
        state={listing.state}
        zip={listing.zip}
        latitude={listing.latitude}
        longitude={listing.longitude}
      />

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 mt-8" style={{ backgroundColor: '#1a2744' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/70 text-sm">
            {listing.brokerageName && <span className="font-semibold text-white">{listing.brokerageName}</span>}
            {listing.agentName && <span> · Listed by {listing.agentName}</span>}
          </div>
          {listing.mlsNumber && (
            <div className="text-white/50 text-xs">MLS# {listing.mlsNumber}</div>
          )}
          <div className="text-white/50 text-xs">
            © {new Date().getFullYear()} All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
