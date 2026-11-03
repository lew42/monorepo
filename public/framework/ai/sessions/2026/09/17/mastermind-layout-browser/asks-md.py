"""Regenerate asks.md beside the run ledger: every ask with its status, newest day first."""
import json, io, datetime
D = "C:/Code/lew42/monorepo/public/framework/ai/2026-09-17/mastermind-layout-browser/"
asks = {}; order = []
for line in open(D + "task.jsonl", encoding="utf-8"):
    try: o = json.loads(line)
    except Exception: continue
    a = o.get("ask")
    if not a or "id" not in a: continue
    if a["id"] not in asks:
        asks[a["id"]] = {}; order.append(a["id"])
    asks[a["id"]].update(a)
day = lambda a: str(a.get("at", ""))[:10] or "2026-09-17"
WORD = {"landed": "DONE", "building": "IN FLIGHT", "open": "OPEN"}
counts = {}; body = []
for d in sorted({day(asks[i]) for i in order}, reverse=True):
    ids = [i for i in order if day(asks[i]) == d]
    body += ["## %s — %d requests" % (d, len(ids)), ""]
    for status in ("open", "building", "landed"):
        group = [i for i in ids if asks[i].get("status", "open") == status]
        if not group: continue
        body += ["### %s (%d)" % (WORD[status], len(group)), ""]
        for i in group:
            a = asks[i]; counts[status] = counts.get(status, 0) + 1
            n = a.get("needs") or {}
            wait = ""
            if n.get("owner") and n.get("owner") != "-" and not n.get("done"):
                wait = " **Waits on the owner:** %s (%s min)." % (n["owner"], n.get("minutes", "?"))
            tasks = ", ".join("`%s`" % t for t in a.get("tasks", []) if t)
            links = " ".join("[%s](%s)" % (l.get("label", l["url"]), l["url"]) for l in a.get("links", [])[:2])
            body.append("- **%s** (%s) — %s → %s%s%s%s" % (i, a.get("topic", ""), a.get("summary", ""), a.get("conclusion", "—"), wait, (" Tasks: %s." % tasks) if tasks else "", (" " + links) if links else ""))
        body.append("")
stamp = datetime.datetime.now().astimezone().isoformat(timespec="minutes")
head = ["# Everything the owner asked for in this run — with status (generated %s)" % stamp, "",
        "One line per request: **id** (topic) — what was asked → what happened. Generated from the `ask` lines of `task.jsonl` beside this file (merged by id, the last line wins) by the script `asks-md.py` (a copy is beside this file); regenerate it rather than editing it. The owner's verbatim words are each ask's `quote` in the ledger, and every relayed prompt is a `chat` line (`from: \"owner\"`).", "",
        "Totals: %d done · %d in flight · %d open." % (counts.get("landed", 0), counts.get("building", 0), counts.get("open", 0)), "",
        "**New mastermind: start with the OPEN and IN FLIGHT items of 2026-09-19 — they are what the owner is waiting on.**", ""]
io.open(D + "asks.md", "w", encoding="utf-8", newline="\n").write("\n".join(head + body) + "\n")
print(len(order), counts)
