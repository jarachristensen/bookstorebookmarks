import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_PASSPHRASE || "curator123";
const COOKIE_NAME = "curator_session";

/**
 * Verify user submitted passphrase against environment secret.
 */
export function verifyPassphrase(input: string): boolean {
  if (!input) return false;
  return input.trim() === ADMIN_SECRET.trim();
}

/**
 * Create a signed HMAC token for the session.
 */
export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac("sha256", ADMIN_SECRET);
  hmac.update(`curator-session:${timestamp}`);
  const signature = hmac.digest("hex");
  return `${timestamp}.${signature}`;
}

/**
 * Verify signature of the session token.
 */
export function verifySessionToken(token: string): boolean {
  if (!token || !token.includes(".")) return false;

  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) return false;

  // Max session age: 30 days
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (isNaN(tokenAge) || tokenAge < 0 || tokenAge > 30 * 24 * 60 * 60 * 1000) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", ADMIN_SECRET);
  hmac.update(`curator-session:${timestamp}`);
  const expectedSig = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSig, "hex")
  );
}

/**
 * Server check to verify if the request holds an active admin session.
 */
export async function getAdminSession(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return false;
    return verifySessionToken(sessionCookie.value);
  } catch {
    return false;
  }
}
