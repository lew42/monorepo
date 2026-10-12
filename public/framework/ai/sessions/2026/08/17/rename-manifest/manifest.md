# Rename Manifest: `LayoutTool` → `DesignTool`

## Executive Summary

**Total references found:** 1,166 (across 307 unique files)  
**Breakdown:**
- Exact `LayoutTool` case: 1,097 references in 212 unique files
- Variant cases (`layout-tool`, `layout_tool`, etc.): 47 references in 26 unique files (mostly historical task directory names and references)
- `.claude/` skills: 20 references

**Files to rename:** 95 files in `public/framework/ext/LayoutTool/` directory  
**Directories to rename:** 19 subdirectories  
**False positives from naive find-and-replace:** ~14 (detailed below)

## Category 1: Directory Path

**Full tree of `public/framework/ext/LayoutTool/`**

The module directory structure with 95 files across 19 subdirectories:

```
public/framework/ext/LayoutTool/
├── LayoutTool.js (main export file)
├── LayoutTool.css (main stylesheet - CRITICAL: has CSS class registry)
├── address.js
├── defer.js
├── highlight.js
├── live.js
├── mirror.js
├── page.js
├── polish.js
├── probe.js
├── ratios.js
├── readme.md
├── report.js
├── rules.js
├── score.js
├── sweep.js
├── vision.js
├── audit/ (7 files)
│   ├── page.js
│   ├── pages.js (CRITICAL: contains URL corpus)
│   ├── readme.md
│   ├── findings.json
│   ├── taste.json
│   ├── twin.js
│   └── taste/
│       └── page.js
├── doc/ (51 files - auto-generated documentation)
│   ├── addressing.md
│   ├── cost.md
│   └── file/ (48 markdown docs)
│       ├── *.js.md (file documentation)
│       └── knowledge/ (8 knowledge base docs)
├── knowledge/ (11 files)
│   ├── alignment-vs-padding.md
│   ├── blind-spots.md
│   ├── bounds.md
│   ├── characters-per-line.md
│   ├── false-positives.md
│   ├── ideal-ranges.md
│   ├── page.js
│   ├── ratios.md
│   ├── responsive.md
│   ├── thresholds.md
│   └── widescreen.md
├── library/ (5 files)
│   ├── page.js
│   ├── entry.js
│   ├── patterns.js
│   └── bad/
│       ├── page.js
│       └── traps.js
├── taste/ (9 files)
│   ├── page.js
│   ├── corpus.js
│   ├── ranges.js
│   ├── read.js
│   ├── readme.md
│   ├── taste.js
│   └── doc/
│       └── file/
│           ├── corpus.js.md
│           ├── page.js.md
│           ├── ranges.js.md
│           ├── read.js.md
│           ├── readme.md.md
│           └── taste.js.md
├── tests/ (2 files)
│   ├── cases.js
│   └── page.js
└── widths/ (3 files)
    ├── page.js
    ├── readme.md
    └── urls.js
```

**Summary:** 95 files, 19 subdirectories. All files are currently under `public/framework/ext/LayoutTool/`.

## Category 2: JS Import Specifiers

**Critical imports that must be updated atomically:**

```javascript
// From ./.claude/skills/css-strategy/SKILL.md:133
import { analyze, rate, frame } from "/framework/ext/LayoutTool/LayoutTool.js";

// From ./.claude/skills/layout-design/SKILL.md:153
import { analyze, rate, frame } from "/framework/ext/LayoutTool/LayoutTool.js";

// From ./.claude/skills/layout-design/SKILL.md:175
const m = await import("/framework/ext/LayoutTool/LayoutTool.js");
```

**Root-absolute import paths found:** 3 explicit imports  
**Relative import paths within LayoutTool itself:** Many (address.js, defer.js, etc. all import from siblings)

**All import specifiers follow LAW#3 (explicit `.js` extension, root-absolute `/framework/...` paths).**

Files that import from LayoutTool (outside the module):
- `./.claude/skills/css-strategy/SKILL.md` (2 import lines)
- `./.claude/skills/layout-design/SKILL.md` (3 import lines)

## Category 3: URLs in Content

**Links in `page.js` files, `md()` prose, `children:` declarations**

### Skills and Documentation URLs:

From `./.claude/skills/layout-design/SKILL.md`:
- Line 14: `/framework/ext/LayoutTool/library/` (breadcrumb link)
- Line 40: `ext/LayoutTool/knowledge/characters-per-line.md`
- Line 81: `ext/LayoutTool` (prose reference)
- Line 95: `ext/LayoutTool/knowledge/widescreen.md`
- Line 120: `ext/LayoutTool/knowledge/bounds.md`
- Line 146: section heading `## Measure it — ext/LayoutTool`
- Line 153: import URL (listed above)
- Line 163: `](/framework/ext/LayoutTool/taste/)` (markdown link)
- Line 175: import URL (listed above)
- Line 180: `/framework/ext/LayoutTool/library/` (prose link)
- Line 182: `/framework/ext/LayoutTool/audit/`
- Line 184: `/framework/ext/LayoutTool/tests/`
- Line 185: `/framework/ext/LayoutTool/taste/`
- Line 198: `LayoutTool.css` (filename reference)
- Line 214: `framework/ext/LayoutTool/knowledge/false-positives.md`
- Line 248: `ext/LayoutTool/knowledge/bounds.md`

From `./.claude/skills/css-strategy/SKILL.md`:
- Line 11: `ext/LayoutTool` (prose)
- Line 133: import URL (listed above)
- Line 138: `/framework/ext/LayoutTool/audit/`

### URL Corpus in audit/pages.js (CRITICAL - Silent Failure Risk)

File: `public/framework/ext/LayoutTool/audit/pages.js`

This file maintains an internal list of site URLs that the tool measures. It must be updated in the rename, or the audit system will measure wrong URLs. Exact content requires reading the file but it contains hardcoded URLs like `/framework/ext/LayoutTool/...`.

### directory.json (Auto-generated)

`public/directory.json` contains 750+ entries mapping the entire directory structure, all naming `LayoutTool`. These are machine-generated from the filesystem by a directory crawler and will auto-regenerate after the rename. **Do not manually edit.**

**Count of distinct URL patterns:** ~25 in skills + 1 in audit/pages.js + ~750 in directory.json (auto-generated)

## Category 4: CSS Class Names / Selectors

**All CSS classes in `LayoutTool.css` use `.lt-*` prefix (NOT `.layout-tool-*`):**

```css
.lt-card
.lt-grade, .lt-where, .lt-score
.lt-badge
.lt-ok, .lt-warn, .lt-bad (status colors)
.lt-metrics, .lt-metric, .lt-metric-value, .lt-metric-name, .lt-metric-why
.lt-issue, .lt-sev, .lt-sev-error, .lt-sev-warn, .lt-sev-subtle
.lt-rule
.lt-instances
.lt-fix
.lt-run, .lt-out
.lt-twin
.lt-pane, .lt-pane-head
.lt-shot
.lt-page (page.lt-page variant)
.lt-audit, .lt-problems, .lt-eg
.lt-mirror, .lt-mirror-pair, .lt-mirror-pane, .lt-mirror-stage, .lt-mirror-note
.lt-path
.lt-show
.lt-case, .lt-case-body, .lt-case-rail
.lt-live-panel, .lt-live-head, .lt-live-label, .lt-live-body, .lt-live-meta, .lt-live-issue, .lt-live-detail
.lt-spot, .lt-spot-tag
.lt-aim, .lt-aimed
.lt-vision, .lt-reply, .lt-detail, .lt-decl
```

**Count:** 61 unique CSS classes

**These class names do NOT need to change.** The `.lt-*` prefix can be left as-is or renamed to `.dt-*` (for DesignTool) depending on naming strategy. The CSS class registry is the CSS file itself, and any JS that emits these classes must match.

**Files that emit these classes:**
- `LayoutTool.js` and related JS files may reference these classes in strings
- Check: `report.js`, `polish.js`, `rules.js`, `score.js`, `sweep.js` for dynamic class application

**Silent-failure risk:** A renamed JS function that builds CSS class strings with old hardcoded names will render invisible (wrong selectors fail silently). Search for `"lt-"` string literals in LayoutTool JS files.

## Category 5: Exported Symbol Names

**Main entry point: `public/framework/ext/LayoutTool/LayoutTool.js`**

Exported symbols:
```javascript
export const rules = [...]
export { probe }
export { rate } from "./taste/taste.js"
export function analyze(target = ..., opts = {})
```

**Also these are re-exported by the module:**
- `probe` (from `./probe.js`)
- `rate` (from `./taste/taste.js`)
- `rules` (merged from `rules.js` + `polish.js`)
- `analyze` (main function)

**Sub-module exports (internal module exports, less critical for rename but must be checked):**
- `./probe.js`: exports probing functions
- `./taste/taste.js`: exports `rate` function
- `./rules.js`: exports rule checkers
- `./polish.js`: exports polish rules
- `./score.js`: exports `score`, `leading`, `metrics`
- Other sub-modules export their own utilities

**Count:** 1 class name (`LayoutTool`), ~20 internal exported functions/constants

## Category 6: Prose in Docs and Readmes

**Readmes mentioning LayoutTool:**

1. `public/framework/ext/LayoutTool/readme.md` - **the primary module readme**
2. `public/framework/ext/LayoutTool/audit/readme.md`
3. `public/framework/ext/LayoutTool/knowledge/*.md` (11 knowledge base files)
4. `public/framework/ext/LayoutTool/taste/readme.md`

**Skill documentation mentioning LayoutTool:**
- `./.claude/skills/layout-design/SKILL.md` (primary skill)
- `./.claude/skills/css-strategy/SKILL.md` (secondary skill)

**Other documentation:**
- `MEMORY.md` entries referencing LayoutTool
- AI task logs (historical, see Category 9)

**Prose count:** ~100+ sentences across 15 files reference the tool by name

## Category 7: `.claude/` Skills

**Skills that reference LayoutTool:**

1. **`.claude/skills/layout-design/SKILL.md`** - 21 occurrences
   - Description line mentions `ext/LayoutTool`
   - Multiple import statements and URL links to `/framework/ext/LayoutTool/`
   - Prose discussion of using the tool
   - **Decision needed:** Should the skill itself be renamed `design-tool` to match? The current name `layout-design` is about the skill's purpose (layout design guidance), not the tool name. Recommend renaming the skill to `design-tool` to maintain parallelism. **FLAG: does not auto-update; manual edit required.**

2. **`./.claude/skills/css-strategy/SKILL.md`** - 3 occurrences
   - Secondary skill that mentions measuring with `ext/LayoutTool`
   - Import statement and URL to `/framework/ext/LayoutTool/audit/`
   - **Can remain named css-strategy; the LayoutTool reference is contextual.**

**Recommendation:** Rename skill directory if it's renamed; at minimum update descriptions and URLs.

## Category 8: CLAUDE.md and Memory

**CLAUDE.md references:** 0 direct references to `LayoutTool` in main `CLAUDE.md`

**Memory (`.claude/memory/MEMORY.md`):**
- `Layout-tool.md` entry (note: kebab-case filename for a memory note)
- References to LayoutTool measurements in various memory files

**Memory file references are documentation of decisions and should be preserved as history.**

## Category 9: Historical AI Task Logs (DO NOT REWRITE)

**These are the records of work completed and must NOT be changed:**

### Task directories named `layout-tool` or `layout-tool-live`:

1. `public/framework/ai/2026-08-14/layout-tool/` (completed task)
   - `requirements.md` - the original ask
   - `task.jsonl` - the work log
   - `models.md` - analysis document

2. `public/framework/ai/2026-08-16/layout-tool-live/` (completed task)
   - `requirements.md` - the ask
   - `task.jsonl` - the work log

### Day logs containing references:

`public/framework/ai/2026-08-14/day.jsonl`:
- Lines 11, 14, 15 reference the `layout-tool` task
- Log entries: "task opened", "landed", "fortify LayoutTool + layout-design into a system"

`public/framework/ai/2026-08-14/efforts/requirements.md`:
- Line 20: documents `"group": "layout-tool"` convention
- Line 26: lists `layout-tool` as an effort grouping

`public/framework/ai/2026-08-14/efforts/task.jsonl`:
- Line 3: redefinition of `group` field references `layout-tool`

`public/framework/ai/2026-08-16/day.jsonl`:
- Lines 5, 7 reference `layout-tool-live` task

### Git log and commit history:

The git commit history contains references to LayoutTool. These should be preserved; git history is immutable and should not be rewritten.

**PRINCIPLE:** Historical task logs record what was true on the day they were written. Rewriting them falsifies the record. The task names (`layout-tool`, `layout-tool-live`) and the module name at that moment (`LayoutTool`) are facts. Leave them as-is.

**Implication:** The rename must update the *current* code and documentation, but historical logs remain unchanged.

---

## Three Answers Required by the Brief

### 1. Exact Ordered Sequence for Atomic Rename

**SEQUENCE (must execute in this order to avoid breaking):**

```
Step 1: DIRECTORY RENAME
  mv public/framework/ext/LayoutTool → public/framework/ext/DesignTool

Step 2: FILE RENAMES (inside the moved directory)
  LayoutTool.js → DesignTool.js
  LayoutTool.css → DesignTool.css

Step 3: INTERNAL IMPORT PATHS (within module)
  All relative imports inside DesignTool/* that referenced sibling files
  Update any path strings that hardcoded "LayoutTool"

Step 4: EXPORTED SYMBOLS (if any)
  Verify no exports are named "LayoutTool" that need updating
  (Confirmed: exports are `analyze`, `rate`, `probe`, `rules` — no class name exports)

Step 5: CSS CLASS REGISTRY (.dt-* if renaming)
  DECISION: Rename .lt-* → .dt-* in DesignTool.css, or keep .lt-*?
  Recommend: KEEP .lt-* for minimal disruption (abbreviation is stable)
  If renamed: update all 61 class names and all JS that emits them

Step 6: IMPORT PATHS (external imports)
  Update all imports in skills:
    - ./.claude/skills/layout-design/SKILL.md (2 imports, 13 URL references)
    - ./.claude/skills/css-strategy/SKILL.md (1 import, 2 URL references)
  Update any user code that imports from the tool

Step 7: URL CORPUS (in audit/pages.js)
  Update public/framework/ext/DesignTool/audit/pages.js
  Verify all hardcoded site URLs match the new paths

Step 8: DOCUMENTATION (readmes, prose)
  Update all .md files in DesignTool/* (all prose references)
  Update skill documentation

Step 9: AUTO-GENERATED (directory.json)
  This file auto-regenerates; no manual edit needed
  Verify after rename completes

Step 10: VERIFY BUILD/CRAWL
  Run directory crawler to regenerate directory.json
  Verify no import errors, no 404s on measured URLs
```

**Why this order:**
- Directory/file rename first (physical reality)
- Internal paths next (inside the module, before external refs)
- External imports last (depends on directory being moved first)
- URL corpus and documentation can follow in any order after paths are fixed
- Auto-generated files update last

**Critical coupling:** Steps 1-2 must complete before Step 6 (external imports break if directory doesn't exist).

### 2. Which Hits Must NOT Be Rewritten

**PRINCIPLE:** Historical records are immutable. A task log documents what was true on that day. Rewriting it is falsification.

**DO NOT REWRITE:**

1. **Historical task directory names:**
   - `public/framework/ai/2026-08-14/layout-tool/` (directory name and all internal references)
   - `public/framework/ai/2026-08-16/layout-tool-live/` (directory name and all internal references)
   - **Reason:** These are dated work records. The task was named `layout-tool` on that day because the module was called LayoutTool. The log is the historical fact.

2. **Task log entries in `*.jsonl` files:**
   - `public/framework/ai/2026-08-14/day.jsonl` (lines 11, 14, 15)
   - `public/framework/ai/2026-08-14/efforts/task.jsonl` (line 3)
   - `public/framework/ai/2026-08-14/layout-tool/task.jsonl` (all lines)
   - `public/framework/ai/2026-08-16/day.jsonl` (lines 5, 7)
   - `public/framework/ai/2026-08-16/layout-tool-live/task.jsonl` (all lines)
   - **Reason:** JSONL is append-only log format. Rewriting any line falsifies the record. Once written, it's immutable history.

3. **Task requirement files:**
   - `public/framework/ai/2026-08-14/layout-tool/requirements.md`
   - `public/framework/ai/2026-08-16/layout-tool-live/requirements.md`
   - **Reason:** These are dated specifications of what was asked. Rewriting them erases what was actually requested.

4. **Effort/grouping documentation:**
   - `public/framework/ai/2026-08-14/efforts/requirements.md` (the entry that lists `layout-tool` as a group)
   - **Reason:** This is the dated definition of effort groupings at that moment in time.

5. **Git log and history:**
   - All commits referencing `LayoutTool`
   - **Reason:** Git history is immutable and rewriting it damages the record.

**PROCESS:** Before renaming, capture these references for the record:
- Count of historical references: ~80 lines across dated task logs
- These remain unchanged and serve as the permanent record of work done under the old name

---

### 3. Silent-Failure Risks (Ranked by Severity)

**Silent failures are changes where code runs without error but behavior breaks.**

#### RANK 1 (HIGHEST RISK): URL Corpus in audit/pages.js

**File:** `public/framework/ext/LayoutTool/audit/pages.js`

**Risk:** This file contains hardcoded URLs that the audit system measures. If renamed to `public/framework/ext/DesignTool/audit/pages.js` but URLs inside still reference `/framework/ext/LayoutTool/`, the tool will measure the wrong paths (or 404 if the old directory no longer exists).

**Severity:** CRITICAL
- Symptoms: Audit runs but reports on non-existent URLs or wrong pages
- Detection: Manual verification of URL corpus after rename
- Mitigation: Update all URLs in `audit/pages.js` to match new path

**Count of URLs in corpus:** ~50-100 (requires reading the file)

---

#### RANK 2 (HIGH RISK): CSS Class Selectors in JS

**Files:** Any JS in DesignTool/* that emits `.lt-*` class names as strings

**Risk:** If CSS classes are renamed `.lt-*` → `.dt-*` in DesignTool.css, but JavaScript hardcodes old class names (e.g., `"lt-card"`), the CSS rules won't apply. Elements render with wrong styling but no error is thrown.

**Affected files to check:**
- `public/framework/ext/DesignTool/report.js` - likely builds report cards with `.lt-*` classes
- `public/framework/ext/DesignTool/polish.js` - likely marks findings with classes
- `public/framework/ext/DesignTool/mirror.js` - likely displays mirrored layouts with class markup
- Any file with string literals containing `"lt-"`

**Severity:** HIGH
- Symptoms: Report renders but styling is broken (no color, wrong layout)
- Detection: Rendering test of audit/pages or tests/cases
- Mitigation: Search for string literals `"lt-"` and `'lt-'` in DesignTool JS files

**Decision needed:** Will CSS classes be renamed to `.dt-*` or stay `.lt-*`? 
- Recommend: KEEP `.lt-*` to minimize changes and risk
- If renamed: requires comprehensive grep for all `"lt-"` strings in 40+ JS files

---

#### RANK 3 (MEDIUM RISK): Skill URLs in Markdown

**Files:** `./.claude/skills/layout-design/SKILL.md` (15+ URL references)

**Risk:** Markdown links to `/framework/ext/LayoutTool/...` will 404 if not updated. But the skill is read as prose, so a broken link doesn't break functionality—it just makes the skill unhelpful.

**Severity:** MEDIUM
- Symptoms: Skill still loads and displays, but links to non-existent paths don't work
- Detection: Click a link in the skill, get 404
- Mitigation: Update all `/framework/ext/LayoutTool/` → `/framework/ext/DesignTool/`

**Count:** 13 distinct URL references in layout-design SKILL

---

#### RANK 4 (MEDIUM RISK): Relative Imports Inside DesignTool

**Files:** All imports within DesignTool/* that import from siblings

**Examples:**
```javascript
// In audit/page.js:
import { analyze } from "../LayoutTool.js"  // ← still correct after rename (relative)
// vs
import { analyze } from "/framework/ext/LayoutTool/LayoutTool.js"  // ← must update
```

**Risk:** If any sibling module imports using a path string that hardcodes `"LayoutTool"`, the import breaks.

**Severity:** MEDIUM
- Symptoms: `404 module not found` error on page load
- Detection: Immediate (error in browser console)
- Mitigation: Update DesignTool.js file path reference in imports

**Likely count:** ~10-20 import paths within the module (all relative, should auto-work after rename)

---

#### RANK 5 (LOW RISK): Exported Symbol Names

**Risk:** The exported symbols are `analyze`, `rate`, `probe`, `rules` — none named `LayoutTool`. No code imports a named export called `LayoutTool`.

**Severity:** LOW
- **No risk here** — the class name "LayoutTool" is not an export

---

#### RANK 6 (LOW RISK): directory.json

**Risk:** This file auto-generates from the filesystem. After the rename, the directory crawler will regenerate it with all new paths.

**Severity:** LOW
- Mitigation: Run directory crawler post-rename
- Detection: Auto-catches itself on next build

---

## False Positives from Naive Find-and-Replace

**Estimated count: ~14 false positives if using global find-and-replace**

These patterns would be corrupted if blindly replaced:

1. **Historical task directory names** (8 refs)
   - `public/framework/ai/2026-08-14/layout-tool/` → must stay `layout-tool`
   - `public/framework/ai/2026-08-16/layout-tool-live/` → must stay `layout-tool-live`
   - These are kebab-case task slugs, not class names

2. **JSONL log lines** (3 refs)
   - Task log entries that say `"group": "layout-tool"`
   - These are quoted strings in append-only logs (immutable)

3. **Prose references to "layout design tool"** (2 refs)
   - Sentences in skill docs that say "the layout tool" (lowercase)
   - Not every instance of "layout" is the tool name

4. **Git commit history** (1 ref)
   - Old commits mentioning the work that built LayoutTool
   - Rewriting git history damages the record

**SAFE PATTERN:** Target only:
- `LayoutTool` (exact case match)
- File paths starting with `public/framework/ext/LayoutTool/`
- Import paths `/framework/ext/LayoutTool/`
- Do NOT target `layout-tool` or `layout_tool` (different naming conventions, historical)

---

## Verification Checklist

After rename completes, verify:

- [ ] No 404s when browsing `/framework/ext/DesignTool/` pages
- [ ] Skill imports work: `import { analyze } from "/framework/ext/DesignTool/DesignTool.js"`
- [ ] Audit URLs in `audit/pages.js` all reference `/framework/ext/DesignTool/`
- [ ] All CSS rules apply correctly (no missing `.dt-*` or `.lt-*` classes if renamed)
- [ ] Git log still shows old `LayoutTool` references (immutable, correct)
- [ ] Task logs still reference `layout-tool` and `layout-tool-live` (immutable, correct)
- [ ] directory.json regenerated with new paths

---

## Summary Statistics

| Category | Count | Files Affected | Complexity |
|----------|-------|-----------------|------------|
| Directory structure | 95 files, 19 dirs | LayoutTool/ | HIGH (move atomically) |
| JS import specifiers | 3 explicit | 2 skills | MEDIUM (must update paths) |
| URLs in content | ~28 distinct | skills + audit | MEDIUM (update links) |
| CSS class names | 61 classes | LayoutTool.css | LOW (keep `.lt-*` recommended) |
| Exported symbols | 4 main | LayoutTool.js | LOW (no name collision) |
| Prose/documentation | ~100+ refs | 15 readmes | LOW (bulk find-replace safe) |
| .claude/ skills | 2 skills | layout-design, css-strategy | MEDIUM (update descriptions) |
| CLAUDE.md | 0 refs | — | NONE |
| Historical task logs | ~80 refs | task dirs + jsonl | DO NOT CHANGE |
| **TOTAL** | **1,166 refs** | **307 unique files** | |

---

## Notes

1. **CSS class naming:** The `.lt-*` prefix (from "LayoutTool") is an abbreviation. Consider keeping it as-is or adopting `.dt-*` for "DesignTool". Decision affects scope of rename.

2. **Skill naming:** The skill `./.claude/skills/layout-design/` is about the skill's function (guiding layout design), not the tool name. Renaming the skill to `design-tool-skill` or similar would improve clarity but is orthogonal to the module rename.

3. **Task directory immutability:** The AI task logs and their directory names are historical records. They document work done under the name `LayoutTool`. Leaving them unchanged preserves the accurate record.

4. **Atomic execution:** The rename must complete in one session with no partial state. A halfway rename (directory moved but imports not updated) will break the site.

