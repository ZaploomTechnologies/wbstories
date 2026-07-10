import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/middleware/auth-guard";

// The admin UI itself now lives in the separate admin-app project, which
// proxies its /api/admin/* and /api/auth/* calls here (see
// admin-app/next.config.ts). This app has no /admin page tree left to
// protect — it only needs to guard those API routes directly.
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiAdminPath = pathname.startsWith("/api/admin");

  if (isApiAdminPath) {
    const session = await verifyAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
