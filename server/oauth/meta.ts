import crypto from "crypto";
import { storage } from "../storage";
import { encrypt } from "../utils/encryption";

const META_API_VERSION = "v19.0";
const META_AUTH_URL = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth`;
const META_TOKEN_URL = `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`;
const META_LONG_LIVED_URL = `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`;
const META_ME_URL = `https://graph.facebook.com/${META_API_VERSION}/me`;

const SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_insights",
  "public_profile",
].join(",");

function getAppCredentials() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("META_APP_ID and META_APP_SECRET environment variables are not set.");
  }
  return { appId, appSecret };
}

function getRedirectUri(baseUrl: string) {
  return `${baseUrl}/api/oauth/meta/callback`;
}

export function generateStateToken(userId: number): string {
  const secret = process.env.ENCRYPTION_KEY ?? "fallback-oauth-secret-32-characters";
  const payload = JSON.stringify({ userId, ts: Date.now(), nonce: crypto.randomBytes(8).toString("hex") });
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig })).toString("base64url");
}

export function verifyStateToken(state: string): { userId: number; ts: number } | null {
  try {
    const secret = process.env.ENCRYPTION_KEY ?? "fallback-oauth-secret-32-characters";
    const { payload, sig } = JSON.parse(Buffer.from(state, "base64url").toString());
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
    const data = JSON.parse(payload);
    if (Date.now() - data.ts > 10 * 60 * 1000) return null; // 10 min expiry
    return { userId: data.userId, ts: data.ts };
  } catch {
    return null;
  }
}

export function buildAuthUrl(userId: number, baseUrl: string): string {
  const { appId } = getAppCredentials();
  const state = generateStateToken(userId);
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getRedirectUri(baseUrl),
    scope: SCOPES,
    response_type: "code",
    state,
  });
  return `${META_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, baseUrl: string): Promise<{
  accessToken: string;
  tokenType: string;
}> {
  const { appId, appSecret } = getAppCredentials();
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: getRedirectUri(baseUrl),
    code,
  });

  const res = await fetch(`${META_TOKEN_URL}?${params.toString()}`);
  const data = await res.json() as any;

  if (data.error) {
    throw new Error(data.error.message ?? "Failed to exchange code for token");
  }

  return { accessToken: data.access_token, tokenType: data.token_type ?? "bearer" };
}

export async function getLongLivedToken(shortToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const { appId, appSecret } = getAppCredentials();
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken,
  });

  const res = await fetch(`${META_LONG_LIVED_URL}?${params.toString()}`);
  const data = await res.json() as any;

  if (data.error) {
    throw new Error(data.error.message ?? "Failed to get long-lived token");
  }

  return { accessToken: data.access_token, expiresIn: data.expires_in ?? 5183944 };
}

export async function getUserInfo(accessToken: string): Promise<{
  id: string;
  name: string;
  accounts?: { data: Array<{ id: string; name: string; access_token: string }> };
}> {
  const params = new URLSearchParams({
    fields: "id,name,accounts{id,name,access_token}",
    access_token: accessToken,
  });
  const res = await fetch(`${META_ME_URL}?${params.toString()}`);
  return res.json() as any;
}

export async function saveMetaAccount(opts: {
  userId: number;
  accessToken: string;
  expiresIn: number;
  userInfo: { id: string; name: string };
  platform: "facebook" | "instagram";
  pageInfo?: { id: string; name: string; access_token: string };
}): Promise<void> {
  const { userId, accessToken, expiresIn, userInfo, platform, pageInfo } = opts;

  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const credJson = JSON.stringify({
    accessToken: pageInfo?.access_token ?? accessToken,
    expiresAt,
    metaUserId: userInfo.id,
    pageId: pageInfo?.id,
  });

  const encryptedCredentials = encrypt(credJson);

  await storage.createSocialAccount({
    userId,
    platform,
    accountName: pageInfo?.name ?? userInfo.name,
    accountHandle: pageInfo ? `${pageInfo.name}` : userInfo.name,
    encryptedCredentials,
    credentialType: "oauth",
    status: "active",
    metadata: {
      metaUserId: userInfo.id,
      pageId: pageInfo?.id,
      tokenExpiresAt: expiresAt,
    },
  });
}
