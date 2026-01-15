import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const SAJTMASKIN_URL = 'https://sajtmaskin-1.onrender.com'

export default function SajtmaskinPage() {
  // NOTE: Sajtmaskin sets X-Frame-Options=DENY, so it cannot be embedded in an iframe.
  // Robust solution: redirect the user to the real app.
  redirect(SAJTMASKIN_URL)
}
