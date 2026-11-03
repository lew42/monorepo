// worker/pages.js — a page whose content is a row in D1, read/written with
// worker/likes.js's proven pattern (prepared statements, env.DB). Task:
// ai/2026-09-17/pages-in-d1/, the local proof that the scout's report asked for.
//
// ⚠ schema.sql records a real decision next to `likes`: a LIKE must never reference a
//   page id, because a rename would orphan it — so `likes.url` is a plain string and
//   there is deliberately no page table for it to point at. This `pages` table is a
//   different claim: it is the page's own content, keyed on its own path, and nothing
//   in this file reads or writes worker/likes.js's table or vice versa.
//
// Neither function below knows about HTTP; worker/index.js is the only file that
// decides who may call them — and for the read below, the answer is "anybody": pages
// are public, the same as any static file under public/.

export async function pages(under, env) {
    const { results } = await env.DB.prepare(
        "SELECT path, json FROM pages WHERE path LIKE ? ORDER BY path")
        .bind(`${under}%`).all();

    return results.map(row => ({ path: row.path, ...JSON.parse(row.json) }));
}

// One row, upserted whole — there is no per-field PATCH, because nothing on this site
// writes one yet. The caller (index.js) has already checked can(user, "write") and the
// same-origin header before this runs, exactly like likes' toggle().
export async function upsert({ path, ...fields } = {}, env) {
    await env.DB.prepare(
        `INSERT INTO pages (path, json, updated) VALUES (?, ?, ?)
         ON CONFLICT (path) DO UPDATE SET json = excluded.json, updated = excluded.updated`)
        .bind(path, JSON.stringify(fields), Math.floor(Date.now() / 1000)).run();

    return { path, ...fields };
}
