// worker/join.js — the /join/ ad funnel: one D1 row per step, no personal data (worker/readme.md, "Sign-in, sessions
// and push"). Pure functions, like likes.js: no HTTP here. record_event() throws an Error with a `.status` on a bad
// or over-limit request; index.js's route() already turns that into the right response (its catch: `err.status || 500`),
// the same way every other handler's thrown errors are handled — this file just adds the two new reasons to throw.

const EVENTS = new Set([
    "view", "video_unmuted", "tap_google", "signed_in", "tap_allow", "ios_sheet_shown", "subscribed",
    "test_push", "inapp_card_shown", "copy_link", "share", "not_working", "signed_out", "deleted",
]);
const OS_VALUES = new Set(["ios", "android", "desktop"]);
const DAY = 86400;

const cut = s => String(s ?? "").slice(0, 64);
const bad = (msg, status = 400) => Object.assign(new Error(msg), { status });

// One event, one row. `v` is the page's own visitor id (16 hex chars, Funnel.js); `e` must be a known step.
export async function record_event(body, request, env) {
    const { v, e, inapp, os, src, camp, content } = body || {};
    if (!/^[0-9a-f]{16}$/.test(v || "")) throw bad("bad visitor id");
    if (!EVENTS.has(e)) throw bad("bad event");

    if (env.JOIN_RL) {
        const ip = request.headers.get("cf-connecting-ip") || "";
        const { success } = await env.JOIN_RL.limit({ key: ip });
        if (!success) throw bad("too many requests", 429);
    }
    const since = Math.floor(Date.now() / 1000) - DAY;
    const { n } = await env.DB.prepare("SELECT count(*) AS n FROM join_events WHERE visitor = ? AND at > ?").bind(v, since).first();
    if (n >= 300) throw bad("too many events from this visitor today", 429);

    await env.DB.prepare(
        `INSERT INTO join_events (at, visitor, event, inapp, os, utm_source, utm_campaign, utm_content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(Math.floor(Date.now() / 1000), v, e, cut(inapp), OS_VALUES.has(os) ? os : "", cut(src), cut(camp), cut(content)).run();
}

// GET /api/join/stats: distinct-visitor counts per event, today (UTC) / 7 days / all time, the same split by
// utm_source and by in-app vs not, plus the two totals the owner wants at a glance.
async function funnel_window(env, since) {
    const { results } = await env.DB.prepare(
        "SELECT event, count(DISTINCT visitor) AS n FROM join_events WHERE at >= ? GROUP BY event"
    ).bind(since).all();
    return Object.fromEntries(results.map(r => [r.event, r.n]));
}
async function by_source(env, since) {
    const { results } = await env.DB.prepare(
        `SELECT event, COALESCE(NULLIF(utm_source, ''), '(none)') AS source, count(DISTINCT visitor) AS n
         FROM join_events WHERE at >= ? GROUP BY event, source`
    ).bind(since).all();
    return results;
}
async function by_inapp(env, since) {
    const { results } = await env.DB.prepare(
        `SELECT event, (inapp != '') AS in_app, count(DISTINCT visitor) AS n
         FROM join_events WHERE at >= ? GROUP BY event, in_app`
    ).bind(since).all();
    return results.map(r => ({ ...r, in_app: !!r.in_app }));
}

export async function stats(env) {
    const now = Math.floor(Date.now() / 1000);
    const windows = { today: now - (now % DAY), week: now - 7 * DAY, all: 0 };

    const entries = await Promise.all(Object.entries(windows).map(async ([label, since]) => [
        label, { funnel: await funnel_window(env, since), by_source: await by_source(env, since), by_inapp: await by_inapp(env, since) },
    ]));
    const by_window = Object.fromEntries(entries);

    const users_row = await env.DB.prepare("SELECT sum(provider = 'google') AS google, sum(provider IN ('google', 'test')) AS with_test FROM users").first();
    const push_row = await env.DB.prepare("SELECT count(*) AS n FROM push_subs").first();

    return {
        events: [...EVENTS],
        funnel: { today: by_window.today.funnel, week: by_window.week.funnel, all: by_window.all.funnel },
        by_source: { today: by_window.today.by_source, week: by_window.week.by_source, all: by_window.all.by_source },
        by_inapp: { today: by_window.today.by_inapp, week: by_window.week.by_inapp, all: by_window.all.by_inapp },
        signed_up_users: { google: users_row.google || 0, with_test: users_row.with_test || 0 },
        active_push_subs: push_row.n,
    };
}
