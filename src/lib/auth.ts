import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse, NextRequest } from "next/server";
import { UserRole } from "@/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "church-online-vietnam-sanctuary-reverent-secret-key-2026";
export const AUTH_COOKIE_NAME = "church_auth_token";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  churchSlug: string;
  churchId: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user session from Next.js server cookie store or request
 */
export async function getAuthUser(req?: NextRequest): Promise<AuthTokenPayload | null> {
  try {
    let token = req?.cookies?.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = cookies();
        token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
      } catch {
        // Not in Server Component / Action context
      }
    }
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Attach HTTP-only authentication cookie to response
 */
export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear authentication cookie upon logout
 */
export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
