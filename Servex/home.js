import fs from "fs";
import os from "os";
import path from "path";

/* WHERE SERVEX KEEPS ITS STATE — outside the repo, always.
 *
 * The old Servex wrote its port map to `process.cwd()`, and its own MVP doc lists
 * that as a bug: it breaks the moment Servex runs from anywhere but its own repo,
 * and in a monorepo with git worktrees it would hand two copies of the same
 * project two different port maps. Log files have the same problem for a louder
 * reason — they grow forever and must never land in git.
 *
 * So everything lives in one folder per machine, the same folder
 * Server/plugins/Whisper.js already uses for its model files:
 *
 *   %LOCALAPPDATA%/lew42/servex/ports.json      name -> port, so a project keeps
 *                                               its port (and its cookies) forever
 *   %LOCALAPPDATA%/lew42/servex/logs/<name>.jsonl   one file per supervised thing
 *
 * SERVEX_HOME overrides it — that is how the proofs run against a scratch folder
 * without touching the real one. */
export const HOME = process.env.SERVEX_HOME
    || path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".local", "share"), "lew42", "servex");

/* Names a file under HOME and makes sure its folder exists, so no caller ever
 * has to think about mkdir. */
export function place(...parts){
    const file = path.join(HOME, ...parts);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return file;
}

/* Local time with its offset — `2026-09-22T15:04:09-05:00`. The same format
 * .claude/skills/every-prompt/say.mjs writes, so every clock in this repo's logs
 * reads the same way and sorts the same way. */
export function stamp(){
    const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.abs(n)).padStart(2, "0");
    return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19)
        + (off < 0 ? "-" : "+") + pad(Math.trunc(off / 60)) + ":" + pad(off % 60);
}
