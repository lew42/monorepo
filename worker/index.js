// worker/index.js — /api/* router. THE PRODUCTION ENTRY (eventually): this file
// never imports worker/dev.js (identity.md ruling 3) — there is nothing here to
// disable, because the dev-login route does not exist in this module at all.
//
// Everything else falls through to env.ASSETS.fetch(request) — defensive only:
// wrangler.dev.jsonc's run_worker_first is scoped to ["/api/*"], so a non-/api
// request should never actually reach this worker.

import { verify, readCookie, DEV_SECRET_FALLBACK } from "./session.js";
import { can } from "./can.js";
import { me } from "./me.js";
export { Room } from "./room.js";   // re-exported so whichever module wrangler binds the DO class to (this file, or dev.js locally) can find it

function json(data, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}

// The router's one call to session.js — every route below gets a resolved user
// (or null) without touching a cookie itself.
async function resolveUser(request, env) {
    const token = readCookie(request);
    const payload = await verify(token, env.SESSION_SECRET || DEV_SECRET_FALLBACK);
    if (!payload) return null;

    const row = await env.DB.prepare("SELECT id, handle, avatar_url, token_epoch FROM users WHERE id = ?")
        .bind(payload.uid).first();
    if (!row || row.token_epoch !== payload.te) return null;   // token_epoch bumped since signing = revoked

    return { id: row.id, handle: row.handle, avatar_url: row.avatar_url, role: payload.role, banned: !!payload.banned };
}

export async function route(request, env) {
    const url = new URL(request.url);
    const user = await resolveUser(request, env);

    if (url.pathname === "/api/me") {
        return json(me(user));
    }

    if (url.pathname === "/api/room") {
        // identity.md ruling 4: the ROUTER calls can(), not the handler — every
        // /api/* route is refused before dispatch, so there is no call site to
        // forget. (Anonymous and every seeded role can read/connect; a ban is
        // the room's own instant check, not a role rule — see worker/room.js.)
        if (!can(user, "read")) return json({ error: "forbidden" }, 403);

        const roomUrl = url.searchParams.get("url");
        if (!roomUrl) return json({ error: "missing ?url=" }, 400);

        const id = env.ROOM.idFromName(roomUrl);
        const stub = env.ROOM.get(id);

        const headers = new Headers(request.headers);
        headers.set("X-Resolved-User", JSON.stringify(user));
        return stub.fetch(new Request(request, { headers }));
    }

    if (url.pathname.startsWith("/api/")) return json({ error: "not found" }, 404);

    return env.ASSETS.fetch(request);
}

export default { fetch: route };
