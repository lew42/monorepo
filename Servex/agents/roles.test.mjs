/* node Servex/agents/roles.test.mjs — every role readme a row names exists, rides whole in the first
 * message, and a skill that became a pointer still returns the full text (roles/readme.md). */
import assert from "node:assert";
import { ROLES, opening, injected, skill_text, role_readme } from "./roles.js";
import { SKILLS } from "./directory.js";
let n = 0;
for (const [role, r] of Object.entries(ROLES)) {
	if (!r.readme) continue;
	const text = role_readme(r.readme);
	assert.ok(text && text.length > 500, `${role}: roles/${r.readme}.md exists and has its text`); n++;
	const first = opening(role, "GO");
	assert.ok(first.includes(`<role-readme path="Servex/agents/roles/${r.readme}.md">`) && first.includes(text) && first.endsWith("Now: GO"), `${role}: the readme rides whole in the first message`); n++;
	assert.equal(injected(role)[0], `roles/${r.readme}`, `${role}: injected names the readme`); n++;
}
for (const [skill, readme] of [["minion", "minion"], ["sub-mastermind", "task-mastermind"], ["servex-mastermind", "servex-mastermind"], ["mastermind", "mastermind"], ["review", "reviewer"], ["clarity", "clarity"]]) {
	assert.equal(skill_text(skill), role_readme(readme), `skill ${skill} -> roles/${readme}.md`); n++;
}
assert.ok(skill_text("research").length > 500 && !skill_text("research").startsWith("Read `Servex"), "an unmoved skill reads as before"); n++;
assert.ok(SKILLS.every(s => skill_text(s)?.length > 500), "directory.js's skills resolve to full text"); n++;
console.log(`roles: ${n} checks passed`);
