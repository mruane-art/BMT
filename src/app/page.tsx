'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/types/listing';
import ListingForm from '@/components/dashboard/ListingForm';

type FormData = Omit<Listing, 'id' | 'slug' | 'createdAt' | 'updatedAt'>;

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

function StatusBadge({ status }: { status: Listing['status'] }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${colors[status] || colors.draft}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [modal, setModal] = useState<null | 'create' | { edit: Listing }>(null);
  const [filter, setFilter] = useState<'all' | Listing['status']>('all');
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    const res = await fetch('/api/listings');
    const data = await res.json();
    setListings(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleCreate = async (data: FormData) => {
    await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setModal(null);
    fetchListings();
  };

  const handleEdit = async (id: string, data: FormData) => {
    await fetch(`/api/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setModal(null);
    fetchListings();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    await fetch(`/api/listings/${id}`, { method: 'DELETE' });
    fetchListings();
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/listing/${slug}`;
    navigator.clipboard.writeText(url);
    setCopyMsg(slug);
    setTimeout(() => setCopyMsg(null), 2000);
  };

  const filtered = filter === 'all' ? listings : listings.filter((l) => l.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ backgroundColor: '#1a2744' }} className="text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Property Listings</h1>
            <p className="text-white/60 text-sm mt-0.5">Single-property landing pages dashboard</p>
          </div>
          <button
            onClick={() => setModal('create')}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition hover:opacity-90"
            style={{ backgroundColor: '#c9a84c', color: '#1a2744' }}
          >
            + New Listing
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: listings.length, color: '#1a2744' },
            { label: 'Active', count: listings.filter((l) => l.status === 'active').length, color: '#16a34a' },
            { label: 'Pending', count: listings.filter((l) => l.status === 'pending').length, color: '#d97706' },
            { label: 'Draft', count: listings.filter((l) => l.status === 'draft').length, color: '#6b7280' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.count}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label} Listings</div>
            </div>
          ))}
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'pending', 'sold', 'draft'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
                  filter === f
                    ? 'text-white shadow'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                }`}
                style={filter === f ? { backgroundColor: '#1a2744' } : {}}
              >
                {f === 'all' ? `All (${listings.length})` : `${f} (${listings.filter((l) => l.status === f).length})`}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2 rounded-lg border transition ${view === v ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                title={v}
              >
                {v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No listings yet</h2>
            <p className="text-gray-400 mb-6">Create your first property listing to get started.</p>
            <button
              onClick={() => setModal('create')}
              className="px-8 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#c9a84c', color: '#1a2744' }}
            >
              + Create First Listing
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                {/* Photo */}
                <div className="relative bg-gray-200" style={{ height: 200 }}>
                  {listing.photos?.[0] ? (
                    <Image src={listing.photos[0]} alt={listing.address} fill className="object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-5xl">🏠</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={listing.status} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="text-xl font-bold text-gray-900 mb-0.5">{formatPrice(listing.price)}</div>
                  <p className="font-semibold text-gray-700 text-sm">{listing.address}</p>
                  <p className="text-gray-400 text-sm">{listing.city}, {listing.state} {listing.zip}</p>

                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    {listing.bedrooms > 0 && <span>{listing.bedrooms} bed</span>}
                    {listing.bathrooms > 0 && <span>{listing.bathrooms} bath</span>}
                    {listing.sqft > 0 && <span>{listing.sqft.toLocaleString()} sqft</span>}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Link
                      href={`/listing/${listing.slug}`}
                      target="_blank"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition hover:opacity-90"
                      style={{ backgroundColor: '#1a2744' }}
                    >
                      View Page
                    </Link>
                    <button
                      onClick={() => copyLink(listing.slug)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600 transition"
                    >
                      {copyMsg === listing.slug ? '✓ Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => setModal({ edit: listing })}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-5 hover:shadow-md transition">
                <div className="relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-200" style={{ width: 80, height: 60 }}>
                  {listing.photos?.[0] ? (
                    <Image src={listing.photos[0]} alt={listing.address} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">🏠</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-900">{listing.address}</span>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="text-gray-400 text-sm">{listing.city}, {listing.state} · {formatPrice(listing.price)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/listing/${listing.slug}`}
                    target="_blank"
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white"
                    style={{ backgroundColor: '#1a2744' }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => copyLink(listing.slug)}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600"
                  >
                    {copyMsg === listing.slug ? '✓ Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => setModal({ edit: listing })}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-red-100 text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold" style={{ color: '#1a2744' }}>
                {modal === 'create' ? 'Create New Listing' : `Edit: ${(modal as { edit: Listing }).edit.address}`}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ListingForm
                initial={modal !== 'create' ? (modal as { edit: Listing }).edit : undefined}
                isEdit={modal !== 'create'}
                onSave={
                  modal === 'create'
                    ? handleCreate
                    : (data) => handleEdit((modal as { edit: Listing }).edit.id, data)
                }
                onCancel={() => setModal(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
