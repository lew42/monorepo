// worker/session.js — HMAC-SHA256 sign/verify over WebCrypto (/notes/auth/ §3).
// No dependency: WebCrypto is in the Workers runtime. Shared by index.js (verify,
// every request) and dev.js (sign, the one dev-only login route) — nothing here
// is dev-only, so nothing here needs the DEV_LOGIN gate.
//
// Payload carries whatever the minter decides (dev.js embeds the fake role/ban
// for this harness; a real OAuth callback would embed a role derived from D1
// instead) plus `te` (token_epoch, /notes/auth/ §3's revoke-everywhere column)
// and `exp` (unix seconds). verify() only ever RETURNS what was signed — it has
// no opinion on what a payload should contain.

export const COOKIE = "s";

// A real deploy sets env.SESSION_SECRET (a Workers secret); this harness never
// deploys, so wrangler.dev.jsonc's vars carries it instead, with this as the
// belt if that var is ever missing. Not a real secret — never write one here.
export const DEV_SECRET_FALLBACK = "local-dev-insecure-secret-do-not-deploy";

function b64u(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
        .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function unb64u(str) {
    const pad = str.length % 4 ? "=".repeat(4 - (str.length % 4)) : "";
    const bin = atob(str.replaceAll("-", "+").replaceAll("_", "/") + pad);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
}
async function key(secret) {
    return crypto.subtle.importKey(
        "raw", new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function sign(payload, secret) {
    const body = b64u(new TextEncoder().encode(JSON.stringify(payload)));
    const mac = await crypto.subtle.sign("HMAC", await key(secret), new TextEncoder().encode(body));
    return `${body}.${b64u(mac)}`;
}

// null on anything wrong — a bad cookie is the same as no cookie, never a throw.
export async function verify(token, secret) {
    if (!token) return null;
    const [body, mac] = token.split(".");
    if (!body || !mac) return null;
    try {
        const ok = await crypto.subtle.verify("HMAC", await key(secret), unb64u(mac), new TextEncoder().encode(body));
        if (!ok) return null;
        const payload = JSON.parse(new TextDecoder().decode(unb64u(body)));
        if (payload.exp && payload.exp < Date.now() / 1000) return null;
        return payload;
    } catch {
        return null;
    }
}

export function readCookie(request) {
    const header = request.headers.get("Cookie") || "";
    const match = header.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
    return match ? match[1] : null;
}

// HttpOnly + Secure + SameSite=Lax, /notes/auth/ §3's line verbatim. Chrome
// treats http://localhost as a secure context, so Secure still round-trips here
// (assumption 3's other half — see local/page.js).
export function setCookie(token, maxAgeSeconds = 2592000) {
    return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}
export function clearCookie() {
    return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
