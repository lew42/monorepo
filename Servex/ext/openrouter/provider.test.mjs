/* provider.test.mjs — plain node, no framework, runs with no OpenRouter key.
 * `node Servex/ext/openrouter/provider.test.mjs` — exits 1 and prints the
 * failing assertion if anything breaks; exits 0 and prints "ok (n)" if not. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let n = 0;
function test(name, fn){ fn(); n++; console.log(`ok - ${name}`); }

// Point KEY_PATH at a scratch file for this run only, never the owner's real key
// or the repo. provider.js reads process.env.LOCALAPPDATA to build KEY_PATH, so
// a temp LOCALAPPDATA gives us a throwaway key path with zero risk of touching
// the real one at %LOCALAPPDATA%\lew42\servex\openrouter.key.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "openrouter-test-"));
process.env.LOCALAPPDATA = scratch;

const { env_for, provider_for, KEY_PATH, read_key, has_key, disallowed_tools_for, evaluate_guard, OR_DAILY_CAP_USD, warm_guard, spend_guard }
	= await import("./provider.js?t=" + Date.now());

test("provider_for: a model id with a / is openrouter", () => {
	assert.equal(provider_for("openai/gpt-6-luna"), "openrouter");
	assert.equal(provider_for("deepseek/deepseek-v4.1-flash"), "openrouter");
});

test("provider_for: a plain claude id is anthropic", () => {
	assert.equal(provider_for("claude-sonnet-5"), "anthropic");
	assert.equal(provider_for(undefined), "anthropic");
});

test("env_for('anthropic') changes nothing", () => {
	assert.deepEqual(env_for("anthropic"), {});
});

test("has_key() is false with no file", () => {
	assert.equal(has_key(), false);
});

test("read_key() / env_for('openrouter') throw ONE clear line with no key file", () => {
	assert.throws(() => read_key(), /no OpenRouter key at/);
	let message = null;
	try { env_for("openrouter"); } catch (e) { message = e.message; }
	assert.match(message, /no OpenRouter key at/);
	assert.ok(message.includes(KEY_PATH), "error names the exact path checked");
});

test("env_for('openrouter') gives the four vars right, with a key file present", () => {
	fs.mkdirSync(path.dirname(KEY_PATH), { recursive: true });
	fs.writeFileSync(KEY_PATH, "  sk-or-v1-test-key-123  \n");   // real keys can have stray whitespace
	assert.equal(has_key(), true);
	assert.equal(read_key(), "sk-or-v1-test-key-123");
	const env = env_for("openrouter");
	assert.equal(env.ANTHROPIC_BASE_URL, "https://openrouter.ai/api");
	assert.equal(env.ANTHROPIC_AUTH_TOKEN, "sk-or-v1-test-key-123");
	// blanked ON PURPOSE (readme.md): either one left set lets the CLI authenticate
	// past the base-url swap and bill the Claude subscription instead of OpenRouter
	assert.equal(env.ANTHROPIC_API_KEY, "");
	assert.equal(env.CLAUDE_CODE_OAUTH_TOKEN, "");
});

test("disallowed_tools_for: blocks ArtifactData on Gemini only (the tool-schema 400)", () => {
	assert.deepEqual(disallowed_tools_for("google/gemini-3.1-pro-preview"), ["ArtifactData"]);
	assert.deepEqual(disallowed_tools_for("google/gemini-3.8-flash"), ["ArtifactData"]);
	assert.deepEqual(disallowed_tools_for("openai/gpt-6-luna"), []);
	assert.deepEqual(disallowed_tools_for("deepseek/deepseek-v4.1-flash"), []);
	assert.deepEqual(disallowed_tools_for(undefined), []);
});

test("evaluate_guard: ok when well under the daily cap and credit is plentiful", () => {
	const r = evaluate_guard({ usage: 1, usage_daily: 0.5, limit: 100, limit_remaining: 49.5 });
	assert.equal(r.ok, true);
	assert.equal(r.reason, null);
});

test("evaluate_guard: refuses at or over the daily cap", () => {
	assert.equal(evaluate_guard({ usage_daily: OR_DAILY_CAP_USD, limit_remaining: 40 }).ok, false);
	assert.equal(evaluate_guard({ usage_daily: OR_DAILY_CAP_USD + 1, limit_remaining: 40 }).ok, false);
	// one cent under the cap is still fine
	assert.equal(evaluate_guard({ usage_daily: OR_DAILY_CAP_USD - 0.01, limit_remaining: 40 }).ok, true);
});

test("evaluate_guard: refuses under $1 of credit left even under the daily cap", () => {
	const r = evaluate_guard({ usage_daily: 0.1, limit_remaining: 0.99 });
	assert.equal(r.ok, false);
	assert.match(r.reason, /credit left/);
});

test("evaluate_guard: a custom cap overrides OR_DAILY_CAP_USD", () => {
	assert.equal(evaluate_guard({ usage_daily: 2, limit_remaining: 40 }, 1).ok, false);
	assert.equal(evaluate_guard({ usage_daily: 2, limit_remaining: 40 }, 5).ok, true);
});

test("evaluate_guard: the weekly pace allows one day ahead of the clock, no more", () => {
	// a $10 week, half elapsed: allowed = 10 × (0.5 + 1/7) ≈ $6.43
	assert.equal(evaluate_guard({ usage_daily: 0, usage_weekly: 6.3, limit_remaining: 40 }, 100, 10, 0.5).ok, true);
	const r = evaluate_guard({ usage_daily: 0, usage_weekly: 6.5, limit_remaining: 40 }, 100, 10, 0.5);
	assert.equal(r.ok, false);
	assert.match(r.reason, /ahead of pace/);
});

test("evaluate_guard: FAILS CLOSED with no reading at all (null status), and says to retry", () => {
	const r = evaluate_guard(null);
	assert.equal(r.ok, false);
	assert.match(r.reason, /can't be checked/);
	// review follow-up, 2026-10-01: the cold-start case ("no reading yet") is
	// transient, not broken — the reason has to say so, since Agents.spawn()
	// can't await a live read (see warm_guard()'s own comment in provider.js).
	assert.match(r.reason, /retry in a few seconds/);
});

test("warm_guard(): a no-op with no key file — no throw, no network, cache stays empty", async () => {
	// has_key() is false here (KEY_PATH not written yet in this fresh scratch dir
	// at the point this test runs — see test order above, or rm it back out first).
	fs.rmSync(KEY_PATH, { force: true });
	assert.equal(has_key(), false);
	await warm_guard();   // must resolve, not throw, and not attempt a fetch with no key
	// spend_guard() still fails closed afterwards — warm_guard() did nothing, on purpose
	assert.equal(spend_guard().ok, false);
});

fs.rmSync(scratch, { recursive: true, force: true });
console.log(`\nok (${n})`);
