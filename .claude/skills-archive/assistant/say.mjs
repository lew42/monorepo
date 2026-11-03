#!/usr/bin/env node
/* MOVED (2026-09-19): the skill is now `every-prompt`; the tool lives at
   .claude/skills/every-prompt/say.mjs. This forwarder keeps the old path working for the
   agents and briefs that were written before the rename. Same arguments, same behaviour. */
import "../every-prompt/say.mjs";
