/**
 * Redirect legacy /contact route to /kontakt.
 * Keep this file minimal to avoid duplicate route logic.
 */
import { redirect } from 'next/navigation'

export default function ContactRedirect() {
  redirect('/kontakt')
}
