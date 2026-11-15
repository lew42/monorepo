// worker/index.js: the /api/* router and THE PRODUCTION ENTRY (`main` of staging and production). It never imports worker/dev.js
// (identity.md ruling 3): the dev login is absent from this bundle, not disabled in it.
//
// Every route is one row in ROUTES: "METHOD /path" -> [action, handler]. The router resolves the user once, runs can(user, action)
// BEFORE the handler, so there is no call site to forget (identity.md ruling 4), and worker/api.test.mjs walks the table.
// A request that is not /api/* falls through to env.ASSETS (defensive: run_worker_first is ["/api/*"]).

import { verify, sign, readCookie, setCookie, clearCookie, MAX_AGE } from "./session.js";
import { can } from "./can.js";
import { verify_google_token } from "./google.js";
import { likes, toggle } from "./likes.js";
import { pages, upsert } from "./pages.js";
export { Room } from "./room.js";          // re-exported so wrangler finds the Durable Object classes in `main`
export { UserDO } from "./settings.js";

const json = (data, status = 200, headers = {}) =>
    new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });
const fail = (status, error) => json({ error }, status);
const is_local = url => url.hostname === "localhost" || url.hostname === "127.0.0.1";

// The user the cookie names, read from D1 (role, handle and token_epoch are the database's, never the cookie's), or null.
async function resolveUser(request, env) {
    if (!env.SESSION_SECRET) return null;
    const payload = await verify(readCookie(request), env.SESSION_SECRET);
    if (!payload) return null;
    const row = await env.DB.prepare("SELECT id, provider, handle, avatar_url, role, token_epoch, created_at, last_login FROM users WHERE id = ?")
        .bind(payload.uid).first();
    if (!row || row.token_epoch !== payload.te) return null;   // token_epoch bumped since signing = revoked
    const { token_epoch, ...user } = row;
    return { ...user, banned: !!payload.banned };
}

export const new_id = () => [...crypto.getRandomValues(new Uint8Array(4))].map(b => b.toString(16).padStart(2, "0")).join("");

// Signs a user in: the cookie carries only who and when; the role is looked up on every request.
export async function cookie_for(row, env, extra = {}) {
    const payload = { uid: row.id, te: row.token_epoch, exp: Math.floor(Date.now() / 1000) + MAX_AGE, ...extra };
    return setCookie(await sign(payload, env.SESSION_SECRET), MAX_AGE);
}

const is_admin = (env, claims) => !!env.ADMIN_EMAIL && claims.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();

const FEED = [
    ["Welcome", "You are signed in. This feed is mock data for now."],
    ["Live editing", "Documents edit live through a Room (a Durable Object) per document."],
    ["Notifications", "Tap the bell to allow notifications on this device."],
    ["Install", "Add this app to your home screen for a full-screen window."],
    ["Staging", "staging.lew42.com has its own database, seeded with fake people."],
    ["Roles", "The first admin is bootstrapped from a secret; admins see everyone."],
];

const settings_stub = (env, user) => env.USER_DO.get(env.USER_DO.idFromName("user:" + user.id));

const ROUTES = {
    "GET /api/config": ["public", async (r, env, url) => json({ client_id: env.GOOGLE_CLIENT_ID || "", env: env.ENV_NAME || "local", dev_login: env.DEV_LOGIN === "1" && is_local(url) })],

    "GET /api/me": ["read", async (r, env, url, user) => json(user
        ? { handle: user.handle, roles: [user.role], user }
        : { anonymous: true, user: null })],

    "POST /api/auth/google": ["public", async (request, env, url) => {
        if (!env.SESSION_SECRET) return fail(500, "SESSION_SECRET is not configured");
        const { credential } = await request.json().catch(() => ({}));
        if (!credential) return fail(400, "no credential sent");
        let claims;
        try { claims = await verify_google_token(credential, { client_id: env.GOOGLE_CLIENT_ID }); }
        catch (err) { return fail(401, "Google token rejected: " + err.message); }
        const now = Math.floor(Date.now() / 1000);
        const row = await env.DB.prepare(
            `INSERT INTO users (provider, provider_id, handle, avatar_url, role, created_at, last_login) VALUES ('google', ?1, ?2, ?3, ?4, ?5, ?5)
             ON CONFLICT(provider, provider_id) DO UPDATE SET handle = ?2, avatar_url = ?3, last_login = ?5,
               role = CASE WHEN ?4 = 'admin' AND users.role NOT IN ('owner', 'admin') THEN 'admin' ELSE users.role END
             RETURNING id, provider, handle, avatar_url, role, token_epoch, created_at, last_login`
        ).bind(claims.sub, claims.name || claims.email.split("@")[0], claims.picture ?? null, is_admin(env, claims) ? "admin" : "member", now).first();
        const { token_epoch, ...user } = row;
        return json({ user }, 200, { "set-cookie": await cookie_for(row, env) });
    }],

    "POST /api/auth/logout": ["public", async () => json({ ok: true }, 200, { "set-cookie": clearCookie() })],

    // Revoke every session of this user, on every device: one counter, no sessions table (/notes/auth/ §3).
    "POST /api/auth/logout-all": ["write", async (r, env, url, user) => {
        await env.DB.prepare("UPDATE users SET token_epoch = token_epoch + 1 WHERE id = ?").bind(user.id).run();
        return json({ ok: true }, 200, { "set-cookie": clearCookie() });
    }],

    "GET /api/feed": ["write", async () => json({ items: FEED.map(([title, body], i) => ({ id: i + 1, title, body, at: Date.now() - i * 3600_000 })) })],

    "GET /api/settings": ["write", async (r, env, url, user) => settings_stub(env, user).fetch("https://do/settings")],
    "PUT /api/settings": ["write", async (request, env, url, user) => settings_stub(env, user).fetch("https://do/settings", { method: "PUT", body: await request.text() })],

    "GET /api/docs": ["write", async (r, env) => {
        const { results } = await env.DB.prepare("SELECT d.id, d.title, d.created_at, u.handle AS owner FROM docs d JOIN users u ON u.id = d.owner_id ORDER BY d.created_at DESC").all();
        return json({ docs: results });
    }],
    "POST /api/docs": ["write", async (request, env, url, user) => {
        const { title } = await request.json().catch(() => ({}));
        const doc = { id: new_id(), title: String(title || "Untitled").slice(0, 80), owner_id: user.id, created_at: Date.now() };
        await env.DB.prepare("INSERT INTO docs (id, title, owner_id, created_at) VALUES (?, ?, ?, ?)").bind(doc.id, doc.title, doc.owner_id, doc.created_at).run();
        return json({ doc });
    }],

    "GET /api/admin/users": ["admin", async (r, env) => {
        const { results } = await env.DB.prepare("SELECT id, provider, handle, avatar_url, role, created_at, last_login FROM users ORDER BY last_login DESC, id").all();
        return json({ users: results });
    }],

    "GET /api/likes": ["read", async (r, env, url, user) => {
        const target = url.searchParams.get("url");
        return target ? json(await likes(target, user, env)) : fail(400, "missing ?url=");
    }],
    "POST /api/likes": ["write", async (r, env, url, user) => {
        const target = url.searchParams.get("url");
        return target ? json(await toggle(target, user, env)) : fail(400, "missing ?url=");
    }],

    // Pages are public, like any static file under public/.
    "GET /api/pages": ["public", async (r, env, url) => {
        const under = url.searchParams.get("under");
        return under ? json(await pages(under, env)) : fail(400, "missing ?under=");
    }],
    "PUT /api/pages": ["write", async (request, env) => json(await upsert(await request.json(), env))],
};
export const ROUTE_KEYS = Object.keys(ROUTES);
export const ROUTE_ACTIONS = Object.fromEntries(ROUTE_KEYS.map(k => [k, ROUTES[k][0]]));

// A WebSocket into a Room: the chat room of a url (/api/room?url=) or one document (/api/doc/<id>/ws). The Room trusts the
// X-Resolved-User header: only this Worker can reach it, and it overwrites whatever the client sent.
async function open_socket(request, env, url, user, key) {
    if (request.headers.get("upgrade") !== "websocket") return fail(426, "expected a WebSocket");
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) return fail(403, "cross-origin socket refused");
    const headers = new Headers(request.headers);
    headers.set("X-Resolved-User", JSON.stringify(user));
    return env.ROOM.get(env.ROOM.idFromName(key)).fetch(new Request(request, { headers }));
}

export async function route(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    // Fail closed: the API answers only on the hostnames this stage names. A Git preview URL or a stray workers.dev name gets nothing,
    // so a preview build can never read or write this stage's data.
    const hosts = (env.API_HOSTS || "").split(",").map(h => h.trim()).filter(Boolean);
    if (!hosts.includes(url.hostname)) return fail(503, "the API is not served on this host");

    const user = await resolveUser(request, env);

    const doc = request.method === "GET" && url.pathname.match(/^\/api\/doc\/([0-9a-f]{8})\/ws$/);
    if (doc || (request.method === "GET" && url.pathname === "/api/room")) {
        if (!can(user, doc ? "write" : "read")) return fail(user ? 403 : 401, doc ? "sign in first" : "forbidden");
        if (user?.banned) return new Response("banned", { status: 403 });
        if (doc) {
            if (!await env.DB.prepare("SELECT 1 FROM docs WHERE id = ?").bind(doc[1]).first()) return fail(404, "no such document");
            return open_socket(request, env, url, user, "doc:" + doc[1]);
        }
        const room = url.searchParams.get("url");
        return room ? open_socket(request, env, url, user, room) : fail(400, "missing ?url=");
    }

    const entry = ROUTES[request.method + " " + url.pathname];
    if (!entry) return fail(404, "no such endpoint");
    const [action, handler] = entry;

    // SameSite=Lax still rides a cross-site GET, so a mutation from a browser must come from our own origin. A caller that sends neither
    // header (curl, a test) is not a browser being steered by somebody else's page, which is the whole threat.
    if (request.method !== "GET") {
        const site = request.headers.get("Sec-Fetch-Site"), origin = request.headers.get("origin");
        if ((site && site !== "same-origin") || (origin && origin !== url.origin)) return fail(403, "cross-origin request refused");
    }

    if (action !== "public") {
        if (action !== "read" && user?.banned) return fail(403, "banned");
        if (!can(user, action)) return fail(user ? 403 : 401, action === "admin" ? "admins only" : "sign in first");
    }
    try { return await handler(request, env, url, user); }
    catch (err) { return fail(err.status || 500, err.message); }
}

export default { fetch: route };
