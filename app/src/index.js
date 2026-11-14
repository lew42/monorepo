// The auth app's Worker. /api/* lands here; every other path is a static file (or the SPA fallback).
import { verify_google_token } from "./google.js";
export { DocDO } from "./doc.js";
export { UserDO } from "./user.js";
import { MAX_AGE, new_cookie_value, token_from, sha256, set_cookie, clear_cookie } from "./session.js";

const json = (data, status = 200, headers = {}) =>
	new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });
const fail = (status, error) => json({ error }, status);

const is_local = url => url.hostname === "localhost" || url.hostname === "127.0.0.1";
const is_admin = (env, c) => !!c && ((env.ADMIN_GOOGLE_SUB && c.sub === env.ADMIN_GOOGLE_SUB) || (env.ADMIN_EMAIL && c.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()));

async function current_user(request, env){
	const token = await token_from(request, env.SESSION_SECRET);
	if (!token) return null;
	return await env.DB.prepare(
		"SELECT u.id, u.google_sub, u.email, u.name, u.avatar_url, u.role, u.created_at, u.last_login FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?"
	).bind(await sha256(token), Date.now()).first();
}

// Upsert the user, open a session, answer with the cookie.
async function sign_in(request, env, claims, url){
	const now = Date.now();
	const user = await env.DB.prepare(
		`INSERT INTO users (google_sub, email, name, avatar_url, role, created_at, last_login) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
		 ON CONFLICT(google_sub) DO UPDATE SET email = ?2, name = ?3, avatar_url = ?4, last_login = ?6,
		   role = CASE WHEN ?5 = 'admin' THEN 'admin' ELSE users.role END
		 RETURNING id, google_sub, email, name, avatar_url, role, created_at, last_login`
	).bind(claims.sub, claims.email, claims.name ?? null, claims.picture ?? null, is_admin(env, claims) ? "admin" : "user", now).first();
	const { token, value } = await new_cookie_value(env.SESSION_SECRET);
	await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
		.bind(await sha256(token), user.id, now, now + MAX_AGE * 1000).run();
	await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now).run();
	return json({ user }, 200, { "set-cookie": set_cookie(value, url.protocol === "https:") });
}

const FEED = [
	["Welcome", "You are signed in. This feed is mock data for now."],
	["Live editing", "Documents will edit live through a Durable Object per document."],
	["Notifications", "Tap the bell to allow notifications on this device."],
	["Install", "Add this app to your home screen for a full-screen window."],
	["Staging", "staging.lew42.com has its own database, seeded with fake people."],
	["Roles", "The first admin is bootstrapped from a secret; admins see everyone."],
];
const feed = () => FEED.map(([title, body], i) => ({ id: i + 1, title, body, at: Date.now() - i * 3600_000 }));

const need_user = async (request, env) => (await current_user(request, env)) ?? Promise.reject(Object.assign(new Error("sign in first"), { status: 401 }));
const new_id = () => [...crypto.getRandomValues(new Uint8Array(4))].map(b => b.toString(16).padStart(2, "0")).join("");

const handlers = {
	"GET /api/settings": async (request, env) => env.USER_DO.get(env.USER_DO.idFromName("user:" + (await need_user(request, env)).id)).fetch("https://do/settings"),

	"PUT /api/settings": async (request, env) => env.USER_DO.get(env.USER_DO.idFromName("user:" + (await need_user(request, env)).id))
		.fetch("https://do/settings", { method: "PUT", body: await request.text() }),

	"GET /api/docs": async (request, env) => {
		await need_user(request, env);
		const { results } = await env.DB.prepare("SELECT d.id, d.title, d.created_at, u.name AS owner FROM docs d JOIN users u ON u.id = d.owner_id ORDER BY d.created_at DESC").all();
		return json({ docs: results });
	},

	"POST /api/docs": async (request, env) => {
		const me = await need_user(request, env);
		const { title } = await request.json().catch(() => ({}));
		const doc = { id: new_id(), title: String(title || "Untitled").slice(0, 80), owner_id: me.id, created_at: Date.now() };
		await env.DB.prepare("INSERT INTO docs (id, title, owner_id, created_at) VALUES (?, ?, ?, ?)").bind(doc.id, doc.title, doc.owner_id, doc.created_at).run();
		return json({ doc });
	},

	"GET /api/config": async (request, env, url) => json({
		client_id: env.GOOGLE_CLIENT_ID || "", env: env.ENV_NAME || "local", dev_login: env.DEV_LOGIN === "1" && is_local(url),
	}),

	"GET /api/me": async (request, env) => json({ user: await current_user(request, env) }),

	"POST /api/auth/google": async (request, env, url) => {
		const { credential } = await request.json().catch(() => ({}));
		if (!credential) return fail(400, "no credential sent");
		let claims;
		try { claims = await verify_google_token(credential, { client_id: env.GOOGLE_CLIENT_ID }); }
		catch (err){ return fail(401, "Google token rejected: " + err.message); }
		return sign_in(request, env, claims, url);
	},

	// Local only (wrangler dev): lets tests sign in without Google. Never set DEV_LOGIN in staging or production.
	"POST /api/dev/login": async (request, env, url) => {
		if (env.DEV_LOGIN !== "1" || !is_local(url)) return fail(404, "not found");
		const { handle = "alice" } = await request.json().catch(() => ({}));
		const claims = { sub: "dev:" + handle, email: handle + "@dev.local", name: handle, picture: null };
		return sign_in(request, env, claims, url);   // handle "admin" is the admin when .dev.vars has ADMIN_EMAIL=admin@dev.local
	},

	"POST /api/auth/logout": async (request, env, url) => {
		const token = await token_from(request, env.SESSION_SECRET);
		if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
		return json({ ok: true }, 200, { "set-cookie": clear_cookie(url.protocol === "https:") });
	},

	"GET /api/feed": async (request, env) => (await current_user(request, env)) ? json({ items: feed() }) : fail(401, "sign in first"),

	"GET /api/admin/users": async (request, env) => {
		const me = await current_user(request, env);
		if (!me) return fail(401, "sign in first");
		if (me.role !== "admin") return fail(403, "admins only");
		const { results } = await env.DB.prepare("SELECT id, email, name, avatar_url, role, created_at, last_login FROM users ORDER BY last_login DESC").all();
		return json({ users: results });
	},
};

export default {
	async fetch(request, env){
		const url = new URL(request.url);
		const [, api, kind, doc_id, tail] = request.method === "GET" ? url.pathname.split("/") : [];
		if (api === "api" && kind === "doc" && tail === "ws" && doc_id?.length === 8) return this.open_socket(request, env, url, doc_id);
		const handler = handlers[request.method + " " + url.pathname];
		if (!handler) return url.pathname.startsWith("/api/") ? fail(404, "no such endpoint") : env.ASSETS.fetch(request);
		if (request.method === "POST" && request.headers.get("origin") && request.headers.get("origin") !== url.origin) return fail(403, "cross-origin POST refused");
		try { return await handler(request, env, url); }
		catch (err){ return fail(err.status || 500, err.message); }
	},

	// One WebSocket per open document: signed in, same origin, and the document must exist. The Durable Object trusts the headers: only this Worker can reach it.
	async open_socket(request, env, url, id){
		if (request.headers.get("upgrade") !== "websocket") return fail(426, "expected a WebSocket");
		if (request.headers.get("origin") !== url.origin) return fail(403, "cross-origin socket refused");
		const me = await current_user(request, env);
		if (!me) return fail(401, "sign in first");
		if (!await env.DB.prepare("SELECT 1 FROM docs WHERE id = ?").bind(id).first()) return fail(404, "no such document");
		const forward = new Request(request, { headers: new Headers(request.headers) });
		forward.headers.set("x-user-id", String(me.id));
		forward.headers.set("x-user-name", me.name || me.email);
		forward.headers.set("x-doc-id", id);
		return env.DOC_DO.get(env.DOC_DO.idFromName("doc:" + id)).fetch(forward);
	},
};
