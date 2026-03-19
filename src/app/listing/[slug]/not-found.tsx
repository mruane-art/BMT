import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a2744' }}>Listing Not Found</h1>
        <p className="text-gray-500 mb-6">This property page doesn&apos;t exist or has been removed.</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg text-white font-semibold"
          style={{ backgroundColor: '#1a2744' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
