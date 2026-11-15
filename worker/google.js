// Verifies a Google Identity Services ID token (an RS256 JWT) with Web Crypto and Google's public keys.
const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

const cache = { keys: null, until: 0 };

const b64url = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), c => c.charCodeAt(0));
const json_part = s => JSON.parse(new TextDecoder().decode(b64url(s)));

export async function fetch_google_keys(force = false, now = Date.now()){
	if (!force && cache.keys && now < cache.until) return cache.keys;
	const res = await fetch(JWKS_URL);
	if (!res.ok) throw new Error("could not fetch Google's signing keys: HTTP " + res.status);
	const max_age = /max-age=(\d+)/.exec(res.headers.get("cache-control") || "")?.[1];
	cache.keys = (await res.json()).keys;
	cache.until = now + (max_age ? +max_age * 1000 : 3600_000);
	return cache.keys;
}

// Returns the token's claims, or throws an Error whose message says exactly what was wrong.
export async function verify_google_token(token, { client_id, fetch_keys = fetch_google_keys, now = Date.now() }){
	if (!client_id) throw new Error("GOOGLE_CLIENT_ID is not configured");
	const parts = String(token).split(".");
	if (parts.length !== 3) throw new Error("not a JWT");
	const [h, p, s] = parts;
	const header = json_part(h);
	if (header.alg !== "RS256") throw new Error("unexpected alg " + header.alg);

	let jwk = (await fetch_keys(false)).find(k => k.kid === header.kid);
	if (!jwk) jwk = (await fetch_keys(true)).find(k => k.kid === header.kid);   // Google rotated keys
	if (!jwk) throw new Error("no Google key with kid " + header.kid);

	const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
	const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(s), new TextEncoder().encode(h + "." + p));
	if (!ok) throw new Error("bad signature");

	const c = json_part(p), sec = Math.floor(now / 1000);
	if (!ISSUERS.includes(c.iss)) throw new Error("bad issuer " + c.iss);
	if (c.aud !== client_id) throw new Error("token is for another client (aud " + c.aud + ")");
	if (!(c.exp > sec)) throw new Error("token expired");
	if (c.iat && c.iat > sec + 120) throw new Error("token issued in the future");
	if (!c.sub) throw new Error("no sub");
	if (c.email_verified !== true && c.email_verified !== "true") throw new Error("email not verified");
	return c;
}
