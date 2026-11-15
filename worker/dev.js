// worker/dev.js: THE DEV ENTRY. The local stage's `main` in wrangler.jsonc points here, never at index.js, and staging and
// production point at index.js. This module imports index.js and adds the dev login; index.js never imports this file, so the
// deployed bundles cannot contain the route at all (identity.md ruling 3): a build-time absence, not a disabled feature.
//
//   POST /api/dev/login {handle}      the UI's dev buttons: sets the cookie, answers {user}
//   GET  /api/dev/login?as=<handle>   a link: sets the cookie, redirects to ?to= (default /); ?as=none signs out
//
// env.DEV_LOGIN === "1" and a localhost host check stay as the belt: they stop a tunnel or `wrangler dev --remote` publishing this
// route. Production is safe because this file is never its `main`.

import worker, { Room, UserDO, cookie_for } from "./index.js";
import { clearCookie } from "./session.js";

export { Room, UserDO };   // wrangler binds the Durable Object classes from THIS module's exports, since it is `main` here

// Not a secret: the local stage has none, and this file is not in the deployed bundles.
const DEV_SECRET = "local-dev-insecure-secret-do-not-deploy";
const BANNED = new Set(["eve"]);   // a ban is a cookie flag here; production's is a KV key (identity.md ruling 2)

const is_local = url => url.hostname === "localhost" || url.hostname === "127.0.0.1";

async function dev_login(request, env, url) {
    const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
    const handle = body.handle ?? url.searchParams.get("as");
    const to = url.searchParams.get("to") || "/";
    const redirect = request.method === "GET";

    if (handle === "none") {
        return redirect
            ? new Response(null, { status: 302, headers: { Location: to, "Set-Cookie": clearCookie() } })
            : Response.json({ user: null }, { headers: { "Set-Cookie": clearCookie() } });
    }

    const row = await env.DB.prepare("SELECT id, provider, handle, avatar_url, role, token_epoch, created_at, last_login FROM users WHERE provider = 'dev' AND provider_id = ?")
        .bind(String(handle)).first();
    if (!row) return new Response(`unknown dev user "${handle}": the dev script applies worker/seed/dev.sql`, { status: 404 });

    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare("UPDATE users SET last_login = ? WHERE id = ?").bind(now, row.id).run();
    const cookie = await cookie_for(row, env, BANNED.has(handle) ? { banned: true } : {});
    const { token_epoch, ...user } = { ...row, last_login: now };
    return redirect
        ? new Response(null, { status: 302, headers: { Location: to, "Set-Cookie": cookie } })
        : Response.json({ user: { ...user, banned: BANNED.has(handle) } }, { headers: { "Set-Cookie": cookie } });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        env = { ...env, SESSION_SECRET: env.SESSION_SECRET || DEV_SECRET };
        if (url.pathname === "/api/dev/login" && env.DEV_LOGIN === "1" && is_local(url)) return dev_login(request, env, url);
        return worker.fetch(request, env, ctx);
    },
};
