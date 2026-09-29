// The readme chain a fresh agent starts with. Plain node: `node Servex/agents/readme-chain.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readme_chain, first_prompt } from "./readme-chain.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// readme_chain on a real directory in THIS repo: public/framework/ux/Dictate
// has its own readme.md, and so does the repo root and public/framework and
// public/framework/ux — public/ itself does not, so it should be skipped, not
// leave a gap or throw.
{
	const chain = readme_chain("public/framework/ux/Dictate");
	ok(Array.isArray(chain) && chain.length >= 2, "returns a non-trivial chain for a real dir");
	ok(chain[0].path === "readme.md", "root readme is first");
	ok(chain.every(r => typeof r.text === "string" && typeof r.truncated === "boolean"), "every entry has {path, text, truncated}");
	ok(chain.at(-1).path.endsWith("Dictate/readme.md"), "dir's own readme is last");
	ok(!chain.some(r => r.path === "public/readme.md"), "a level with no readme is skipped, not gapped");
}

// a directory that does not exist: no throw, just no readme found there (its
// ancestors that DO have one still come back).
{
	const chain = readme_chain("public/framework/does-not-exist-xyz");
	ok(Array.isArray(chain), "never throws on a missing dir");
	ok(!chain.some(r => r.path.includes("does-not-exist-xyz")), "the missing dir contributes nothing");
}

// outside the repo: refused quietly.
{
	const chain = readme_chain(path.join(os.tmpdir(), "not-the-repo-" + Date.now()));
	assert.deepStrictEqual(chain, [], "a dir outside the repo returns []");
}

// first-screen trimming: a readme with a `## More` heading is cut there, not
// at 40 lines, and is marked truncated. The fixture has to live INSIDE the
// repo (readme_chain refuses anything outside it) but NOT under `public/`,
// which the dev server's own watcher watches recursively (Server/health.mjs)
// — writing there would fire a live-site reload on every test run. Right
// beside this file, under `Servex/`, is inside the repo and outside `public/`.
{
	const dir = path.join(HERE, ".test-fixture-" + Date.now());
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, "readme.md"), "# Title\n\nOne line.\n\n## More\n\nEverything below this never ships.\n");
	const chain = readme_chain(dir);
	ok(chain.length >= 1, "a fixture readme with `## More` is found");
	const leaf = chain.at(-1);
	ok(leaf.truncated === true, "cut at `## More` is marked truncated");
	ok(!leaf.text.includes("never ships"), "text below `## More` is not included");
	ok(leaf.text.includes("One line."), "text above `## More` is kept");
	fs.rmSync(dir, { recursive: true, force: true });
}

// first_prompt: header, in-order readmes, extras appended after the chain.
{
	const prompt = first_prompt("public/framework/ux/Dictate", [{ label: "Recent sessions", text: "- none yet" }]);
	ok(prompt.startsWith("Where you are: readmes from the root down to public/framework/ux/Dictate"), "opens with the where-you-are line");
	ok(/^readme\.md/m.test(prompt), "the root readme's path appears");
	ok(prompt.includes("Dictate/readme.md"), "the leaf readme's path appears");
	ok(prompt.indexOf("Recent sessions") > prompt.indexOf("Dictate/readme.md"), "extras land after the chain");
	ok(prompt.includes("## Recent sessions\n- none yet"), "an extra is formatted as ## label + text");
}

// first_prompt with no extras still works and never throws.
{
	const prompt = first_prompt("public/framework/ux/Dictate");
	ok(typeof prompt === "string" && prompt.length > 0, "first_prompt with no extras returns a string");
}

// a dir with nothing at all: still returns the header, never throws.
{
	const prompt = first_prompt(path.join(os.tmpdir(), "nope-" + Date.now()));
	ok(prompt.startsWith("Where you are:"), "even an empty chain keeps the header");
}

console.log(`readme-chain.test.mjs: ${checks} checks passed`);
