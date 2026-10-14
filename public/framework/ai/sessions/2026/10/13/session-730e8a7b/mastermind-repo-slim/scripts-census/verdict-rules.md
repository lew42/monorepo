Verdict per file (exactly one):
- live: referenced by a running path (a hook, Servex code, a skill, a readme, package.json).
- tool: run by hand and documented somewhere (name where, from refFiles).
- stale: no reference/mention (refs 0 or only itself), last touched before 2026-09-13, or superseded by a named newer script (name it).
- misnamed: a class in a lowercase file (lowerCaseClass true) or a function bag (kind bag) that should be a class, per the code skill.
Note: Servex/ext and .claude/hooks files are loaded by path/config, so refs 0 alone is weak evidence; say so in the reason. If both stale and misnamed apply, choose stale.
Output a JSON array [{file, verdict, reason(one line), evidence(the refFile, date or header you used)}] to verdicts-N.json. Read only the batch file; do not open the scripts.