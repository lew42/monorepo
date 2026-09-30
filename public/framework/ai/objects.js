import { div, a, span, small, strong, icon } from "/app.js";

/* EVERY OBJECT IN THE AI SYSTEM HAS THREE VIEWS (the owner, 2026-09-30: "creating UI
   for each of the object-oriented things that exist within the AI system").

     obj.chip()    an icon and a name, inline
     obj.row()     one line: icon, name, one fact
     obj.panel()   a card: icon, name, every fact, a link

   AIObject holds the three views; a subclass says only what it is (`icon`, `kind`)
   and what it knows (`name()`, `fact()`, `facts()`, `href()`). Each view is its own
   method, so a subclass can replace one without touching the others. */
export class AIObject {
	constructor(data){ Object.assign(this, data); }

	static icon = "category";
	static kind = "Object";

	name(){ return this.title ?? this.id ?? "?"; }
	fact(){ return ""; }
	facts(){ return []; }
	href(){ return null; }

	chip(){
		return a.c("ai-obj-chip", () => { icon(this.constructor.icon); span(this.name()); }).attr("href", this.href() ?? "#")
			.style({ display: "inline-flex", gap: ".35em", alignItems: "center", textDecoration: "none", color: "var(--ink)" });
	}

	row(){
		return a.c("ai-obj-row flex gap-50", () => {
			icon(this.constructor.icon);
			strong(this.name());
			small.c("muted", this.fact());
		}).attr("href", this.href() ?? "#").style({ textDecoration: "none", color: "var(--ink)", alignItems: "center" });
	}

	panel(){
		return div.c("card flex v gap-35", () => {
			div.c("flex gap-50", () => { icon(this.constructor.icon).style({ fontSize: "2rem" }); small.c("muted", this.constructor.kind); });
			strong(this.name());
			for (const [k, v] of this.facts()) div(() => { small.c("muted", k + ": "); span(String(v)); });
			if (this.href()) a("Open").attr("href", this.href());
		});
	}
}

/* A skill: one .claude/skills/<name>/SKILL.md, read through skills.json. */
export class Skill extends AIObject {
	static icon = "school";
	static kind = "Skill";
	name(){ return this.title; }
	fact(){ return this.kind; }
	facts(){ return [["kind", this.kind], ["for", this.for], ["SKILL.md", this.lines + " lines"]]; }
	href(){ return "/framework/ai/skills/" + this.id + "/"; }
}

/* An ask: one line of ai/asks.jsonl. */
export class Ask extends AIObject {
	static icon = "record_voice_over";
	static kind = "Ask";
	fact(){ return this.status + " · " + this.owner; }
	facts(){ return [["status", this.status], ["owner", this.owner], ["asked", this.at?.slice(0, 16).replace("T", " ")]]; }
	href(){ return this.card ? "/framework/ai/" + this.card + "/" : null; }
}

/* A task: the first `assign` line of an ai/<date>/<slug>/task.jsonl. */
export class Task extends AIObject {
	static icon = "task_alt";
	static kind = "Task";
	name(){ return this.slug; }
	fact(){ return `step ${this.step ?? "?"} of ${this.steps?.length ?? "?"}`; }
	facts(){ return [["now", this.now], ["step", this.fact()], ["model", this.model]]; }
	href(){ return "/framework/ai/" + this.date + "/" + this.slug + "/"; }
}

export default { AIObject, Skill, Ask, Task };
