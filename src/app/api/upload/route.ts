import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const urls: string[] = [];

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvtdzehn9';
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'bmt-listings';

  if (cloudName && uploadPreset) {
    // -------------------------------------------------------------------------
    // Cloudinary — free CDN image hosting, no extra Vercel config needed
    // -------------------------------------------------------------------------
    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);
      data.append('folder', 'bmt-listings');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: data }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error('Cloudinary upload error:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }

      const result = await res.json();
      urls.push(result.secure_url);
    }
  } else {
    // -------------------------------------------------------------------------
    // Local filesystem — for development only
    // -------------------------------------------------------------------------
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
