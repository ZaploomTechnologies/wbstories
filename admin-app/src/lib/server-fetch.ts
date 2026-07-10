import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/constants/cookie.constants";

// Server Components run inside this app's own Node process, so unlike the
// browser they never auto-attach the session cookie to an outgoing fetch —
// it has to be forwarded by hand. Talks straight to API_ORIGIN rather than
// through next.config.ts's rewrite (that rewrite only applies to requests
// that hit this app's own HTTP server, not to server-side fetches it makes
// itself).
export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:3000";

  return fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      ...(token ? { cookie: `${ADMIN_TOKEN_COOKIE}=${token}` } : {}),
    },
    cache: "no-store",
  });
}
