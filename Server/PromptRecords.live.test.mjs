// The live refiner path with the model call stubbed: the brief comes from ext/Refine/PartsBrief.js and the model is Sonnet.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import PromptRecords from "./PromptRecords.mjs";
import PARTS_BRIEF from "../public/framework/ext/Refine/PartsBrief.js";

const folder = fs.mkdtempSync(path.join(os.tmpdir(), "live-refine-"));
const calls = [];
PromptRecords.ask = async (prompt, opts) => { calls.push({ prompt, ...opts }); return { text: '{"subject":"login","parts":[{"cites":[0],"kind":"ask","text":"Fix the login page.","parts":[]}]}', usd: 0.001 }; };

const pr = new PromptRecords("11111111-2222-3333-4444-555555555555", { process: "live", folder, by: "test" });
const p = { uuid: "22222222-2222-3333-4444-555555555555", text: "Fix the login page. It is broken.", line: 1, at: "2026-11-09T00:00:00Z" };
await pr.sentences([p]);
const parts = await pr.parts_one(p);

assert.equal(PromptRecords.PARTS_BRIEF, PARTS_BRIEF, "the brief is the one in ext/Refine/PartsBrief.js");
assert.equal(calls[0].system, PARTS_BRIEF, "the model call gets that brief");
assert.equal(calls[0].model, PromptRecords.PROCESSES.live.parts.model);
assert.equal(calls[0].model, "claude-sonnet-5", "live parts run on Sonnet");
assert.equal(PromptRecords.PROCESSES.review.parts.model, "claude-haiku-5-5", "review stays on Haiku");
assert.equal(parts.length, 1);
assert.equal(parts[0].kind, "ask");
fs.rmSync(folder, { recursive: true, force: true });
console.log("PromptRecords.live.test: ok");
