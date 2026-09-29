/* WINDOW WATCH — a hidden, always-on catcher for the next real popup window.
 *
 * Why (public/framework/ai/2026-09-28/hidden-windows/): three faithful reproductions of the
 * named popup chains — the real Stop-hook chain fired live, a health-supervisor.mjs mimic, and a
 * Bash-tool -> Playwright chain — all showed ZERO visible windows under an EnumWindows probe. The
 * decision was to stop guessing blind and build this instead: run forever, and when a real popup
 * next happens, it names its own process tree so nobody has to hand-test another chain.
 *
 * How it watches, cheaply: ONE hidden PowerShell process, started once (Add-Type's P/Invoke
 * setup only pays its cost at boot), loops EnumWindows + IsWindowVisible once a second inside
 * ITSELF — never a new PowerShell per sample, the same reasoning Servex/Monitor.js documents for
 * its own process-sampling loop ("each start costs ~0.3 s of CPU"). Node only reads whatever that
 * loop prints; it does not drive the probe itself.
 *
 * What counts as a hit: a window handle NEVER SEEN BEFORE (the first pass seeds every window
 * that already exists as a baseline, so nothing already open at startup counts), that is visible,
 * and whose owning process's image name (no ".exe", case-insensitive) is one of the console/agent
 * families this task is actually chasing: conhost, cmd, powershell, node, bash, claude.
 *
 * On a hit, PowerShell also walks the parent chain up to 6 hops (Win32_Process's
 * ParentProcessId + CommandLine), so the log line alone can answer "who started this". Node adds
 * the timestamp (this repo's local-offset ISO shape, same as .claude/hooks/append.mjs) and
 * appends ONE JSON line to Servex's own log home — not a task log, not this repo's `append.mjs`
 * shape, just one flat object per line — creating the directory if it does not exist yet.
 *
 * Never crashes: every step is wrapped, and a read/parse/write failure logs one line to this
 * process's own console (visible only in whatever redirected its stdout/stderr, e.g. orphan.mjs's
 * >> file) and the loop keeps going. No model call, no network call — just the probe and the
 * append, meant to run forever. */

import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const HOME = process.env.SERVEX_HOME || path.join(os.homedir(), "AppData", "Local", "lew42", "servex");
const LOG_DIR = path.join(HOME, "logs");
const LOG_FILE = path.join(LOG_DIR, "windows.jsonl");
const TARGETS = ["conhost", "cmd", "powershell", "node", "bash", "claude"];

const pad = n => String(n).padStart(2, "0");
function nowLocal(){
	const d = new Date(), off = -d.getTimezoneOffset(), a = Math.abs(off);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off < 0 ? "-" : "+"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}

function report(entry){
	try {
		mkdirSync(LOG_DIR, { recursive: true });
		appendFileSync(LOG_FILE, JSON.stringify({ at: nowLocal(), ...entry }) + "\n", "utf8");
	} catch (e) {
		console.error(`window-watch: could not write ${LOG_FILE}: ${e.message}`);
	}
}

function say(msg){ console.log(`window-watch: ${msg}`); }

/* One long-lived hidden PowerShell, restarted (with backoff) if it ever dies. It prints one
 * compact JSON line per hit, never anything else on a clean line — Node just tries to parse each
 * line and ignores what it cannot. Windows PowerShell 5.1, -EncodedCommand so no quoting survives
 * a trip through a shell (same reasoning as Servex/Monitor.js's own PS child). */
let restarts = 0;
function watch(){
	const script = PS.replace("__PARENT__", String(process.pid)).replace("__TARGETS__", TARGETS.map(t => `'${t}'`).join(","));
	const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
		"-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")],
		{ windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });

	let rest = "";
	child.stdout.setEncoding("utf8");
	child.stdout.on("data", chunk => {
		const parts = (rest + chunk).split(/\r?\n/);
		rest = parts.pop();
		for (const line of parts) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			try {
				const hit = JSON.parse(trimmed);
				report(hit);
				say(`HIT: ${hit.image} pid ${hit.pid} — "${hit.title}"`);
			} catch (e) {
				say(`could not parse a probe line, skipped: ${e.message} — ${trimmed.slice(0, 200)}`);
			}
		}
	});
	child.stderr.on("data", () => {}); // PowerShell noise; never the point of this process
	child.on("error", e => say(`the PowerShell probe failed to start: ${e.message}`));
	child.on("exit", code => {
		restarts++;
		const wait = Math.min(30000, 2000 * restarts);
		say(`the PowerShell probe exited (code ${code}) — restarting in ${wait / 1000} s (restart #${restarts})`);
		setTimeout(watch, wait);
	});
}

/* The PowerShell loop. EnumWindows/IsWindowVisible/GetWindowThreadProcessId/GetWindowText are the
 * same Win32 calls this whole task's probes have used throughout. $seen is seeded on the FIRST
 * pass with every window handle that already exists, so nothing already open when this starts
 * counts as "new" — only a handle created after that baseline, while visible, triggers a hit. */
const PS = String.raw`
$ErrorActionPreference = 'SilentlyContinue'
$parent = __PARENT__
$targets = @(__TARGETS__)

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class WindowWatchNative {
  public delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder sb, int max);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
}
"@

$script:seen = New-Object 'System.Collections.Generic.HashSet[string]'
$script:hits = New-Object System.Collections.Generic.List[object]
$script:baselining = $true

function Parent-Chain($startPid) {
  $chain = New-Object System.Collections.Generic.List[object]
  $cur = [int]$startPid
  for ($i = 0; $i -lt 6; $i++) {
    if ($cur -eq 0 -or $cur -eq 4) { break }
    $wp = $null
    try { $wp = Get-CimInstance Win32_Process -Filter "ProcessId=$cur" -ErrorAction Stop } catch { break }
    if (-not $wp) { break }
    $chain.Add([pscustomobject]@{ pid = $cur; image = $wp.Name; command = $wp.CommandLine })
    $cur = [int]$wp.ParentProcessId
  }
  return $chain
}

$callback = {
  param([IntPtr]$hWnd, [IntPtr]$lParam)
  $key = $hWnd.ToString()
  if ($script:seen.Contains($key)) { return $true }
  $script:seen.Add($key) | Out-Null
  if ($script:baselining) { return $true }
  if (-not [WindowWatchNative]::IsWindowVisible($hWnd)) { return $true }
  $len = [WindowWatchNative]::GetWindowTextLength($hWnd)
  if ($len -le 0) { return $true }
  $sb = New-Object System.Text.StringBuilder ($len + 1)
  [WindowWatchNative]::GetWindowText($hWnd, $sb, $sb.Capacity) | Out-Null
  $procId = 0
  [WindowWatchNative]::GetWindowThreadProcessId($hWnd, [ref]$procId) | Out-Null
  $image = ''
  try { $image = (Get-Process -Id $procId -ErrorAction Stop).ProcessName } catch {}
  if ($targets -notcontains $image.ToLower()) { return $true }
  $chain = Parent-Chain $procId
  $script:hits.Add([pscustomobject]@{ hwnd = $key; title = $sb.ToString(); pid = [int]$procId; image = $image; chain = $chain })
  return $true
}

while ($true) {
  if (-not (Get-Process -Id $parent -ErrorAction SilentlyContinue)) { exit }
  $script:hits = New-Object System.Collections.Generic.List[object]
  [WindowWatchNative]::EnumWindows($callback, [IntPtr]::Zero) | Out-Null
  if ($script:baselining) {
    $script:baselining = $false
  } else {
    foreach ($h in $script:hits) {
      [Console]::Out.WriteLine(($h | ConvertTo-Json -Compress -Depth 6))
      [Console]::Out.Flush()
    }
  }
  Start-Sleep -Seconds 1
}
`;

say(`starting, pid ${process.pid}, log at ${LOG_FILE}`);
watch();
