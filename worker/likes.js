// worker/likes.js — the like. One D1 row per (user, url), and nothing else.
//
// This is the D1 WRITE path, which is the half of decisions/data.md's Phase 2
// ("a Worker + D1 the day a stranger must write — identity, likes") that the
// room did not prove: worker/room.js writes to a Durable Object's own SQLite,
// which is a different store with different rules. Everything here is
// /notes/auth/ §4 and §5:
//
//   · The count is COUNT(*), computed on read. There is no points column, and
//     no cached number that could ever disagree with the rows (§5).
//   · One like per user per page is the PRIMARY KEY, not an `if` (§4). The
//     INSERT below can be sent twice and the second one changes nothing.
//
// Neither function knows about HTTP; worker/index.js is the only file that
// decides who is allowed to call them.

// What the client needs to draw the button, in one round trip: how many, is one
// of them yours, and who you are (so the button can say "sign in" rather than
// silently doing nothing).
export async function likes(url, user, env) {
    const row = await env.DB.prepare("SELECT count(*) AS count FROM likes WHERE url = ?")
        .bind(url).first();

    const mine = user
        ? !!(await env.DB.prepare("SELECT 1 FROM likes WHERE user_id = ? AND url = ?")
            .bind(user.id, url).first())
        : false;

    return { count: row.count, mine, you: user ? user.handle : null };
}

// Toggle, without reading first: the INSERT is the test. ON CONFLICT DO NOTHING
// means a second like from the same user changes zero rows, and zero rows
// changed is exactly "they had already liked it" — so the unlike is the else
// branch of one atomic statement rather than a read-then-write two callers can
// interleave.
export async function toggle(url, user, env) {
    const inserted = await env.DB.prepare(
        `INSERT INTO likes (user_id, url, created_at) VALUES (?, ?, ?)
         ON CONFLICT (user_id, url) DO NOTHING`)
        .bind(user.id, url, Math.floor(Date.now() / 1000)).run();

    if (!inserted.meta.changes) {
        await env.DB.prepare("DELETE FROM likes WHERE user_id = ? AND url = ?")
            .bind(user.id, url).run();
    }

    return likes(url, user, env);
}
