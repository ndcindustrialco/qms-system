/**
 * Cached Microsoft Graph App-Only Access Token
 *
 * Azure AD Client Credentials tokens have a ~3600s lifetime.
 * This module caches the token in Redis to avoid a round-trip to Azure
 * on every MS Graph call (email send, user fetch, etc.).
 *
 * Cache key:  graph:app_token
 * TTL:        3540s (expire 1 minute before actual token expiry)
 */

import { redis } from "@/lib/redis";

const CACHE_KEY = "graph:app_token";
const CACHE_TTL_SEC = 3540; // 59 minutes — Azure tokens live for 60 minutes

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

async function fetchFreshToken(): Promise<string> {
  const tenantId = process.env.AZURE_AD_TENANT_ID!;
  const clientId = process.env.AZURE_AD_CLIENT_ID!;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to acquire app-only access token: ${res.status} ${errorText}`);
  }

  const data = (await res.json()) as TokenResponse;
  return data.access_token;
}

/**
 * Returns a valid MS Graph app-only access token.
 * Reads from Redis cache first; fetches from Azure AD on miss.
 */
export async function getGraphToken(): Promise<string> {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) return cached;
  } catch (err) {
    // Redis unavailable — fall through to fetch fresh token
    console.warn("[graph-token] Redis unavailable, fetching fresh token:", err);
  }

  const token = await fetchFreshToken();

  try {
    await redis.set(CACHE_KEY, token, "EX", CACHE_TTL_SEC);
  } catch (err) {
    // Cache write failure is non-fatal
    console.warn("[graph-token] Failed to cache token:", err);
  }

  return token;
}
