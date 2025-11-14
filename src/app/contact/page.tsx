import { redirect } from 'next/navigation';

/**
 * /contact är utfasad – gör en permanent redirect till den nya sidan
 */
export default function ContactRedirectPage() {
  redirect('/starta-projekt');
}

