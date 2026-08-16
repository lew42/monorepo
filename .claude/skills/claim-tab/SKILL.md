---
name: claim-tab
description: Claim a browser tab to work in — open a fresh tab on the dev site and ring its whole viewport in orange, so Mike can see at a glance which window an agent is driving and leave it alone (or watch it). Use at the START of any task that will drive a live tab through the `site` MCP tools (eval, layout measuring, a generator page), when the user says "claim a tab" / "show me what you're doing", and release it when the task lands.
---

# Claim a tab

Several sessions drive the same browser. A claimed tab says which one is yours:
a **6px orange ring around the whole viewport**, a label at the top centre, and
a 🟠 in the tab title so it reads as claimed even from the tab strip.

The ring is `public/framework/dev/Claim/` — a real dev-tier module, so it is
browsable at [/framework/dev/Claim/](http://localhost/framework/dev/Claim/) and
nothing about it is scratch. This skill is only the verb.

## 1. Look before you open

```
mcp__site__pages
```

Every connected tab, by path. **Another session's tab is not yours** — check
`/framework/ai/<today>/` for what else is running before claiming a tab already
sitting on that session's subject. If nothing is free, open your own (step 2).

## 2. Open one

```powershell
Start-Process "http://localhost/framework/styles/layouts/space/"
```

The url is **where the work is** — the page you are about to change, so the
claim doubles as a preview. `Start-Process` on a url opens a tab in the default
browser; it needs no window handle and no driver. Give it ~3s, then call
`pages` again and confirm the new path appears.

⚠ If the dev server is not running, no tab connects and `eval` has nothing to
talk to. `node server.js` on port 80 — check the port is not already served
before starting a second one.

## 3. Claim it

```
mcp__site__eval  path: "/framework/styles/layouts/space/"
  code: import("/framework/dev/Claim/claim.js").then(m => m.claim("claude", "<task-slug>"))
```

It returns `claimed <path> — <who>`. Pass **your task slug** as the note: the
label is what tells Mike which of the running tasks owns this window.

`path` is required whenever more than one tab is open — omitted, `eval` takes
the first connected tab, which is somebody else's.

## 4. Work

The ring survives navigation, and it survives a **live reload** — which matters,
because editing any file under `public/` reloads your own claimed tab. The claim
is `sessionStorage`, and `DevBar` reinstates it on boot. Claim once.

## 5. Release when the task lands

```
mcp__site__eval  path: "…"  code: import("/framework/dev/Claim/claim.js").then(m => m.release())
```

Leaving a ring up after you finish is the failure mode — it tells Mike an agent
is still driving a window that nobody is driving. Release it in the same breath
as `landed_at`.

## ⚠ A claimed tab is a HIDDEN tab, and hidden tabs do not lay out

The single most expensive trap here. Mike is looking at some other window, so
your tab is `document.visibilityState === "hidden"` — and a hidden tab does not
run the rendering steps, which means **`requestAnimationFrame` never fires and
`ResizeObserver` never delivers**. Anything a page sizes from those is frozen at
whatever it was, and `getBoundingClientRect()` hands you that frozen geometry
with no error and no clue.

It cost half an hour on `styles/layouts/space/`: five screens that should have
measured 390–3440 all read 4184px and scored identically, and the "bug" was the
measurement.

- **Check first:** `document.visibilityState` — say so out loud in your notes if
  it is `hidden`.
- **`setTimeout` still fires** (throttled to ~1s), so state and text updates are
  trustworthy. Geometry is not.
- **For real geometry use `mcp__site__shot`** or headless Playwright — those
  drive their own foreground page. Or ask Mike to bring the tab forward.

## Two more things that will bite you

- **The ring paints nothing on `body`.** The theme class rides `.app`, so
  `var(--prim)` resolves to nothing one level out. `claim()` handles it; a
  hand-rolled overlay pasted into `eval` will not.
- **`eval` is loopback-only and 10s-limited** (`Server/plugins/MCP.js`,
  `SocketServer/Tab.js`). A `code` string that never settles returns *the tab
  did not answer in 10s* — which is a timeout, not a failure to claim.
