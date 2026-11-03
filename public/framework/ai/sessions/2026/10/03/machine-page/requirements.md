# Servex: the machine at a glance, as icon pills you can click into

## The ask (owner, 2026-10-03, dictated)
> We could keep an eye on the heat: some node process we can run with Servex. We've already been monitoring RAM, but we want to do that efficiently: what gets committed to Git (it probably shouldn't be), and code that monitors accurately, reliably, in real time without bloat. RAM, CPU load, processes: a nice real-time node process of our own that listens to Windows and, for major CPU events, first lets you see an overview, then click through to all the processes. Sort of a task manager, but structured so our LLMs can see what's going on, systematically measuring the machine's resources. It varies machine to machine; is there a node API that unifies it? Worth exploring and worth creating UI. We've got to get better at UI for object-oriented things: little UI cards for each class, showing how things work by rendering the instances on screen, the most important properties right there, each as a pill with an icon and a number, hover to see its name. A familiar, repeatable system.

## What exists (extend it; law 6)
- **`Servex/Monitor.js` already IS the sampler:** every 5 s, total CPU % from `os.cpus()`, free RAM, the top 5 processes by CPU and claude/node/chrome counts from ONE long-lived PowerShell loop, live agents, GPU via `nvidia-smi -l 5`, and CPU temperature if WMI gives it without admin. The `system_health` tool returns its latest sample. The AI page's Live card shows a "Processes" line from it.
- No new npm dependency without asking (`systeminformation` would be one): stay on `os` + the existing PowerShell loop.

## Want (small)
1. **Check what it actually reports here:** is `cpu_temp` present on this machine, and if not, why (the loop logs it at start)? One line on the card. If CPU temperature needs admin, say what would get it (LibreHardwareMonitor's WMI, an admin task) and stop there.
2. **Not in Git:** samples stay in memory plus a short rolling file under `%LOCALAPPDATA%/lew42/servex/`; nothing under the repo. Check that today.
3. **A machine page** (under /framework/servex/): the latest sample as one card of **icon pills**, each an icon plus a number with its name on hover: CPU %, RAM free, CPU temperature, GPU temperature, node / claude / chrome counts, agents working. It updates live (the sample streams; no reload). Click a pill to see its detail: processes sorted by CPU or RAM, with each one's owner (our agent, our server, or the owner's own app).
4. **Build the pill once, for everything:** a small `ux/` component (icon + number + hover name) usable on any class's instance card. Check `ux/` and `ui/` for an existing pill or badge first and extend it.
5. **For LLMs:** `system_health` returns the same fields the pills show, named the same way.

## Fence
Servex/Monitor.js (only if a field is missing), the new page under the Servex docs, the one ux component, this task dir. NEVER the mcp__playwright tools.
Model: Sonnet. Budget $8. Start after @mastermind-servex-10's restart fix lands (both touch Servex).
