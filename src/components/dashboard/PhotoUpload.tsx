'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      try {
        const formData = new FormData();
        acceptedFiles.forEach((f) => formData.append('files', f));
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        onChange([...photos, ...data.urls]);
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    },
    [photos, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    multiple: true,
  });

  const removePhoto = (idx: number) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  const movePhoto = (from: number, to: number) => {
    const arr = [...photos];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          isDragActive ? 'border-amber-400 bg-amber-50' : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-400 border-t-transparent" />
            Uploading photos…
          </div>
        ) : isDragActive ? (
          <p className="text-amber-600 font-medium">Drop photos here…</p>
        ) : (
          <div>
            <div className="text-4xl mb-2">📷</div>
            <p className="text-gray-600 font-medium">Drag & drop listing photos here</p>
            <p className="text-gray-400 text-sm mt-1">or click to browse · JPG, PNG, WEBP · multiple files OK</p>
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} · Drag to reorder · First photo is the hero image
          </p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {photos.map((photo, idx) => (
              <div key={photo} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                  <Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                </div>
                {idx === 0 && (
                  <div className="absolute top-1 left-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    Hero
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {idx > 0 && (
                    <button
                      onClick={() => movePhoto(idx, idx - 1)}
                      className="bg-white text-gray-800 rounded p-1 text-xs hover:bg-amber-50"
                      title="Move left"
                    >←</button>
                  )}
                  <button
                    onClick={() => removePhoto(idx)}
                    className="bg-red-500 text-white rounded p-1 text-xs hover:bg-red-600"
                    title="Remove"
                  >✕</button>
                  {idx < photos.length - 1 && (
                    <button
                      onClick={() => movePhoto(idx, idx + 1)}
                      className="bg-white text-gray-800 rounded p-1 text-xs hover:bg-amber-50"
                      title="Move right"
                    >→</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
