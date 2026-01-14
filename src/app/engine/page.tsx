import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const ENGINE_URL = "https://sajtmaskin-1.onrender.com";

export default function EnginePage() {
  redirect(ENGINE_URL);
}


