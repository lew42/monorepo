/* THE ONE PLACE A TIER BECOMES A MODEL ID.
 * A role is four things: skill + tier + effort + tools; this file is only the tier.
 * Moving a tier to another provider (e.g. OpenRouter) is a one-line change here. */
export const TIERS = {
	// fast = Haiku (the owner, 2026-10-13: "fast = Haiku, smart = Sonnet"); judgment roles that used to share it moved to `manager` in roles.js.
	fast: { provider: "anthropic", model: "claude-haiku-5-5" },
	// ALL TIERS SONNET (the owner, 2026-10-07: the week ran out two days early; Opus is for a stated reason only).
	manager: { provider: "anthropic", model: "claude-sonnet-5-5" },
	architect: { provider: "anthropic", model: "claude-sonnet-5-5" },
	scan: { provider: "anthropic", model: "claude-haiku-5-5" },
	// The voice session's smart seat (the owner, 2026-10-25): Opus 5.5, so the owner dictates straight to an agent that can act.
	voice_smart: { provider: "anthropic", model: "claude-opus-5-5" },
	/* EXAMPLE, not wired to any role yet (Servex/ext/openrouter/readme.md): giving
	 * a role this tier instead of `scan` would send every one of its turns through
	 * OpenRouter at whatever the cheapest model there costs. `roles.js`'s
	 * `defaults()` copies a row's `provider` onto any role whose `tier` names it
	 * (review.md finding 5 — this field used to have no caller at all, and only
	 * worked by accident when the model also happened to contain a `/`), so the
	 * only thing stopping this today is "nobody has measured whether a cheap
	 * OpenRouter model finishes a scan as well as Haiku does" (the spike's job). */
	scan_openrouter: { provider: "openrouter", model: "deepseek/deepseek-v4.1-flash" },
	/* EXAMPLE, not wired to any role yet (public/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/):
	 * a role on this tier runs entirely on this machine's own GPU through
	 * Servex/ext/local/ — no network, no per-token cost, but a much smaller
	 * model than Haiku. Swap `local/qwen2.5-coder` for `local/gemma-3-4b` or
	 * `local/gemma-4-e4b` to try the other two models this GPU fits. */
	local_qwen: { provider: "local", model: "local/qwen2.5-coder" }
};

/* THE OWNER'S SWITCH (2026-10-05, Claude week at 98%): when session-backend.txt says `openrouter`,
 * EVERY Anthropic tier resolves to OpenRouter too, so spawned masterminds and minions never burn
 * Claude tokens. Read once at load: change the file, then restart Servex. Delete the file to go back. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
export const OR_ONLY = (() => {
	try {
		const f = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "lew42", "servex", "session-backend.txt");
		return fs.readFileSync(f, "utf8").trim().toLowerCase() === "openrouter";
	} catch { return false; }
})();
export const OR_MODEL = "openai/gpt-6-luna";
export const model = tier => (OR_ONLY && TIERS[tier]?.provider === "anthropic") ? OR_MODEL : (TIERS[tier]?.model ?? tier);
export const provider = tier => (OR_ONLY && TIERS[tier]?.provider === "anthropic") ? "openrouter" : (TIERS[tier]?.provider ?? "anthropic");
