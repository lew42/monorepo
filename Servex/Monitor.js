import os from "os";
import { spawn } from "child_process";
import Events from "../Server/Events.js";
import { stamp } from "./home.js";
import { ONE_PASS } from "./Lifecycle.js";

/* THE MACHINE MONITOR — is this computer melting, and who is doing it?
 *
 * The owner, 2026-09-24: "My fans are spinning. Let's make sure we're not
 * melting my computer." At 17:55 that day about 100 finished agents sat idle,
 * each still holding a claude.exe of ~250 MB, and free RAM hit 1.5 GB. This
 * watches for exactly that, cheaply — a monitor that burns a core is the bug
 * it is meant to catch.
 *
 * Every 5 s it takes one SAMPLE:
 *
 *   cpu        total CPU %, from os.cpus() time deltas (free — no process)
 *   ram        free and total GB, from os.freemem()
 *   top        the 5 processes using the most CPU over those 5 s, and counts of
 *              claude / node / chrome processes. ONE long-lived hidden
 *              PowerShell loop does this and prints one JSON line per loop —
 *              never a new PowerShell per sample (each start costs ~0.3 s of CPU).
 *   agents     live Servex agents: total, working, and IDLE ones that still hold
 *              a claude process — the number that mattered at 17:55.
 *   gpu        load, temperature, fan %, memory — one long-lived
 *              `nvidia-smi -l 5` child, when nvidia-smi exists.
 *   cpu_temp   only if Windows gives it without admin. The PowerShell loop tries
 *              the three usual WMI classes once at start and says why not.
 *
 * It keeps the latest sample in memory (`this.sample`), writes one averaged
 * line a minute to the `system` log, and raises THE FLAG when CPU stays above
 * `hot_cpu`% for `hot_seconds`, or free RAM drops under `low_ram_gb`. While the
 * flag is up Servex queues new agent spawns (Servex.js, `admission()`). Going up
 * sends ONE message to the mastermind and one line on the Live card; it then
 * stays quiet until the flag clears.
 *
 * Thresholds: SERVEX_HOT_CPU (90), SERVEX_HOT_SECONDS (60), SERVEX_LOW_RAM_GB (3),
 * and changeable at runtime through `set()` — the `system_health` tool's own
 * arguments — so a test can trip the flag and clear it without a restart. */
export default class Monitor extends Events {

    initialize(){
        this.every ??= 5000;
        this.hot_cpu ??= Number(process.env.SERVEX_HOT_CPU) || 90;
        this.hot_seconds ??= Number(process.env.SERVEX_HOT_SECONDS) || 60;
        this.low_ram_gb ??= Number(process.env.SERVEX_LOW_RAM_GB) || 3;
        this.notify ??= "mastermind-servex";   // who hears the flag go up
        this.card ??= "live";                  // where the owner sees it

        this.sample = null;
        this.minute = [];
        this.flag = null;
        this.hot_since = null;
        this.procs = null;        // the PowerShell loop's latest line
        this.gpu = null;          // nvidia-smi's latest line
        this.sensors = null;      // what Windows gave at startup, and why not
        this.cost = { ps: null, gpu: null };
        this.children = {};
        this.cpu();               // first reading, so the first tick has a delta
    }

    start(){
        this.powershell();
        this.nvidia();
        this.timer = setInterval(() => this.tick(), this.every);
        this.timer.unref();
        this.writer = setInterval(() => this.write(), 60000);
        this.writer.unref();
        return this;
    }

    stop(){
        this.stopped = true;
        clearInterval(this.timer);
        clearInterval(this.writer);
        for (const child of Object.values(this.children)) try { child.kill(); } catch {}
    }

    /* Runtime thresholds. Only numbers are taken; anything else is ignored. */
    set(changes = {}){
        const changed = {};
        for (const key of ["hot_cpu", "hot_seconds", "low_ram_gb"])
            if (Number.isFinite(Number(changes[key])) && changes[key] !== undefined && changes[key] !== null){
                this[key] = Number(changes[key]);
                changed[key] = this[key];
            }
        if (Object.keys(changed).length){
            this.log({ type: "thresholds", ...changed });
            if (this.sample) this.judge(this.sample);   // so the answer to this very call is already true
        }
        return changed;
    }

    thresholds(){ return { hot_cpu: this.hot_cpu, hot_seconds: this.hot_seconds, low_ram_gb: this.low_ram_gb }; }

    /* ── the sample ───────────────────────────────────────────────────── */

    cpu(){
        const now = { idle: 0, total: 0 };
        for (const { times: t } of os.cpus()){
            now.idle += t.idle;
            now.total += t.user + t.nice + t.sys + t.idle + t.irq;
        }
        const prev = this.cpu_prev;
        this.cpu_prev = now;
        if (!prev || now.total <= prev.total) return null;
        return round(100 * (1 - (now.idle - prev.idle) / (now.total - prev.total)));
    }

    /* An idle agent is one whose turn ended but whose session is still open —
     * `Agents.Agent.stop()` is what finally ends the claude.exe, so until then
     * each one holds a whole claude process in memory. Only real Claude sessions
     * count: the Dispatcher sits in the same map as a stand-in with no process. */
    agents(){
        const Agent = this.servex?.constructor?.Agents?.Agent;
        const live = [...(this.servex?.agents?.live?.values() ?? [])]
            .filter(a => (!Agent || a instanceof Agent) && a.state !== "stopped");
        return {
            total: live.length,
            working: live.filter(a => a.state === "working" || a.state === "starting").length,
            idle_holding_claude: live.filter(a => a.state === "idle").length
        };
    }

    tick(){
        const gb = n => round(n / 1024 ** 3, 1);
        const sample = {
            at: stamp(),
            cpu: this.cpu(),
            ram_free_gb: gb(os.freemem()),
            ram_total_gb: gb(os.totalmem()),
            top: this.procs?.top ?? null,
            counts: this.procs?.counts ?? null,
            agents: this.agents(),
            gpu: this.gpu,
            cpu_temp: this.sensors?.cpu_temp ?? null,
            fan: this.sensors?.fan ?? null,
            acpi_zone_c: this.procs?.zone ?? null,
            why: this.sensors?.why ?? "still probing the sensors",
            monitor_cost: this.cost
        };
        this.sample = sample;
        this.minute.push(sample);
        this.judge(sample);
        this.emit("tick", sample);
        return sample;
    }

    /* One line a minute: the minute's averages, plus the latest top five. */
    write(){
        const samples = this.minute.splice(0);
        if (!samples.length) return;
        const avg = pick => {
            const values = samples.map(pick).filter(v => typeof v === "number");
            return values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : null;
        };
        const last = samples.at(-1);
        this.log({
            type: "minute", samples: samples.length,
            cpu: avg(s => s.cpu), ram_free_gb: avg(s => s.ram_free_gb), ram_total_gb: last.ram_total_gb,
            gpu_util: avg(s => s.gpu?.util), gpu_temp: avg(s => s.gpu?.temp), gpu_fan: avg(s => s.gpu?.fan),
            agents: last.agents, counts: last.counts, top: last.top,
            flag: this.flag?.reason ?? null, monitor_cost: this.cost
        });
    }

    log(entry){ return this.servex?.log?.append("system", entry).catch(() => {}); }

    /* ── the flag ─────────────────────────────────────────────────────── */

    judge(sample){
        const now = Date.now();
        if (sample.cpu !== null && sample.cpu >= this.hot_cpu) this.hot_since ??= now;
        else if (sample.cpu !== null) this.hot_since = null;

        const hot_for = this.hot_since ? Math.round((now - this.hot_since) / 1000) : 0;
        const top = sample.top?.[0];
        const reason = this.hot_since && hot_for >= this.hot_seconds
            ? `CPU above ${this.hot_cpu}% for ${hot_for} s${top ? ` — top: ${top.name} ${top.pct}%` : ""}`
            : sample.ram_free_gb < this.low_ram_gb
                ? `only ${sample.ram_free_gb} GB of RAM free (under ${this.low_ram_gb} GB)`
                : null;

        if (reason && !this.flag) this.up(reason);
        else if (reason) this.flag.reason = reason;
        else if (this.flag) this.clear();
    }

    /* NEWS ONLY (lifecycle, 2026-09-29): "stop the finished ones" went out about every 3 minutes
     * from 16:40 to 17:45, usually with nothing left to stop. Now the message goes only when the
     * set of stoppable agents (idle ones the reaper would close) differs from the last one sent,
     * and it names them. The flag itself is still logged and shown on the card every time.
     * `ONE_PASS` comes from Lifecycle.js (review finding 7) so this list can never drift from the
     * reaper's own rule — a second, hand-copied regex here would be exactly that drift. */
    stoppable(){
        const live = [...(this.servex?.agents?.live?.values() ?? [])].filter(a => a.state === "idle");
        return live.filter(a => ONE_PASS.test(a.role ?? "") || (a.role === "minion" && a.parent && this.servex.agents.live.get(a.parent)?.state === "stopped")).map(a => a.id).sort();
    }

    up(reason){
        this.flag = { reason, since: stamp() };
        const names = this.stoppable(), key = names.join(",");
        let sent = null;
        if (!names.length || key === this.last_nag) sent = names.length ? "not sent: the same stoppable agents as last time" : "not sent: nothing to stop";
        else try {
            const text = `Servex monitor: the machine is under strain — ${reason}. New agent spawns are queued until it clears.`
                + ` These ${names.length} finished agent${names.length === 1 ? " is" : "s are"} idle and can be stopped: ${names.join(", ")}.`
                + " Call system_health for the full sample.";
            this.servex.agents.send(this.notify, text, { from: "servex-monitor" });
            this.last_nag = key;
            sent = `sent to ${this.notify}`;
        } catch (e){ sent = `not sent: ${e.message || e}`; }
        this.log({ type: "flag", state: "up", reason, message: sent });
        this.say(`The machine is under strain: ${reason}. New agents wait until it clears.`);
        this.emit("up", this.flag);
    }

    clear(){
        const was = this.flag;
        this.flag = null;
        this.log({ type: "flag", state: "clear", was: was.reason, since: was.since });
        this.say("The machine is calm again; queued agents can start.");
        this.emit("clear", was);
    }

    /* The same function the `card_reply` MCP tool calls, called in-process. */
    say(text){
        try { this.servex?.assistant?.card_reply({ card: this.card, from: "servex-monitor", text }); } catch {}
    }

    /* One line, plain words. */
    verdict(sample = this.sample){
        if (!sample) return "No sample yet: the monitor takes its first one 5 seconds after Servex starts.";
        const gpu = sample.gpu?.temp != null ? `, GPU ${sample.gpu.temp} °C` : "";
        const idle = `${sample.agents.idle_holding_claude} idle agent${sample.agents.idle_holding_claude === 1 ? "" : "s"} holding claude`;
        if (this.flag) return `HOT: ${this.flag.reason}. ${idle}.`;
        return `Calm: CPU ${sample.cpu ?? "?"}%, ${sample.ram_free_gb} GB free${gpu}, ${idle}.`;
    }

    health(){
        return { verdict: this.verdict(), flag: this.flag, thresholds: this.thresholds(), sensors: this.sensors, sample: this.sample };
    }

    /* ── the two long-lived children ──────────────────────────────────── */

    /* One PowerShell, started once and restarted if it dies. It diffs each
     * process's CPU seconds itself (so only the top five cross the pipe), counts
     * claude/node/chrome, reports its own CPU seconds (its cost) and nvidia-smi's,
     * reads the ACPI thermal zone once a minute, and exits by itself when Servex
     * is gone — a child on Windows is not killed with its parent. */
    powershell(){
        if (this.stopped) return;
        const script = PS.replace("__PARENT__", String(process.pid)).replace("__EVERY__", String(this.every / 1000));
        const child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
            "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
        this.children.ps = child;
        lines(child.stdout, line => this.read_ps(line));
        child.stderr.on("data", () => {});
        child.on("error", e => this.log({ type: "monitor", msg: `powershell failed to start: ${e.message}` }));
        child.on("exit", code => {
            if (this.stopped) return;
            this.log({ type: "monitor", msg: `powershell loop exited (${code}) — restarting in 10 s` });
            setTimeout(() => this.powershell(), 10000).unref();
        });
    }

    read_ps(line){
        let data;
        try { data = JSON.parse(line); } catch { return; }
        if (data.probe) return this.probed(data.probe);

        const top = [].concat(data.top ?? []).map(p => ({ name: p.name, pid: p.pid, pct: p.pct, mb: p.mb }));
        this.procs = { top, counts: data.counts, zone: data.zone ?? this.procs?.zone ?? null };

        // Its own cost and nvidia-smi's, as % of one core, from CPU-second deltas.
        // `ps`/`gpu` are the last 5 s (Windows counts CPU in 15.6 ms steps, so
        // one step reads 0.31%); `ps_avg`/`gpu_avg` are since the loop started.
        const now = { at: Date.now(), self: data.self, nv: data.nv };
        const prev = this.ps_prev, first = this.ps_first ??= now;
        this.ps_prev = now;
        const pct = (key, since) => {
            const secs = (now.at - since.at) / 1000;
            return typeof now[key] === "number" && typeof since[key] === "number" && secs > 0
                ? round(100 * (now[key] - since[key]) / secs, 2) : null;
        };
        if (prev) this.cost = {
            ps: pct("self", prev), gpu: pct("nv", prev),
            ps_avg: pct("self", first), gpu_avg: pct("nv", first), unit: "% of one core"
        };
    }

    /* What Windows would and would not say, recorded once and repeated honestly
     * in every sample as `why`. */
    probed(probe){
        const why = [];
        const cpu_temp = typeof probe.thermal === "number" ? probe.thermal : null;
        if (cpu_temp === null) why.push(`cpu_temp: MSAcpi_ThermalZoneTemperature says "${probe.thermal_why ?? "nothing"}" (it needs admin)`);
        if (!probe.fans) why.push(`fan: Win32_Fan ${probe.fan_why ? `failed: ${probe.fan_why}` : "lists no fans — this firmware does not expose them"}`);
        if (!probe.probes) why.push(`Win32_TemperatureProbe ${probe.probe_why ? `failed: ${probe.probe_why}` : "lists no probes"}`);
        if (probe.zone != null) why.push(`acpi_zone_c is the ACPI thermal zone from a performance counter — a board sensor, not the CPU package`);
        this.sensors = { cpu_temp, fan: null, why: why.join("; "), probe };
        if (this.procs) this.procs.zone ??= probe.zone ?? null;
        this.log({ type: "sensors", ...this.sensors });
    }

    /* nvidia-smi prints one CSV line every 5 s by itself. Missing values read
     * `[N/A]` (a laptop GPU has no fan of its own), which become null. */
    nvidia(){
        if (this.stopped) return;
        const child = spawn("nvidia-smi", ["--query-gpu=utilization.gpu,temperature.gpu,fan.speed,memory.used,memory.total",
            "--format=csv,noheader,nounits", "-l", String(this.every / 1000)], { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
        this.children.gpu = child;
        lines(child.stdout, line => {
            const [util, temp, fan, used, total] = line.split(",").map(v => { const n = Number(v.trim()); return Number.isFinite(n) ? n : null; });
            if (util === undefined) return;
            this.gpu = { util, temp, fan, mem_used_mb: used, mem_total_mb: total };
        });
        child.on("error", e => {
            this.gpu_missing = e.code === "ENOENT";
            if (this.gpu_missing) this.gpu = null;
            this.log({ type: "monitor", msg: `nvidia-smi: ${e.code === "ENOENT" ? "not installed — no GPU readings" : e.message}` });
        });
        child.on("exit", code => {
            if (this.stopped || this.gpu_missing) return;
            this.log({ type: "monitor", msg: `nvidia-smi exited (${code}) — restarting in 30 s` });
            setTimeout(() => this.nvidia(), 30000).unref();
        });
    }
}

const round = (n, places = 1) => Math.round(n * 10 ** places) / 10 ** places;

function lines(stream, each){
    let rest = "";
    stream.setEncoding("utf8");
    stream.on("data", chunk => {
        const parts = (rest + chunk).split(/\r?\n/);
        rest = parts.pop();
        for (const part of parts) if (part.trim()) each(part.trim());
    });
}

/* The PowerShell loop. Kept here, sent with -EncodedCommand, so no quoting
 * survives a trip through a shell. Windows PowerShell 5.1. */
const PS = String.raw`
$ErrorActionPreference = 'SilentlyContinue'
$parent = __PARENT__
$every = __EVERY__
function Zone { try { $z = Get-CimInstance Win32_PerfFormattedData_Counters_ThermalZoneInformation -ErrorAction Stop | Select-Object -First 1; if ($z) { [math]::Round($z.HighPrecisionTemperature / 10 - 273.15, 1) } } catch { $null } }
$probe = @{}
try { $t = Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction Stop | Select-Object -First 1; $probe.thermal = [math]::Round($t.CurrentTemperature / 10 - 273.15, 1) } catch { $probe.thermal_why = $_.Exception.Message.Trim() }
try { $probe.fans = @(Get-CimInstance Win32_Fan -ErrorAction Stop).Count } catch { $probe.fan_why = $_.Exception.Message.Trim() }
try { $probe.probes = @(Get-CimInstance Win32_TemperatureProbe -ErrorAction Stop).Count } catch { $probe.probe_why = $_.Exception.Message.Trim() }
$probe.zone = Zone
[Console]::Out.WriteLine((@{ probe = $probe } | ConvertTo-Json -Compress -Depth 4))
[Console]::Out.Flush()
$prev = @{}
$sw = [Diagnostics.Stopwatch]::StartNew()
$last = 0.0
$n = 0
while ($true) {
  if (-not (Get-Process -Id $parent -ErrorAction SilentlyContinue)) { exit }
  $now = $sw.Elapsed.TotalSeconds; $dt = $now - $last; $last = $now
  $cur = @{}
  $rows = New-Object System.Collections.Generic.List[object]
  $c = @{ claude = 0; node = 0; chrome = 0 }
  $nv = 0.0
  foreach ($p in Get-Process) {
    $cpu = $p.CPU; if ($cpu -eq $null) { $cpu = 0 }
    $cur[$p.Id] = $cpu
    $name = $p.ProcessName
    if ($name -eq 'claude') { $c.claude++ } elseif ($name -eq 'node') { $c.node++ } elseif ($name -like 'chrome*') { $c.chrome++ } elseif ($name -eq 'nvidia-smi') { $nv += $cpu }
    if ($prev.ContainsKey($p.Id) -and $dt -gt 0) {
      $pct = ($cpu - $prev[$p.Id]) / $dt * 100
      if ($pct -ge 1) { $rows.Add([pscustomobject]@{ name = $name; pid = $p.Id; pct = [math]::Round($pct, 1); mb = [math]::Round($p.WorkingSet64 / 1MB) }) }
    }
  }
  $prev = $cur
  $top = @($rows | Sort-Object pct -Descending | Select-Object -First 5)
  $o = @{ top = $top; counts = $c; self = $cur[$PID]; nv = $nv }
  if ($n % 12 -eq 0) { $o.zone = Zone }
  $n++
  [Console]::Out.WriteLine(($o | ConvertTo-Json -Compress -Depth 4))
  [Console]::Out.Flush()
  Start-Sleep -Seconds $every
}
`;
