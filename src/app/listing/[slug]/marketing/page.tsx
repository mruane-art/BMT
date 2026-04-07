import { notFound } from 'next/navigation';
import { getAllListings, getListingBySlug } from '@/lib/storage';
import { Listing, SocialPost, OnlineListing } from '@/types/listing';

export async function generateStaticParams() {
  const listings = await getAllListings();
  return listings.map((l) => ({ slug: l.slug }));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function daysOnMarket(listingDate?: string) {
  if (!listingDate) return null;
  const listed = new Date(listingDate + 'T00:00:00');
  const now = new Date();
  const diff = Math.floor((now.getTime() - listed.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

const PLATFORM_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  facebook:  { label: 'Facebook',   color: '#1877F2', bg: '#EBF3FF', icon: 'f' },
  instagram: { label: 'Instagram',  color: '#E1306C', bg: '#FCE4EC', icon: '📷' },
  twitter:   { label: 'Twitter / X',color: '#000000', bg: '#F0F0F0', icon: '𝕏' },
  linkedin:  { label: 'LinkedIn',   color: '#0077B5', bg: '#E7F4FB', icon: 'in' },
  tiktok:    { label: 'TikTok',     color: '#010101', bg: '#F2F2F2', icon: '♪' },
  youtube:   { label: 'YouTube',    color: '#FF0000', bg: '#FFEBEE', icon: '▶' },
  pinterest: { label: 'Pinterest',  color: '#E60023', bg: '#FFEBEE', icon: 'P' },
  other:     { label: 'Social',     color: '#6b7280', bg: '#F3F4F6', icon: '◎' },
};

const SITE_META: Record<string, { label: string; color: string; bg: string }> = {
  zillow:  { label: 'Zillow',      color: '#006AFF', bg: '#E8F0FF' },
  realtor: { label: 'Realtor.com', color: '#D92228', bg: '#FFEBEC' },
  redfin:  { label: 'Redfin',      color: '#CD2727', bg: '#FFEBEC' },
  homes:   { label: 'Homes.com',   color: '#1B5E20', bg: '#E8F5E9' },
  trulia:  { label: 'Trulia',      color: '#5A4FCF', bg: '#EDE7F6' },
  mls:     { label: 'MLS',         color: '#1a2744', bg: '#E8EAEF' },
  other:   { label: 'Other',       color: '#6b7280', bg: '#F3F4F6' },
};

const CATEGORY_META: Record<string, { label: string; color: string; dot: string }> = {
  digital: { label: 'Digital',  color: '#1a2744', dot: 'bg-blue-500' },
  social:  { label: 'Social',   color: '#E1306C', dot: 'bg-pink-500' },
  print:   { label: 'Print',    color: '#6b7280', dot: 'bg-gray-500' },
  event:   { label: 'Event',    color: '#c9a84c', dot: 'bg-amber-500' },
  other:   { label: 'Other',    color: '#6b7280', dot: 'bg-gray-400' },
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
      <div className="text-4xl font-extrabold mb-1" style={{ color: color || '#1a2744' }}>
        {value}
      </div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function SocialCard({ post }: { post: SocialPost }) {
  const meta = PLATFORM_META[post.platform] || PLATFORM_META.other;
  const hasStats = post.reach || post.likes || post.shares || post.comments;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100" style={{ backgroundColor: meta.bg }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: meta.color }}
        >
          {meta.icon}
        </div>
        <div>
          <div className="font-bold text-gray-900">{meta.label}</div>
          {post.postDate && <div className="text-xs text-gray-500">{formatDate(post.postDate)}</div>}
        </div>
        {post.postUrl && (
          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full text-white transition hover:opacity-80"
            style={{ backgroundColor: meta.color }}
          >
            View Post →
          </a>
        )}
      </div>
      {post.description && (
        <div className="px-5 py-3 text-sm text-gray-600">{post.description}</div>
      )}
      {hasStats && (
        <div className="px-5 py-3 flex gap-4 text-sm border-t border-gray-100">
          {post.reach ? <span className="text-gray-600"><strong className="text-gray-900">{post.reach.toLocaleString()}</strong> reach</span> : null}
          {post.likes ? <span className="text-gray-600"><strong className="text-gray-900">{post.likes.toLocaleString()}</strong> likes</span> : null}
          {post.shares ? <span className="text-gray-600"><strong className="text-gray-900">{post.shares.toLocaleString()}</strong> shares</span> : null}
          {post.comments ? <span className="text-gray-600"><strong className="text-gray-900">{post.comments.toLocaleString()}</strong> comments</span> : null}
        </div>
      )}
    </div>
  );
}

function OnlinePill({ ol }: { ol: OnlineListing }) {
  const meta = SITE_META[ol.site] || SITE_META.other;
  const name = ol.site === 'other' ? (ol.siteName || 'Other') : meta.label;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: meta.color }}
        >
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-gray-900 text-sm">{name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-2 h-2 rounded-full ${ol.active ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs text-gray-500">{ol.active ? 'Live' : 'Inactive'}</span>
          </div>
        </div>
        {ol.views != null && (
          <div className="ml-auto text-right">
            <div className="text-xl font-bold" style={{ color: meta.color }}>{ol.views.toLocaleString()}</div>
            <div className="text-xs text-gray-400">views</div>
          </div>
        )}
      </div>
      {ol.url && (
        <a
          href={ol.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold underline underline-offset-2 truncate"
          style={{ color: meta.color }}
        >
          View Listing →
        </a>
      )}
    </div>
  );
}

export default async function MarketingReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const m = listing.marketing || {};
  const dom = daysOnMarket(m.listingDate);
  const totalReach = m.totalReach ?? (m.socialPosts || []).reduce((sum, p) => sum + (p.reach || 0), 0);
  const heroPhoto = listing.photos?.[0];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 420 }}>
        {heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroPhoto} alt={listing.address} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #2d4a7a 100%)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(26,39,68,0.55) 0%, rgba(26,39,68,0.90) 100%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-16 text-white">
          <div className="mb-3">
            {m.sellerName && (
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">
                Prepared exclusively for {m.sellerName}
              </p>
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{listing.address}</h1>
            <p className="text-white/80 text-lg mt-1">{listing.city}, {listing.state} {listing.zip}</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-6 items-center">
            <span className="text-3xl font-bold" style={{ color: '#c9a84c' }}>{formatPrice(listing.price)}</span>
            <span className="bg-white/20 backdrop-blur rounded-full px-3 py-1 text-sm font-semibold">{listing.bedrooms} bd · {listing.bathrooms} ba · {listing.sqft.toLocaleString()} sqft</span>
            {listing.mlsNumber && (
              <span className="bg-white/10 backdrop-blur rounded-full px-3 py-1 text-xs font-medium">MLS# {listing.mlsNumber}</span>
            )}
            <span
              className="rounded-full px-3 py-1 text-xs font-bold uppercase"
              style={{
                backgroundColor: listing.status === 'active' ? '#16a34a' : listing.status === 'pending' ? '#d97706' : listing.status === 'sold' ? '#dc2626' : '#6b7280',
              }}
            >
              {listing.status}
            </span>
          </div>
          {m.listingDate && (
            <p className="mt-4 text-white/60 text-sm">Listed {formatDate(m.listingDate)}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── Summary Stats ────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Marketing At a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dom != null && <StatCard label="Days on Market" value={dom} color="#1a2744" />}
            {m.totalViews != null && <StatCard label="Online Views" value={m.totalViews.toLocaleString()} sub="across all platforms" color="#2563eb" />}
            {m.totalShowings != null && <StatCard label="Showings" value={m.totalShowings} color="#16a34a" />}
            {m.totalInquiries != null && <StatCard label="Inquiries" value={m.totalInquiries} color="#c9a84c" />}
            {totalReach > 0 && <StatCard label="Social Reach" value={totalReach.toLocaleString()} sub="total impressions" color="#E1306C" />}
            {(m.openHouses || []).length > 0 && <StatCard label="Open Houses" value={(m.openHouses || []).length} color="#7c3aed" />}
          </div>
        </section>

        {/* ── Agent Message ─────────────────────────────────── */}
        {m.agentMessage && (
          <section>
            <div className="rounded-2xl p-6 border-l-4" style={{ backgroundColor: '#f0f3fa', borderColor: '#1a2744' }}>
              <div className="flex gap-4 items-start">
                {listing.agentPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listing.agentPhoto} alt={listing.agentName} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
                )}
                <div>
                  <p className="text-gray-700 leading-relaxed">{m.agentMessage}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <p className="font-semibold text-sm" style={{ color: '#1a2744' }}>{listing.agentName}</p>
                    {listing.brokerageName && <span className="text-gray-400 text-xs">· {listing.brokerageName}</span>}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Online Presence ───────────────────────────────── */}
        {(m.onlineListings || []).length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Where Your Home Is Listed Online</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(m.onlineListings || []).map((ol, i) => (
                <OnlinePill key={i} ol={ol} />
              ))}
              {/* Always show MLS if number provided and not already listed */}
              {listing.mlsNumber && !(m.onlineListings || []).find((o) => o.site === 'mls') && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#1a2744' }}>ML</div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">MLS</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">MLS# {listing.mlsNumber}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Social Media ──────────────────────────────────── */}
        {(m.socialPosts || []).length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Social Media Marketing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(m.socialPosts || []).map((post, i) => (
                <SocialCard key={i} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* ── Showing Service ───────────────────────────────── */}
        {(m.showingServiceName || m.showingServiceUrl) && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Showings</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: '#E8F5E9' }}>
                🏡
              </div>
              <div>
                <p className="font-bold text-gray-900">{m.showingServiceName || 'Showing Service'}</p>
                {m.totalShowings != null && (
                  <p className="text-sm text-gray-500">{m.totalShowings} showing{m.totalShowings !== 1 ? 's' : ''} scheduled</p>
                )}
                {m.showingServiceUrl && (
                  <a
                    href={m.showingServiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold mt-1 inline-block underline underline-offset-2"
                    style={{ color: '#1a2744' }}
                  >
                    View Showing Portal →
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Open Houses ───────────────────────────────────── */}
        {(m.openHouses || []).length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Open Houses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(m.openHouses || []).map((oh, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="rounded-xl p-3 text-center flex-shrink-0 min-w-[56px]"
                      style={{ backgroundColor: '#f0f3fa' }}
                    >
                      {oh.date && (
                        <>
                          <div className="text-xs font-bold uppercase" style={{ color: '#c9a84c' }}>
                            {new Date(oh.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-2xl font-extrabold" style={{ color: '#1a2744' }}>
                            {new Date(oh.date + 'T00:00:00').getDate()}
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{oh.date ? formatDate(oh.date) : 'TBD'}</p>
                      <p className="text-sm text-gray-500">{formatTime(oh.startTime)} – {formatTime(oh.endTime)}</p>
                      {oh.attendance != null && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold text-gray-900">{oh.attendance}</span> {oh.attendance === 1 ? 'visitor' : 'visitors'}
                        </p>
                      )}
                      {oh.notes && <p className="text-xs text-gray-400 mt-1">{oh.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Marketing Activities Timeline ─────────────────── */}
        {(m.activities || []).length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Marketing Timeline</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {[...(m.activities || [])].sort((a, b) => (a.date > b.date ? -1 : 1)).map((act, i, arr) => {
                const catMeta = CATEGORY_META[act.category || 'other'] || CATEGORY_META.other;
                return (
                  <div key={i} className={`flex gap-4 px-6 py-4 ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-1 ${catMeta.dot}`} />
                      {i !== arr.length - 1 && <div className="w-px bg-gray-200 flex-1 mt-1" />}
                    </div>
                    <div className="pb-1 flex-1">
                      <div className="flex items-start gap-3 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{act.title}</span>
                        <span className="text-xs rounded-full px-2 py-0.5 bg-gray-100 text-gray-500 font-medium">{catMeta.label}</span>
                        {act.completed && <span className="text-xs rounded-full px-2 py-0.5 bg-green-100 text-green-700 font-medium">✓ Done</span>}
                      </div>
                      {act.description && <p className="text-xs text-gray-400 mt-0.5">{act.description}</p>}
                      {act.date && <p className="text-xs text-gray-400 mt-0.5">{formatDate(act.date)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Property Summary ──────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Property Details</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'List Price', value: formatPrice(listing.price) },
                { label: 'Bedrooms', value: listing.bedrooms ? `${listing.bedrooms} beds` : null },
                { label: 'Bathrooms', value: listing.bathrooms ? `${listing.bathrooms} baths` : null },
                { label: 'Square Feet', value: listing.sqft ? `${listing.sqft.toLocaleString()} sqft` : null },
                { label: 'Lot Size', value: listing.lotSize || null },
                { label: 'Year Built', value: listing.yearBuilt ? String(listing.yearBuilt) : null },
                { label: 'Garage', value: listing.garage || null },
                { label: 'Property Type', value: listing.propertyType || null },
                { label: 'MLS Number', value: listing.mlsNumber || null },
                { label: 'Annual Taxes', value: listing.annualTaxes ? formatPrice(listing.annualTaxes) : null },
                { label: 'HOA Fee', value: listing.hoaFee ? `${formatPrice(listing.hoaFee)}/${listing.hoaFrequency || 'mo'}` : null },
              ].filter((r) => r.value != null).map((row) => (
                <div key={row.label}>
                  <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{row.label}</div>
                  <div className="font-semibold text-gray-900 mt-0.5">{row.value}</div>
                </div>
              ))}
            </div>
            {listing.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Description</div>
                <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Agent Card ────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Your Agent</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6 flex-wrap">
            {listing.agentPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.agentPhoto} alt={listing.agentName} className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shadow flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-xl font-extrabold" style={{ color: '#1a2744' }}>{listing.agentName}</p>
              {listing.agentTeam && <p className="text-sm text-gray-500">{listing.agentTeam}</p>}
              {listing.brokerageName && <p className="text-sm text-gray-500">{listing.brokerageName}</p>}
            </div>
            <div className="flex flex-col gap-2">
              {listing.agentPhone && (
                <a href={`tel:${listing.agentPhone}`} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition">
                  <span>📞</span> {listing.agentPhone}
                </a>
              )}
              {listing.agentEmail && (
                <a href={`mailto:${listing.agentEmail}`} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition">
                  <span>✉️</span> {listing.agentEmail}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="text-center text-xs text-gray-400 pb-8">
          <p>This marketing report was prepared by {listing.agentName}{listing.brokerageName ? ` · ${listing.brokerageName}` : ''}.</p>
          <p className="mt-1">Report generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
        </footer>
      </div>
    </div>
  );
}
