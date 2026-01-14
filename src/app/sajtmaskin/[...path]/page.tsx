import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SAJTMASKIN_URL = "https://sajtmaskin-1.onrender.com";

type PageProps = {
  params: Promise<{ path: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function toQueryString(searchParams: Record<string, string | string[] | undefined> | undefined) {
  if (!searchParams) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      for (const item of v) usp.append(k, item);
    } else {
      usp.set(k, v);
    }
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export default async function SajtmaskinPathPage({ params, searchParams }: PageProps) {
  const { path } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const pathPart = path?.length ? `/${path.map(encodeURIComponent).join("/")}` : "";
  const query = toQueryString(resolvedSearchParams);
  const target = `${SAJTMASKIN_URL}${pathPart}${query}`;

  // NOTE: Sajtmaskin sets X-Frame-Options=DENY, so it cannot be embedded in an iframe.
  // Robust solution: redirect the user to the real app.
  redirect(target);
}


