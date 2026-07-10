import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken } from "@/utils/jwt.util";
import { ADMIN_TOKEN_COOKIE } from "@/constants/cookie.constants";

// This app has no anonymous surface except /login — every other route is
// the admin UI. The main app's /api/admin/* routes still enforce auth
// independently (this only saves a redirect round-trip for page loads).
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
