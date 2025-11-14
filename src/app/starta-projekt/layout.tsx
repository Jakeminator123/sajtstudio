// Force dynamic rendering for this route
// This prevents Next.js from trying to prerender the page
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default function StartaProjektLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
