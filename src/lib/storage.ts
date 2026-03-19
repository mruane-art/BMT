import fs from 'fs';
import path from 'path';
import { Listing } from '@/types/listing';

// ---------------------------------------------------------------------------
// Local file-based storage (used when POSTGRES_URL is not set — local dev)
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
// Vercel Postgres storage (used when POSTGRES_URL is set — Vercel deployment)
// ---------------------------------------------------------------------------

async function pgEnsureTable() {
  const { sql } = await import('@vercel/postgres');
  await sql`
    CREATE TABLE IF NOT EXISTS listings (
      id   TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      data JSONB NOT NULL
    )
  `;
}

async function pgGetAll(): Promise<Listing[]> {
  const { sql } = await import('@vercel/postgres');
  await pgEnsureTable();
  const result = await sql`
    SELECT data FROM listings
    ORDER BY (data->>'createdAt') DESC
  `;
  return result.rows.map((r) => r.data as Listing);
}

async function pgGetById(id: string): Promise<Listing | null> {
  const { sql } = await import('@vercel/postgres');
  await pgEnsureTable();
  const result = await sql`SELECT data FROM listings WHERE id = ${id}`;
  return (result.rows[0]?.data as Listing) ?? null;
}

async function pgGetBySlug(slug: string): Promise<Listing | null> {
  const { sql } = await import('@vercel/postgres');
  await pgEnsureTable();
  const result = await sql`SELECT data FROM listings WHERE slug = ${slug}`;
  return (result.rows[0]?.data as Listing) ?? null;
}

async function pgSave(listing: Listing): Promise<void> {
  const { sql } = await import('@vercel/postgres');
  await pgEnsureTable();
  const jsonStr = JSON.stringify(listing);
  await sql`
    INSERT INTO listings (id, slug, data)
    VALUES (${listing.id}, ${listing.slug}, ${jsonStr})
    ON CONFLICT (id) DO UPDATE SET
      slug = ${listing.slug},
      data = ${jsonStr}
  `;
}

async function pgDelete(id: string): Promise<void> {
  const { sql } = await import('@vercel/postgres');
  await pgEnsureTable();
  await sql`DELETE FROM listings WHERE id = ${id}`;
}

// ---------------------------------------------------------------------------
// Public async API — automatically uses Postgres on Vercel, files locally
// ---------------------------------------------------------------------------

const usePostgres = () => !!process.env.POSTGRES_URL;

export async function getAllListings(): Promise<Listing[]> {
  if (usePostgres()) return pgGetAll();
  return fileGetAll();
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (usePostgres()) return pgGetById(id);
  return fileGetAll().find((l) => l.id === id) ?? null;
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (usePostgres()) return pgGetBySlug(slug);
  return fileGetAll().find((l) => l.slug === slug) ?? null;
}

export async function saveListing(listing: Listing): Promise<void> {
  if (usePostgres()) return pgSave(listing);
  fileSave(listing);
}

export async function deleteListing(id: string): Promise<void> {
  if (usePostgres()) return pgDelete(id);
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
