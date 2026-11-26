// worker/index.js: the /api/* router and THE PRODUCTION ENTRY (`main` of staging and production). It never imports worker/dev.js
// (identity.md ruling 3): the dev login is absent from this bundle, not disabled in it.
//
// Every route is one row in ROUTES: "METHOD /path" -> [action, handler]. The router resolves the user once, runs can(user, action)
// BEFORE the handler, so there is no call site to forget (identity.md ruling 4), and worker/api.test.mjs walks the table.
// A request that is not /api/* falls through to env.ASSETS (defensive: run_worker_first is ["/api/*"]).

import { verify, sign, readCookie, setCookie, clearCookie, unb64u, MAX_AGE } from "./session.js";
import { can } from "./can.js";
import { verify_google_token } from "./google.js";
import { likes, toggle } from "./likes.js";
import { pages, upsert } from "./pages.js";
import { send_all, weekly } from "./push.js";
export { Room } from "./room.js";          // re-exported so wrangler finds the Durable Object classes in `main`
export { UserDO } from "./settings.js";

const json = (data, status = 200, headers = {}) =>
    new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });
const fail = (status, error) => json({ error }, status);
// This machine: localhost, 127.0.0.1, or any <name>.localhost (Servex's reverse proxy names a project that way). Never a public name.
export const is_local = url => url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith(".localhost");

// The user the cookie names, read from D1 (role, handle and token_epoch are the database's, never the cookie's), or null.
async function resolveUser(request, env) {
    if (!env.SESSION_SECRET) return null;
    const payload = await verify(readCookie(request), env.SESSION_SECRET);
    if (!payload) return null;
    const row = await env.DB.prepare("SELECT id, provider, handle, avatar_url, role, token_epoch, created_at, last_login FROM users WHERE id = ?")
        .bind(payload.uid).first();
    if (!row || row.token_epoch !== payload.te) return null;   // token_epoch bumped since signing = revoked
    // A cookie with a sid is one sign-in: its sessions row must exist and not be ended. A cookie with none (dev login, minted test cookies) stands on token_epoch alone.
    if (payload.sid && !await env.DB.prepare("SELECT 1 FROM sessions WHERE id = ? AND user_id = ? AND ended_at IS NULL").bind(payload.sid, row.id).first()) return null;
    const { token_epoch, ...user } = row;
    return { ...user, banned: !!payload.banned, sid: payload.sid ?? null };
}

export const new_id = () => [...crypto.getRandomValues(new Uint8Array(4))].map(b => b.toString(16).padStart(2, "0")).join("");

// Signs a user in: the cookie carries only who and when; the role is looked up on every request.
export async function cookie_for(row, env, extra = {}) {
    const payload = { uid: row.id, te: row.token_epoch, exp: Math.floor(Date.now() / 1000) + MAX_AGE, ...extra };
    return setCookie(await sign(payload, env.SESSION_SECRET), MAX_AGE);
}

// One sign-in = one sessions row; its id goes in the cookie as `sid`. Used by Google sign-in, the test sign-in and the dev login.
export async function start_session(env, user_id, request) {
    const sid = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join("");
    await env.DB.prepare("INSERT INTO sessions (id, user_id, created_at, user_agent) VALUES (?, ?, ?, ?)")
        .bind(sid, user_id, Math.floor(Date.now() / 1000), (request.headers.get("user-agent") || "").slice(0, 200)).run();
    return sid;
}

// Both strings hashed first, then compared without stopping at the first difference.
async function same(a, b) {
    const hash = async s => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(s))));
    const [x, y] = await Promise.all([hash(a), hash(b)]);
    let diff = 0;
    for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
    return diff === 0;
}

// A push endpoint is a URL we will POST to, so it must be https and one of the browsers' push services.
const PUSH_HOSTS = /(^|\.)(googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)$/;
const b64u_len = (s, n) => { try { return unb64u(s).length === n; } catch { return false; } };
const push_ok = env => !!env.VAPID_PRIVATE_JWK && !!env.VAPID_PUBLIC;
const has_push = async (env, user) => !!await env.DB.prepare("SELECT 1 FROM push_subs WHERE user_id = ?").bind(user.id).first();

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

// Who each action means, in the words /api/ prints. can.js decides; this only names it.
const WHO = { public: "anyone", read: "anyone, signed in or not", write: "a signed-in member", admin: "an admin or the owner" };

const ROUTES = {
    // The endpoint list, generated from this table (plus the two sockets, which route() handles before the table).
    "GET /api/": ["public", async () => json({ endpoints: [
        ...Object.entries(ROUTES).map(([key, [action]]) => ({ method: key.split(" ")[0], path: key.split(" ")[1], action, who: WHO[action] })),
        { method: "GET", path: "/api/room?url=", action: "read", who: WHO.read, note: "WebSocket: the chat room of a page" },
        { method: "GET", path: "/api/doc/<id>/ws", action: "write", who: WHO.write, note: "WebSocket: one document's Room" },
    ] })],

    "GET /api/config": ["public", async (r, env, url) => json({ client_id: env.GOOGLE_CLIENT_ID || "", env: env.ENV_NAME || "local", dev_login: env.DEV_LOGIN === "1" && is_local(url), vapid_public: env.VAPID_PUBLIC || "" })],

    "GET /api/me": ["read", async (r, env, url, user) => {
        if (!user) return json({ anonymous: true, user: null, push: false, session_id: null });
        const { sid, ...who } = user;
        return json({ handle: who.handle, roles: [who.role], user: who, push: await has_push(env, who), session_id: sid });
    }],

    // Wipes the account: D1 rows (sessions, push subscriptions, likes, documents, the user) and the user's Durable Object storage.
    // A document's Room keeps its own history, but the docs row is gone, so nothing can open it.
    "DELETE /api/me": ["write", async (r, env, url, user) => {
        await env.DB.batch(["sessions", "push_subs", "likes"].map(t => env.DB.prepare(`DELETE FROM ${t} WHERE user_id = ?`).bind(user.id))
            .concat([env.DB.prepare("DELETE FROM docs WHERE owner_id = ?").bind(user.id), env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id)]));
        await settings_stub(env, user).fetch("https://do/settings", { method: "DELETE" });
        return json({ deleted: true, handle: user.handle }, 200, { "set-cookie": clearCookie() });
    }],

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
        return json({ user }, 200, { "set-cookie": await cookie_for(row, env, { sid: await start_session(env, row.id, request) }) });
    }],

    // A secret-gated sign-in for testing a deployed stage before Google's origin list is ready. It exists only where the TEST_LOGIN_KEY
    // secret is set (staging, never production) and answers 404 to everything else, so it is not an open login (identity.md ruling 3).
    "POST /api/auth/test": ["public", async (request, env) => {
        const { key, name } = await request.json().catch(() => ({}));
        if (!env.TEST_LOGIN_KEY || !env.SESSION_SECRET || !await same(key ?? "", env.TEST_LOGIN_KEY)) return fail(404, "no such endpoint");
        const handle = "test-" + (String(name || "visitor").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "visitor");
        const now = Math.floor(Date.now() / 1000);
        const row = await env.DB.prepare(
            `INSERT INTO users (provider, provider_id, handle, role, created_at, last_login) VALUES ('test', ?1, ?1, 'member', ?2, ?2)
             ON CONFLICT(provider, provider_id) DO UPDATE SET last_login = ?2
             RETURNING id, provider, handle, avatar_url, role, token_epoch, created_at, last_login`
        ).bind(handle, now).first();
        const { token_epoch, ...user } = row;
        return json({ user }, 200, { "set-cookie": await cookie_for(row, env, { sid: await start_session(env, row.id, request) }) });
    }],

    // Ends this one session (its sessions row) and clears the cookie. Anyone may call it: signing out when already out is not an error.
    "POST /api/auth/logout": ["public", async (request, env) => {
        const payload = await verify(readCookie(request), env.SESSION_SECRET);
        if (payload?.sid) await env.DB.prepare("UPDATE sessions SET ended_at = ? WHERE id = ? AND ended_at IS NULL").bind(Math.floor(Date.now() / 1000), payload.sid).run();
        return json({ ok: true }, 200, { "set-cookie": clearCookie() });
    }],

    // Revoke every session of this user, on every device: one counter, no sessions table (/notes/auth/ §3).
    "POST /api/auth/logout-all": ["write", async (r, env, url, user) => {
        await env.DB.prepare("UPDATE users SET token_epoch = token_epoch + 1 WHERE id = ?").bind(user.id).run();
        await env.DB.prepare("UPDATE sessions SET ended_at = ? WHERE user_id = ? AND ended_at IS NULL").bind(Math.floor(Date.now() / 1000), user.id).run();
        return json({ ok: true }, 200, { "set-cookie": clearCookie() });
    }],

    // Web push (worker/push.js). The browser's PushSubscription.toJSON() is the body; one row per endpoint, in D1 so the weekly cron reads them all.
    "POST /api/push/subscribe": ["write", async (request, env, url, user) => {
        const { endpoint, keys } = await request.json().catch(() => ({}));
        let host = "";
        try { const u = new URL(endpoint); if (u.protocol === "https:") host = u.hostname; } catch {}
        if (!PUSH_HOSTS.test(host)) return fail(400, "not a browser push endpoint");
        if (!b64u_len(keys?.p256dh, 65) || !b64u_len(keys?.auth, 16)) return fail(400, "bad subscription keys");
        await env.DB.prepare(
            `INSERT INTO push_subs (endpoint, user_id, p256dh, auth, created_at) VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(endpoint) DO UPDATE SET user_id = ?2, p256dh = ?3, auth = ?4`
        ).bind(endpoint, user.id, keys.p256dh, keys.auth, Math.floor(Date.now() / 1000)).run();
        return json({ ok: true, push: true });
    }],
    "DELETE /api/push/subscribe": ["write", async (request, env, url, user) => {
        const { endpoint } = await request.json().catch(() => ({}));
        const res = endpoint
            ? await env.DB.prepare("DELETE FROM push_subs WHERE endpoint = ? AND user_id = ?").bind(endpoint, user.id).run()
            : await env.DB.prepare("DELETE FROM push_subs WHERE user_id = ?").bind(user.id).run();
        return json({ ok: true, removed: res.meta.changes, push: await has_push(env, user) });
    }],
    "POST /api/push/test": ["write", async (r, env, url, user) => {
        if (!push_ok(env)) return fail(503, "push is not configured on this stage");
        const { results: subs } = await env.DB.prepare("SELECT endpoint, p256dh, auth FROM push_subs WHERE user_id = ?").bind(user.id).all();
        const { sent, failed, removed, results } = await send_all(subs, { title: "lew42", body: "Test notification: it works.", url: "/join/" }, env);
        return json({ sent, failed, removed, results: results.map(({ endpoint, ...rest }) => ({ host: new URL(endpoint).hostname, ...rest })) });
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

// The Monday cron (wrangler.jsonc triggers.crons): the weekly note to every subscriber.
export default { fetch: route, scheduled: (event, env, ctx) => { ctx.waitUntil(weekly(env)); } };
