# Smoke test findings: AI system readmes

| file:line | problem | evidence | fix |
|---|---|---|---|
| system/readme.md:5 | Stale filename reference | Readme says "`models.json`", but actual file is `now.json` (confirmed in `/framework/ai/models/ModelsPage.js` line 4: `static DATA = new URL("./now.json", import.meta.url)`) | Change "`models.json`" to "`now.json`" |
| system/readme.md:5 | Stale generation date | Readme says "(generated 2026-10-02)", but `public/framework/ai/models/now.json` contains "generated_at": "2026-10-13T22:11:12.373Z" | Change "(generated 2026-10-02)" to "(updated 2026-10-13)" or remove date |

**Summary:** All 10 readmes checked; all links verified to exist; no contradictions found except stale references above in system/readme.md.
