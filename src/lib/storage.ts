import fs from 'fs';
import path from 'path';
import { Listing } from '@/types/listing';

const DATA_FILE = path.join(process.cwd(), 'data', 'listings.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

export function getAllListings(): Listing[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function getListingById(id: string): Listing | null {
  const listings = getAllListings();
  return listings.find((l) => l.id === id) || null;
}

export function getListingBySlug(slug: string): Listing | null {
  const listings = getAllListings();
  return listings.find((l) => l.slug === slug) || null;
}

export function saveListing(listing: Listing): void {
  const listings = getAllListings();
  const idx = listings.findIndex((l) => l.id === listing.id);
  if (idx >= 0) {
    listings[idx] = listing;
  } else {
    listings.unshift(listing);
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(listings, null, 2));
}

export function deleteListing(id: string): void {
  const listings = getAllListings();
  const filtered = listings.filter((l) => l.id !== id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
}

export function generateSlug(address: string, city: string): string {
  return `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
