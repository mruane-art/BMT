import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const urls: string[] = [];

  const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (useBlob) {
    // ---------------------------------------------------------------------------
    // Vercel Blob storage — permanent CDN-hosted URLs, works on Vercel deployment
    // ---------------------------------------------------------------------------
    const { put } = await import('@vercel/blob');

    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const bytes = await file.arrayBuffer();
      const blob = await put(filename, bytes, {
        access: 'public',
        contentType: file.type || 'image/jpeg',
      });
      urls.push(blob.url);
    }
  } else {
    // ---------------------------------------------------------------------------
    // Local filesystem — writes to /public/uploads for local development
    // ---------------------------------------------------------------------------
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      urls.push(`/uploads/${filename}`);
    }
  }

  return NextResponse.json({ urls });
}
