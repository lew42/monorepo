/* ORPHAN — start a process that outlives whoever started it.
 *
 *   const pid = await orphan({ command, args, cwd, env, out, err })
 *
 * Servex starts two kinds of long-lived things that must survive Servex
 * itself dying: the port-80 gate (gate.mjs) and the project dev servers
 * (Process.js). A plain child dies with Servex twice over — libuv puts every
 * child in a kill-on-close job object, and `taskkill /pid <servex> /t` walks
 * the tree by PARENT pid.
 *
 * So the process is started by a short-lived PowerShell `Start-Process`:
 *   - Start-Process's child is not in Servex's job (libuv's job lets a
 *     child's own children break away silently), and its parent — that
 *     PowerShell — has exited, so no tree walk from Servex reaches it;
 *   - `-WindowStyle Hidden` gives it a HIDDEN CONSOLE. That matters: a
 *     process with no console at all (node's `detached: true`) makes every
 *     console child it spawns pop a visible window — the dev server forks its
 *     real server and spawns claude (the node-window storm, 2026-09-22);
 *   - it runs under `cmd /c … >> out 2>> err`, so its output APPENDS to files,
 *     never a pipe: a pipe to a dead Servex would make its next write fail.
 *
 * The pid returned is that cmd.exe's; the command is its only child, and
 * `taskkill /pid <pid> /t /f` takes both. When the command exits, cmd exits. */

import { spawn } from "node:child_process";

const quote = s => /^[\w.:\\/=+-]+$/.test(s) ? s : `"${String(s).replace(/"/g, '\\"')}"`;

export function orphan({ command, args = [], cwd = process.cwd(), env = process.env, out, err }){
    const line = [command, ...args].map(quote).join(" ")
        + (out ? ` >> ${quote(out)}` : " > NUL") + (err ? ` 2>> ${quote(err)}` : " 2>&1");

    // Handed over in the environment, so nothing in `line` is ever parsed by PowerShell.
    const script = "$a = $env:ORPHAN_ARGS; $d = $env:ORPHAN_CWD; Remove-Item Env:ORPHAN_ARGS, Env:ORPHAN_CWD;"
        + " (Start-Process -FilePath $env:ComSpec -ArgumentList $a -WorkingDirectory $d -WindowStyle Hidden -PassThru).Id";

    return new Promise((done, fail) => {
        const ps = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
            windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
            env: { ...env, ORPHAN_ARGS: `/d /s /c "${line}"`, ORPHAN_CWD: cwd }
        });
        let said = "", complaint = "";
        ps.stdout.on("data", d => said += d);
        ps.stderr.on("data", d => complaint += d);
        ps.on("error", fail);
        ps.on("exit", () => {
            const pid = Number(said.trim());
            pid ? done(pid) : fail(new Error(`orphan: no pid from Start-Process — ${complaint.trim() || said.trim() || "no output"}`));
        });
    });
}
