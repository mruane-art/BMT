import fs from 'fs';
import path from 'path';
import { Listing } from '@/types/listing';

// ---------------------------------------------------------------------------
// Local file-based storage (used when BLOB_READ_WRITE_TOKEN is not set)
// ---------------------------------------------------------------------------

const DATA_FILE = path.join(process.cwd(), 'data', 'listings.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

function fileGetAll(): Listing[] {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function fileSave(listing: Listing): void {
  const listings = fileGetAll();
  const idx = listings.findIndex((l) => l.id === listing.id);
  if (idx >= 0) listings[idx] = listing;
  else listings.unshift(listing);
  fs.writeFileSync(DATA_FILE, JSON.stringify(listings, null, 2));
}

function fileDelete(id: string): void {
  const listings = fileGetAll().filter((l) => l.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(listings, null, 2));
}

// ---------------------------------------------------------------------------
// Vercel Blob storage for listings (used when BLOB_READ_WRITE_TOKEN is set)
// Stores the full listings array as a single JSON file in Blob.
// ---------------------------------------------------------------------------

const LISTINGS_BLOB_PATH = 'data/listings.json';

async function blobGetAll(): Promise<Listing[]> {
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: LISTINGS_BLOB_PATH });
    const blob = blobs.find((b) => b.pathname === LISTINGS_BLOB_PATH);
    if (!blob) return [];
    const res = await fetch(blob.url, { cache: 'no-store' });
    return res.json();
  } catch {
    return [];
  }
}

async function blobWriteAll(listings: Listing[]): Promise<void> {
  const { put } = await import('@vercel/blob');
  await put(LISTINGS_BLOB_PATH, JSON.stringify(listings, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

// ---------------------------------------------------------------------------
// Public async API — uses Blob on Vercel, local JSON file in dev
// ---------------------------------------------------------------------------

const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export async function getAllListings(): Promise<Listing[]> {
  if (useBlob()) return blobGetAll();
  return fileGetAll();
}

export async function getListingById(id: string): Promise<Listing | null> {
  const listings = await getAllListings();
  return listings.find((l) => l.id === id) ?? null;
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const listings = await getAllListings();
  return listings.find((l) => l.slug === slug) ?? null;
}

export async function saveListing(listing: Listing): Promise<void> {
  if (useBlob()) {
    const listings = await blobGetAll();
    const idx = listings.findIndex((l) => l.id === listing.id);
    if (idx >= 0) listings[idx] = listing;
    else listings.unshift(listing);
    await blobWriteAll(listings);
    return;
  }
  fileSave(listing);
}

export async function deleteListing(id: string): Promise<void> {
  if (useBlob()) {
    const listings = await blobGetAll();
    await blobWriteAll(listings.filter((l) => l.id !== id));
    return;
  }
  fileDelete(id);
}

export function generateSlug(address: string, city: string): string {
  return `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
