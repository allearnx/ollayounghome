import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const LIMIT = 200; // requests per IP per window

type Bucket = { count: number; resetAt: number };

// Best-effort in-memory limiter (per Edge isolate).
// This reduces bot/scanner noise but is not a perfect DDoS defense.
const buckets = new Map<string, Bucket>();

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = req.headers.get('x-real-ip');
  if (xri) return xri.trim();
  // Best-effort fallback when proxy headers are missing.
  return 'unknown';
}

function notFound(): Response {
  return new Response('Not Found', {
    status: 404,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Hide /admin entirely (common scanner target)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return notFound();
  }

  // Rate limit /backoffice to reduce brute-force / scanner noise
  if (pathname === '/backoffice' || pathname.startsWith('/backoffice/')) {
    const now = Date.now();
    const ip = getClientIp(req);
    const key = `${ip}`;
    const bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return NextResponse.next();
    }

    bucket.count += 1;
    if (bucket.count > LIMIT) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store',
          'retry-after': String(retryAfter),
        },
      });
    }

    // basic cleanup to prevent unbounded growth
    if (buckets.size > 5000) {
      buckets.forEach((v, k) => {
        if (now >= v.resetAt) buckets.delete(k);
      });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/backoffice/:path*'],
};

