import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "/framework/ext/Ask/edit.js";

/* Scaffolds the NEXT version dir under `ai/v/` — dev server only. `edit()` is the
   ONE switch every editor control on the site reads (`ext/Ask/edit.js`): it is
   false the instant there is no dev socket, which is every production visitor
   (static hosting has no server for a write to reach) — so this never runs off
   localhost, and the "New version" button `versions.js`'s `picker()` draws at
   the foot of its menu never even renders there.

   What it does, in order: finds the newest version already under `ai/v/` (its
   own children string), lists EVERY file in that version's dir (`rpc:ls`, not
   just `page.js` and a guessed stylesheet — a version can carry its own extra
   files, `demos.js` on v3, and a copy that leaves one behind is a copy whose
   page.js fails its own import — caught live, `doc/decisions.md`
   §"Copy the whole directory, not two guessed files"), copies each one over —
   `page.js` retitled "AI v<n+1>" with its self-reference fixed, its own named
   stylesheet renamed the same way, everything else byte-for-byte — then adds
   `<n+1>` to `ai/v/page.js`'s own `children:` string, which is the ONLY reason
   a new version shows up in the picker: `versions.js`'s `versions()` reads that
   same live string, nothing hardcoded.

   The writes are not atomic across each other (a partial copy could land if the
   server dies mid-scaffold) — acceptable here because the whole action is a
   dev-only convenience with a human watching the result, not a persistence path
   anything depends on. */

// Extensions safe to fetch as text and write back — anything else (an image, a
// font) would be corrupted by `.text()` and is skipped with a console warning
// instead of silently mangling a binary file no version has needed yet.
const TEXT_EXT = /\.(js|css|jsonl|json|md|txt|svg)$/i;

async function text(url){
	const res = await fetch(url);
	if (!res.ok) throw new Error(`new_version: ${url} — ${res.status}`);
	return res.text();
}

async function write(path, data){
	const reply = await Socket.singleton().async_rpc("write", path, data);
	if (reply?.response === "write failed") throw new Error(`new_version: the server refused to write ${path}.`);
	return true;
}

export async function new_version(){
	if (!edit()) return null;

	/* ⚠ The LAST write below (ai/v/page.js's own children string) changes a file
	   the server's directory watcher reacts to on every save — it rebuilds
	   directory.json and broadcasts "changed" to this very tab. `Socket.write()`'s
	   self-mute only covers the exact path THIS tab wrote, not that derived
	   ripple, so without this a real reload could race the navigation a few
	   lines down. `$BLOCKRELOAD` is the site's own escape hatch for exactly this
	   (`ext/Ask/edit.js`'s neighbour; `imagine/cms/edit/page.js`'s own write does
	   the same). The timeout is only a safety net for a scaffold that throws
	   before ever reaching the navigation — a normal run leaves for `dst_dir`
	   and a fresh page resets the flag on its own. */
	window.$BLOCKRELOAD = true;
	setTimeout(() => { window.$BLOCKRELOAD = false; }, 5000);

	const vpage = (await import("/framework/ai/v/page.js")).default;
	await vpage.load_all_children(1).loading;

	const nums = [...vpage.children.keys()].map(Number).filter(Number.isFinite);
	if (!nums.length) return null;   // nothing to copy from — v/2 exists today, so this never fires in practice

	const from = Math.max(...nums);
	const next = from + 1;

	const src_dir = `/framework/ai/v/${from}/`;
	const dst_dir = `/framework/ai/v/${next}/`;

	const listing = await Socket.singleton().ls(src_dir);
	const names = (listing?.response ?? []).filter(f => f.type === "file").map(f => f.name);
	if (!names.includes("page.js")) throw new Error(`new_version: ${src_dir}page.js is missing — nothing to copy.`);

	let js = await text(src_dir + "page.js");

	// The stylesheet `page.js` itself names, renamed the same way the page is —
	// found in its own source rather than assumed, so a version with no
	// stylesheet (or one named some other way) is copied correctly too.
	const css_match = js.match(/View\.stylesheet\(import\.meta,\s*["'`]([^"'`]+)["'`]\)/);
	const css_name = css_match?.[1];
	if (css_name){
		const css = await text(src_dir + css_name);
		const new_css_name = css_name.replace(String(from), String(next));
		js = js.replace(css_name, new_css_name);
		await write(dst_dir + new_css_name, css);
	}

	// Only the `title:` field's own value — never a blind sitewide string
	// replace, which would just as happily rewrite an unrelated path or a
	// sentence in the page's own content that happens to mention "v2".
	js = js.replace(/title:\s*"([^"]*)"/, (whole, title) => `title: "${title.replace("v" + from, "v" + next)}"`);

	// The source's OWN url segment — `versions.js`'s `picker("/framework/ai/v/3/")`
	// call inside v/3/page.js, for instance. Copied verbatim it would leave the
	// new version's trigger wearing the OLD number forever; this is the one place
	// a whole-file replace is safe, because "/v/<from>/" is the page's own address,
	// not prose that could mention the number for an unrelated reason.
	js = js.replaceAll(src_dir, dst_dir);

	await write(dst_dir + "page.js", js);

	// Everything else in the source dir, byte-for-byte — a version's own extra
	// files (v3's `demos.js`) that `page.js` reads by a RELATIVE path, so a
	// copy that skipped them left the new version's own import 404ing the
	// instant anyone routed to it.
	//
	// ⚠ `board.jsonl` is skipped ON PURPOSE (2026-09-19, `ai/2026-09-19/v3-data/`):
	// it LOOKS like one of v3's own extra files (`rpc:ls` still lists it — a
	// filesystem hard link at this path keeps two older Server plugins working
	// against the real, shared `ai/board.jsonl`), but copying it would fetch
	// today's live board content and write a SECOND, independent copy of it
	// into the new version's own dir — recreating the exact "data saved inside
	// a version dir" bug this task just removed, the moment anyone scaffolds a
	// new version. The real store lives at `ai/board.jsonl`, outside every
	// version — `timeline.js`'s `LOG_URL` is how a version finds it; nothing a
	// scaffold copies.
	//
	// `verdicts.jsonl` gets the SAME exclusion, for the SAME reason (2026-09-19,
	// `ai/2026-09-19/inbox-zero/`): a verdict judges a board card, not this
	// version's own UI, so it moved beside `board.jsonl` to `ai/verdicts.jsonl`
	// — `timeline.js`'s `VERDICTS_URL` is how a version finds it. No hard link
	// keeps a copy inside `v/3/` any more (nothing there still reads that old
	// path), so `rpc:ls` should never actually list it here again — this line
	// only guards against a stray file reappearing in this directory by mistake.
	for (const name of names){
		if (name === "page.js" || name === css_name || name === "board.jsonl" || name === "verdicts.jsonl") continue;
		if (!TEXT_EXT.test(name)){ console.warn(`new_version: skipped ${src_dir}${name} — not a text file this scaffold knows how to copy.`); continue; }
		await write(dst_dir + name, await text(src_dir + name));
	}

	const vjs = await text("/framework/ai/v/page.js");
	const next_vjs = vjs.replace(/children:\s*"([^"]*)"/, (whole, list) => `children: "${list.trim()} ${next}"`);
	await write("/framework/ai/v/page.js", next_vjs);

	return dst_dir;
}

export default new_version;
