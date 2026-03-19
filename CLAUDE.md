@AGENTS.md

---

# Project Knowledge Base

## What This Project Is

A **real estate property listing platform** built with Next.js 16. It lets an agent create and manage individual property landing pages. Each property gets its own public URL with a hero image, photo gallery, map, agent contact card, and a showing request form.

---

## Folder & File Structure

```
BMT/
├── src/
│   ├── app/
│   │   ├── page.tsx                        Dashboard (home page — lists all properties)
│   │   ├── layout.tsx                      Root layout with metadata
│   │   ├── globals.css                     Global CSS (font variables, base styles)
│   │   ├── favicon.ico
│   │   ├── api/
│   │   │   ├── listings/
│   │   │   │   ├── route.ts                GET all listings / POST new listing
│   │   │   │   └── [id]/route.ts           GET / PUT / DELETE a single listing
│   │   │   └── upload/
│   │   │       └── route.ts                POST — uploads photos to /public/uploads
│   │   └── listing/
│   │       └── [slug]/
│   │           ├── page.tsx                Public property detail page
│   │           └── not-found.tsx           404 page
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ListingForm.tsx             Multi-tab form to create or edit a listing
│   │   │   ├── PhotoUpload.tsx             Drag-and-drop photo uploader with reorder
│   │   │   └── MLSImport.tsx               CSV importer with automatic field mapping
│   │   └── listing/
│   │       ├── Gallery.tsx                 Photo gallery with lightbox
│   │       ├── LeafletMap.tsx              Leaflet.js interactive map
│   │       ├── MapEmbed.tsx                Geocodes address and renders LeafletMap
│   │       └── ShowingRequestForm.tsx      Contact form (submits via Formspree)
│   ├── lib/
│   │   └── storage.ts                      Read/write listings to /data/listings.json
│   └── types/
│       └── listing.ts                      TypeScript interface for a Listing object
├── public/
│   └── uploads/                            Created at runtime — stores uploaded photos
├── data/
│   └── listings.json                       The "database" — a flat JSON file
├── next.config.ts                          Allows all remote image domains
├── tsconfig.json                           Strict mode, path alias @/* → ./src/*
├── postcss.config.mjs                      Tailwind v4 via @tailwindcss/postcss
├── eslint.config.mjs
└── package.json
```

---

## Pages & Sections

### Dashboard (`/`)
- Shows all listings in a card grid or list view
- Filter bar: All / Active / Pending / Sold / Draft
- Each card shows hero image, price, address, status badge, bed/bath/sqft
- Actions: Edit, Delete, View Live Page
- "Add New Listing" button opens ListingForm modal
- Stats bar at top: total listings, active count

### Property Detail Page (`/listing/[slug]`)
Sections in order:
1. **Sticky nav bar** — address, price, status badge, "Request a Showing" anchor link
2. **Hero** — full-screen first photo with overlaid address and price
3. **Gallery** — photo thumbnails with lightbox
4. **Main content** (left column):
   - About This Property (description)
   - Property Details grid (beds, baths, sqft, lot, year built, garage, stories, MLS #)
   - Features & Amenities (bulleted list)
   - Schools (elementary, middle, high)
   - Financial Details (HOA fee, annual taxes)
5. **Sidebar** (right column):
   - Showing Request Form
   - Agent Card (photo, name, phone, email, brokerage)
6. **Map** — interactive Leaflet map, auto-geocodes from address if no lat/long provided
7. **Footer** — brokerage disclaimer text

### 404 Page (`/listing/[slug]/not-found.tsx`)
- Simple message with a link back to the dashboard

---

## Design Choices

### Colors
| Role | Value |
|------|-------|
| Primary navy (headers, buttons, text accents) | `#1a2744` |
| Accent gold (CTA buttons, highlights, underlines) | `#c9a84c` |
| Status: Active | `#16a34a` (green) |
| Status: Pending | `#d97706` (amber) |
| Status: Sold | `#dc2626` (red) |
| Status: Draft | `#6b7280` (gray) |
| Background | White / `#f3f4f6` light gray |

Brand colors (`#1a2744` navy and `#c9a84c` gold) are applied via inline styles, not Tailwind config, because Tailwind v4 is used without a custom theme file.

### Typography
- **Font**: Arial, Helvetica, sans-serif (system font stack — no external font loaded)
- **Headings**: Bold or semibold, often uppercase with letter-spacing
- **Tailwind scale**: xs through 6xl used throughout

### Layout
- Max container width: `max-w-7xl`
- Responsive grid: 1 column on mobile → 2–3 columns on desktop
- Cards: `rounded-xl`, `shadow-sm` / `shadow-lg`, `border border-gray-100`
- Buttons: `rounded-lg` or `rounded-full`, Tailwind padding classes
- Modals: `fixed` overlay, `z-50`, centered with flexbox
- Sticky nav on property detail page uses `backdrop-blur`

---

## Data & Storage

### How data is stored
No database. Listings are stored in `/data/listings.json` (a flat JSON array). The `lib/storage.ts` module handles all reads and writes.

### Listing object shape
```typescript
{
  id: string;                          // UUID
  slug: string;                        // URL slug, e.g. "123-main-st-austin-a1b2"
  status: 'active' | 'pending' | 'sold' | 'draft';
  createdAt: string;
  updatedAt: string;

  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood?: string;
  county?: string;

  price: number;
  propertyType: string;               // e.g. "Single Family"
  listingType: 'For Sale' | 'For Rent' | 'Sold';

  bedrooms: number;
  bathrooms: number;
  halfBathrooms?: number;
  sqft: number;
  lotSize?: string;
  yearBuilt?: number;
  garage?: string;
  stories?: number;

  description: string;
  features: string[];

  photos: string[];                   // Array of image URLs
  virtualTourUrl?: string;
  videoUrl?: string;

  latitude?: number;
  longitude?: number;

  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentPhoto?: string;
  brokerageName?: string;

  mlsNumber?: string;
  elementarySchool?: string;
  middleSchool?: string;
  highSchool?: string;
  hoaFee?: number;
  hoaFrequency?: string;             // 'monthly' | 'quarterly' | 'annually'
  annualTaxes?: number;
}
```

### Slug format
`{address-city}-{first-8-chars-of-uuid}` — generated by `generateSlug()` in `storage.ts`.

---

## External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| **Formspree** | Receives showing request form submissions by email | Form ID `mvzwweoe` hardcoded in `ShowingRequestForm.tsx` |
| **OpenStreetMap / Nominatim** | Geocodes property address to lat/long for map | No API key required |
| **Google Maps** | "Open in Google Maps" fallback link on map section | No API key required |

---

## Tech Stack

| Package | Version | Role |
|---------|---------|------|
| next | 16.2.0 | Framework |
| react | 19.2.4 | UI |
| tailwindcss | ^4 | Styling |
| leaflet + react-leaflet | 1.9.4 / 5.0.0 | Interactive maps |
| react-dropzone | ^15 | Photo drag-and-drop |
| papaparse | ^5.5 | CSV parsing for MLS import |
| uuid | ^13 | Generating listing IDs |

**Note**: This uses **Next.js 16** and **React 19** — these are newer versions that may differ from training data. Always read `node_modules/next/dist/docs/` before touching framework-level code.

---

## User Preferences

- **No coding knowledge** — the user relies entirely on Claude to write all code
- **Minimal interruptions** — ask as few questions as possible; make decisions and proceed
- **Deployment target**: Vercel (free tier, auto-deploys from GitHub)
- **No custom Tailwind theme** — brand colors are applied via inline `style={{}}` props
- **File-based storage** is intentional for simplicity — no database setup required
- The project is in the GitHub repo `mruane-art/BMT`
- Active development branch: `claude/property-landing-page-AioRS`

---

## Key Implementation Notes

- `LeafletMap.tsx` is loaded with `next/dynamic` (no SSR) to avoid server-side DOM errors from Leaflet
- Leaflet's default icon URLs break in Next.js — a custom icon is manually configured in `LeafletMap.tsx`
- All brand colors (`#1a2744`, `#c9a84c`) are applied as inline styles, not Tailwind classes, since there is no `tailwind.config.js` with a custom theme
- `generateStaticParams()` is used on the property detail page for static generation
- Photos are stored locally in `/public/uploads/` — this will not persist on Vercel (serverless). For production, photos should be stored in a cloud bucket (e.g. Cloudinary, S3)
- The showing request form submits to Formspree — no backend email logic needed
