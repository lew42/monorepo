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

const { env_for, provider_for, KEY_PATH, read_key, has_key } = await import("./provider.js?t=" + Date.now());

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

fs.rmSync(scratch, { recursive: true, force: true });
console.log(`\nok (${n})`);
