// worker/session.js: HMAC-SHA256 sign/verify over WebCrypto (/notes/auth/ §3). No dependency: WebCrypto is in the Workers runtime.
// index.js verifies on every request and signs after a Google login; dev.js signs for the dev login. Nothing here is dev-only.
//
// The payload is `{uid, te, exp}` (plus `banned` from the dev login): who, their token_epoch (the revoke-everywhere counter, §3) and
// an expiry in unix seconds. The role is never in the cookie; index.js reads it from D1 on each request. verify() only returns what
// was signed. The secret is env.SESSION_SECRET, with no fallback: a Worker without one has no valid sessions.

export const COOKIE = "s";
export const MAX_AGE = 30 * 86400;

export function b64u(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
        .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
export function unb64u(str) {
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

// null on anything wrong: a bad cookie is the same as no cookie, never a throw.
export async function verify(token, secret) {
    if (!token || !secret) return null;
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

// HttpOnly + Secure + SameSite=Lax (/notes/auth/ §3). Chrome treats http://localhost as a secure context, so Secure still round-trips there.
export function setCookie(token, maxAgeSeconds = MAX_AGE) {
    return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}
export function clearCookie() {
    return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
