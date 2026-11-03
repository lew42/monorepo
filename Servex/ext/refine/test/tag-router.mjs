/* `node Servex/ext/refine/test/tag-router.mjs` — no model, no server. A throwaway repo tree with two pages and the
 * REAL Inbox class (`Servex/agents/inbox.js`): a tagged prompt leaves one note on the page its tag names, none for
 * a tag with no page (listed instead), and a re-run adds nothing. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Inbox } from "../../../agents/inbox.js";
import TagRouter from "../TagRouter.js";

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "tagrouter-"));
for (const d of ["public/framework/ext/Refine", "public/framework/core/Page"]){ fs.mkdirSync(path.join(repo, d), { recursive: true }); fs.writeFileSync(path.join(repo, d, "page.js"), "// page\n"); }
fs.mkdirSync(path.join(repo, "public/framework/ext/NoPage"), { recursive: true });   // a folder, not a page

const router = new TagRouter({ inbox: new Inbox({ repo }) });
const notes = [{ i: 1, tags: ["ext/Refine"] }, { i: 4, tags: ["ext/Refine", "ext/NoPage"] }, { i: 2, tags: ["Nope/Thing", "../etc"] }];
const session = "11111111-2222-3333-4444-555555555555", prompt = "pfixture";
let fail = 0;
const check = (name, ok, extra) => { console.log(ok ? "PASS" : "FAIL", name, extra ? JSON.stringify(extra) : ""); if (!ok) fail++; };

const r1 = router.route({ session, prompt, notes });
const file = path.join(repo, "public/framework/ext/Refine/page.jsonl");
const lines = fs.readFileSync(file, "utf8").trim().split("\n").map(l => JSON.parse(l));
check("one note for the tag that names a page", r1.sent.length === 1 && r1.sent[0].path === "/framework/ext/Refine/" && lines.length === 1, r1);
check("sentence numbers are 1-based, merged per tag", r1.sent[0].sentences.join() === "2,5");
check("the note links the source prompt, no retyped text", lines[0].note.text.includes(`/framework/ai/sessions/${session}/`) && lines[0].note.text.includes("S2, S5") && lines[0].note.from === "refine", lines[0].note.text);
check("tags with no page are listed, no note", r1.unrouted.join() === "ext/NoPage,Nope/Thing,../etc" && !fs.existsSync(path.join(repo, "public/framework/core/Page/page.jsonl")), r1.unrouted);
const r2 = router.route({ session, prompt, notes });
check("a tag spelt in the wrong case names no page", router.page_for("ext/refine") === null && router.page_for("ext/Refine") === "/framework/ext/Refine/");
check("a re-run adds nothing", r2.sent.length === 0 && r2.already.join() === "ext/Refine" && fs.readFileSync(file, "utf8").trim().split("\n").length === 1, r2);
fs.rmSync(repo, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
