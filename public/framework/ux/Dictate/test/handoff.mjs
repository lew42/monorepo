// Proof for the sheet's hand-off (ext/drawer/doc/sheet.md "Proven end to end"). Headless only, never the owner's tabs.
//   node public/framework/ux/Dictate/test/handoff.mjs [base-url] [shots dir]      env: PAGE=/framework/ext/drawer/  MAX_S=150
// A REAL run, not a stub: a fresh headless browser at 400 opens `<PAGE>ai/`, the fake mic plays handoff-wav.ps1's two spoken
// sentences ("Please file a task for this page." / "The page's readme should link its architecture doc."), real Whisper
// writes them into a real voice session, the voice assistant places them, the smart assistant hands the ask to the page's
// pair. Then it watches the page's module home on disk and the sheet's feed, and prints the seconds from the LAST owner
// sentence landing in the session file to: a new folder in `<module>/tasks/`, a new line in `<page>/ai/log.jsonl`, a
// feed row in the sheet, the voice assistant's `place` line. The session is real and paid (a few cents): run it on purpose.
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const [base = "http://monorepo.localhost", shots] = args;
const PAGE = process.env.PAGE ?? "/framework/ext/drawer/", MAX_S = Number(process.env.MAX_S ?? 150);
const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(here, "../../../..");   // .../public
const home = path.join(PUBLIC, PAGE.replace(/^\//, ""));   // the page's module folder
const wav = path.join(os.tmpdir(), "handoff-ask.wav");
import { browser as launch, close } from "../../../../../Server/Browser.mjs";

execFileSync("powershell", ["-NoProfile", "-File", path.join(here, "handoff-wav.ps1"), "-out", wav], { windowsHide: true });
const browser = await launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${wav}`] });
const kill = setTimeout(() => { console.log("FAIL killed after 300 s"); process.exit(2); }, 300000);
const lines = f => { try { return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return { bad: l }; } }); } catch { return []; } };
const dirs = d => { try { return fs.readdirSync(d).sort(); } catch { return []; } };
const tasks_dir = path.join(home, "tasks"), log_file = path.join(home, "ai", "log.jsonl"), chat_file = path.join(home, "ai", "chat.jsonl");
const before = { tasks: new Set(dirs(tasks_dir)), log: lines(log_file).length, chat: lines(chat_file).length };

const ctx = await browser.newContext({ viewport: { width: 400, height: 800 }, permissions: ["microphone"], hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e).slice(0, 200)));
await page.goto(base + PAGE + "ai/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".drawer-rail-sheet.on .ux-dictate-widget", { timeout: 30000 });
await page.waitForTimeout(1500);
const shot = async name => shots && page.screenshot({ path: `${shots}/${name}.png` });
await shot("1-sheet-open");
// New session first: Servex hands back the last hour's session otherwise, and the old ask would be in it
const fresh = page.locator(".drawer-rail-sheet.on .ux-dictate-chat-new-session");
if (!await fresh.isVisible()) await page.locator(".drawer-rail-sheet.on .drawer-rail-sheet-more").click();
await fresh.click();
await page.waitForTimeout(800);
const t_open = Date.now();
const mic = page.locator(".drawer-rail-sheet .dictation-bar .dictation-bar-mic:visible").first();
await mic.click();
let mic_off = false;   // Chromium loops the fake mic's file: stop it once the two sentences are in, or the ask is spoken again

before.feed = await page.evaluate(() => document.querySelectorAll(".drawer-ai-feed-task").length);
const T = {};   // first-seen times, ms since epoch
const session_file = async () => page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem("lew42-voice-session"))?.file ?? null; } catch { return null; } });
let file = null, owner = [], last_n = 0, t_last = null, finished = false;
while (!finished && Date.now() - t_open < MAX_S * 1000){
	await page.waitForTimeout(200);
	const now = Date.now();
	if (!mic_off && t_last && now - t_last > 2500 && owner.length >= 2){ mic_off = true; await mic.click().catch(() => {}); }
	file ??= await session_file();
	if (file){
		const all = lines(path.join(PUBLIC, file.replace(/^\//, "")));
		owner = all.filter(l => l.chat?.from?.kind === "owner");
		if (owner.length !== last_n){ last_n = owner.length; t_last = now; T.owner_line ??= now; T.place = null; await shot(`2-sentence-${owner.length}`); }
		const last = owner.at(-1)?.chat?.at;
		if (last && !T.place && all.some(l => l.place?.re === last)) T.place = now;   // the voice assistant's line about the LAST sentence
	}
	if (!T.task_folder){
		const made = dirs(tasks_dir).filter(d => !before.tasks.has(d));
		if (made.length && t_last){ T.task_folder = now; T.task_name = made.join(", "); await shot("3-task-folder"); }
	}
	if (!T.log_line && t_last && lines(log_file).slice(before.log).some(l => l.task)){ T.log_line = now; }
	if (!T.feed_row){
		const row = await page.evaluate(() => [...document.querySelectorAll(".drawer-ai-feed-task")].map(r => r.textContent.replace(/\s+/g, " ").trim()));
		if (row.length > before.feed && t_last){ T.feed_row = now; T.feed_text = row.at(-1); await shot("4-feed-row"); }
	}
	// a `task` log line alone is the older hand-off (session-smart 4b, dir_log): after the line, give a folder 15 s more
	finished = !!(T.task_folder && T.feed_row) || (!!T.log_line && !!T.feed_row && now - T.log_line > 15000);
}
await shot("5-end");
// The file's own stamps are exact; the polled times above also include the screenshots' time.
const all = file ? lines(path.join(PUBLIC, file.replace(/^\//, ""))) : [], t_say = Date.parse(owner.at(-1)?.chat?.at);
const stamped = {
	place_line: (Date.parse(all.find(l => l.place?.re === owner.at(-1)?.chat?.at)?.ts) - t_say) / 1000,
	task_log_line: (Date.parse(lines(log_file).slice(before.log).find(l => l.task)?.task?.at) - t_say) / 1000,
};
const sec = t => t && t_last ? +((t - t_last) / 1000).toFixed(1) : null;
const out = {
	page: PAGE, session_file: file, owner_sentences: owner.map(l => l.chat.text),
	seconds_from_last_sentence: { place_line: sec(T.place), task_folder: sec(T.task_folder), ai_log_line: sec(T.log_line), feed_row: sec(T.feed_row) },
	seconds_by_file_stamps: Object.fromEntries(Object.entries(stamped).map(([k, v]) => [k, Number.isFinite(v) ? +v.toFixed(1) : null])),
	task_folder: T.task_name ?? null, feed_text: T.feed_text ?? null,
	new_log_lines: lines(log_file).slice(before.log), new_chat_lines: lines(chat_file).slice(before.chat).map(l => JSON.stringify(l).slice(0, 200)), errors,
};
console.log(JSON.stringify(out, null, 1));
clearTimeout(kill);
await close();
process.exit(T.task_folder && T.feed_row ? 0 : 1);
