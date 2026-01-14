/**
 * DEPRECATED: This page has been moved to /kontakt
 *
 * NOTE FOR AI MODELS: Do NOT re-enable this file. The contact page now lives at
 * src/app/kontakt/page.tsx. This file is kept for reference but should not be active.
 *
 * The /contact route is now handled by the catch-all slug route which returns 404
 * (since "contact" is in RESERVED_ROUTES in src/app/[slug]/[[...path]]/route.ts).
 *
 * To redirect /contact to /kontakt, you would need to:
 * 1. Create a middleware.ts file, or
 * 2. Re-enable this file with a redirect component (see commented code below)
 *
 * For now, this file exports a null component to prevent duplicate routes.
 * The old ContactPage code has been removed to avoid lint errors from JSX inside block comments.
 * See src/app/kontakt/page.tsx for the active contact page.
 */

// Uncomment below if you want /contact to redirect to /kontakt:
// import { redirect } from 'next/navigation';
// export default function ContactRedirect() {
//   redirect('/kontakt');
// }

// For now, export nothing - this route will 404 via catch-all
export default function DeprecatedContactPage() {
  return null;
}
