/**
 * NotFound — 404 page.
 * Shown when a user navigates to an unknown route.
 */

import { Link } from "wouter";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-teal-100">404</p>
        <h1 className="text-3xl font-bold text-gray-900 -mt-6">Page not found</h1>
        <p className="mt-4 text-gray-500 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
