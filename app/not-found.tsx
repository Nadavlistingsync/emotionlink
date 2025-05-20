import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--muted-background)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card animate-slide-in text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-xl text-[var(--muted)] mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link 
            href="/"
            className="btn-primary inline-flex items-center gap-2"
            aria-label="Return to home page"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
} 