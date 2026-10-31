// PageListing.live in node: `node public/framework/core/Page/Listing.test.mjs`
// Folds real files.jsonl lines (file, folder, gone) into a listing and redraws on each tailed batch.
// Only the network is faked: fetch() serves files from a temp dir, and the socket tail is played by the same two calls
// ext/JSONL/live.js makes for a batch of new lines (reader.read, then reader.changed). The real tail is checked on the dev server (doc/files.md, phase 1).
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..", "..");
register(pathToFileURL(path.join(ROOT, "Servex", "agents", "site-hooks.mjs")).href);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "listing-live-"));
const lines = list => list.map(x => JSON.stringify(x)).join("\n") + "\n";
fs.writeFileSync(path.join(dir, "files.jsonl"), lines([{ file: "a.txt" }, { file: "b.txt" }, { file: "docs/readme.md" }, { file: "kid/page.jsonl" }]));

// The one fake: a site url under /fake/ answers with the temp file.
globalThis.fetch = async url => {
	const file = path.join(dir, String(url).replace(/^.*\/fake\//, ""));
	return fs.existsSync(file)
		? new Response(fs.readFileSync(file, "utf8"), { status: 200, headers: { "content-type": "application/jsonl" } })
		: new Response("", { status: 404 });
};

const { default: Page } = await import("./Page.class.js");
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// 1. the first answer: files, a folder and a page, all from the committed lines
const seen = [];
const live = await Page.Listing.live(Page, "/fake/", listing => seen.push(listing));
ok(live.listing.files.join() === "a.txt,b.txt", "files: " + live.listing.files);
ok(live.listing.dirs.join() === "docs", "folder: " + live.listing.dirs);
ok(live.listing.pages.get("kid") === "jsonl", "a child page is a page, not a file");

// 2. a tailed batch: one file added
live.reader.read(live.reader.parse(lines([{ file: "c.txt" }])));
live.reader.changed();
ok(seen.length === 1 && seen.at(-1).files.includes("c.txt"), "an added file reaches the callback");
ok(live.listing === seen.at(-1), "live.listing is always the newest");

// 3. gone: a file and a folder's last file
live.reader.read(live.reader.parse(lines([{ file: "b.txt", gone: true }, { file: "docs/readme.md", gone: true }])));
live.reader.changed();
ok(!live.listing.files.includes("b.txt") && !live.listing.dirs.includes("docs"), "gone removes the file and the empty folder");
ok(live.listing.files.join() === "a.txt,c.txt", "what is left: " + live.listing.files);

// 4. a folder with no log at all: an empty listing, not an error
const none = await Page.Listing.live(Page, "/fake/nothing-here/", () => {});
ok(none.listing.files.length === 0 && none.listing.dirs.length === 0, "no log means an empty list");

live.close(); none.close();
fs.rmSync(dir, { recursive: true });
console.log(`Listing.live: ${checks} checks passed`);
