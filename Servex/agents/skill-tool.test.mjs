/* node Servex/agents/skill-tool.test.mjs — the `skill` tool returns a skill's text or lists skills (Servex/doc/owner-2026-10-16-tools.md). */
import assert from "node:assert";
const { tools } = await import("./tools.js");
const skill = tools({}).find(t => t.name === "skill");
assert.ok(skill, "skill tool is registered");
const text = await skill.handler({ name: "voice-mastermind" });
assert.ok(text.length > 200 && !text.startsWith("---"), "full text, no frontmatter");
const listed = await skill.handler({});
assert.match(listed, /- voice-mastermind: /, "no name lists skills with descriptions");
assert.match(await skill.handler({ name: "nope" }), /No skill named "nope"/, "unknown name says so and lists");
assert.match(await skill.handler({ name: "../../CLAUDE" }), /Skills:/, "path tricks only list");
console.log("skill-tool: 6 checks ok");
process.exit(0);
