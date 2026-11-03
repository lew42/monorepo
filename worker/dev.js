// worker/dev.js — THE DEV ENTRY. wrangler.dev.jsonc's `main` points here, never
// at index.js. This module imports index.js and adds the one route,
// `/api/dev/login?as=<handle>`; index.js never imports this file, so the
// production entry cannot contain the route at all — identity.md ruling 3, a
// build-time absence, not a disabled feature.
//
// env.DEV_LOGIN === "1" and a localhost host check stay anyway, as the belt:
// they are what stops a `cloudflared` tunnel or `wrangler dev --remote` from
// publishing this route, not the reason production is safe (it's safe because
// this file is never production's `main`).

import worker, { Room } from "./index.js";
import { sign, setCookie, clearCookie, DEV_SECRET_FALLBACK } from "./session.js";

export { Room };   // wrangler binds the DO class from THIS module's exports, since it is `main` here

// The fake roster, matching worker/seed.sql. Not a schema column (identity.md
// ruling 7: the users table is /notes/auth/ §4, unchanged) — a real login would
// derive role from D1's topic/founder rows instead of a literal map.
const ROLES = { alice: "owner", bob: "moderator", carol: "member", dave: "member", eve: "member" };
const BANNED = new Set(["eve"]);

function isLocalHost(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1";
}

async function devLogin(url, env) {
    const handle = url.searchParams.get("as");
    const to = url.searchParams.get("to") || "/";

    if (handle === "none") {
        return new Response(null, { status: 302, headers: { Location: to, "Set-Cookie": clearCookie() } });
    }

    const row = await env.DB.prepare("SELECT id, token_epoch FROM users WHERE handle = ?").bind(handle).first();
    if (!row) return new Response(`unknown dev user "${handle}" — run worker/seed.sql`, { status: 404 });

    const payload = {
        uid: row.id,
        role: ROLES[handle] || "member",
        banned: BANNED.has(handle),
        te: row.token_epoch,
        exp: Math.floor(Date.now() / 1000) + 2592000,
    };
    const token = await sign(payload, env.SESSION_SECRET || DEV_SECRET_FALLBACK);

    return new Response(null, { status: 302, headers: { Location: to, "Set-Cookie": setCookie(token) } });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === "/api/dev/login" && env.DEV_LOGIN === "1" && isLocalHost(url.hostname)) {
            return devLogin(url, env);
        }

        return worker.fetch(request, env, ctx);
    },
};
