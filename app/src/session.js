// The session cookie: `<random token>.<hmac>`. The signature rejects forged cookies without a database hit;
// D1 stores only sha256(token), so a session can be revoked by deleting its row.
export const COOKIE = "sid";
export const MAX_AGE = 30 * 86400;

const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

async function hmac(secret, text){
	const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
	return hex(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}
export const sha256 = async text => hex(await crypto.subtle.digest("SHA-256", enc.encode(text)));

export async function new_cookie_value(secret){
	const token = hex(crypto.getRandomValues(new Uint8Array(32)));
	return { token, value: token + "." + await hmac(secret, token) };
}

// Returns the token if the cookie's signature holds, else null.
export async function token_from(request, secret){
	const raw = /(?:^|;\s*)sid=([^;]+)/.exec(request.headers.get("cookie") || "")?.[1];
	if (!raw) return null;
	const [token, sig] = raw.split(".");
	if (!token || !sig) return null;
	return sig === await hmac(secret, token) ? token : null;
}

export const set_cookie = (value, secure) => `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${secure ? "; Secure" : ""}`;
export const clear_cookie = secure => `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
