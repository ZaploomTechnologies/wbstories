import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import type { AdminJwtPayload } from "@/interfaces/jwt-payload.interface";

// jose is WebCrypto-based (unlike jsonwebtoken, which needs Node's `crypto`),
// so this same util works identically in Edge middleware, Node route
// handlers, and a VPS `next start` process. Importing the scoped
// `jose/jwt/sign` and `jose/jwt/verify` entry points (instead of the root
// barrel) keeps jose's JWE/compression code — which we never use and which
// isn't Edge-runtime-supported — out of the bundle entirely.
//
// Reads process.env.JWT_SECRET directly rather than through the shared
// `env` config: Next's Edge bundler (middleware imports this file) only
// inlines env vars it can statically see as `process.env.KEY` — the config
// module's `schema.safeParse(process.env)` is a dynamic whole-object read
// that it can't analyze, so nothing gets inlined into the Edge bundle and
// every field, including unrelated ones like MONGODB_URI, reads as undefined.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}
const secretKey = new TextEncoder().encode(JWT_SECRET);
const ALGORITHM = "HS256";
const EXPIRES_IN = "7d";

export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secretKey);
}

export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
