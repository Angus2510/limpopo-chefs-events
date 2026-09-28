import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "lca_events_admin";

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function getSecret() {
  const secret = process.env.ADMIN_PANEL_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword || !getSecret()) return false;
  return (
    constantTimeEqual(username, expectedUsername) &&
    constantTimeEqual(password, expectedPassword)
  );
}

export function getAdminSessionToken() {
  const secret = getSecret();
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update("limpopo-events-admin")
    .digest("hex");
}

export function isValidAdminSession(token: string | undefined) {
  const expected = getAdminSessionToken();
  return Boolean(token && expected && constantTimeEqual(token, expected));
}
