import { KINDS, STATES, write, outline, summary } from "../../public/framework/ext/Research/store.mjs";

const S = (description, extra = {}) => ({ type: "string", description, ...extra });
const SLUG = S("The topic — its dir under public/framework/research/.");
const BY = S("Who is speaking: your minion name. Default `anon`.");
const NODE = S("The node id, from `research_outline`.");

/* Every arg is schema'd so an agent cannot invent a verb or a field: the schema
 * refuses the shape, then verbs.js refuses the value. */
const TOOLS = [{
    name: "research_say",
    description: "Add one node to a research topic's argument tree — a claim, the evidence for it, a dissent against it. Reply to something by giving its id as `parent`. ⚠ `text` is one thought in ≤ 240 chars, refused if longer: the point of this system is that nobody writes a wall of text. Put the reasoning in `why` (≤ 1000) and the sources in `refs`.",
    inputSchema: { type: "object", required: ["slug", "kind", "text", "by"], properties: {
        slug: SLUG, by: BY,
        kind: S("What this is.", { enum: KINDS }),
        text: S("The point itself, ≤ 240 chars. One thought."),
        parent: S("The node id this answers. `support` and `dissent` require one."),
        why: S("Your reasoning, ≤ 1000 chars. Required for `support` and `dissent`."),
        refs: { type: "array", items: { type: "string" }, description: "Where it comes from: \"Server/plugins/MCP.js:88\" or a url." },
        icon: S("A Material Symbols name — `bolt`, `warning`, `stream`."),
        img: S("A url to a picture that shows it."),
        importance: { type: "integer", minimum: 1, maximum: 5, description: "Your own guess at how much this matters, 1–5." }
    } }
}, {
    name: "research_vote",
    description: "Weigh in on how much an existing node matters, 1–5, without touching it. A node's score is the mean of its author's guess and every vote.",
    inputSchema: { type: "object", required: ["slug", "node", "by", "importance"], properties: {
        slug: SLUG, node: NODE, by: BY,
        importance: { type: "integer", minimum: 1, maximum: 5 }
    } }
}, {
    name: "research_verdict",
    description: "Rule on a node — orchestrator only. The latest verdict on a node wins.",
    inputSchema: { type: "object", required: ["slug", "node", "by", "state", "why"], properties: {
        slug: SLUG, node: NODE, by: BY,
        state: S("The ruling.", { enum: STATES }),
        why: S("Why, ≤ 1000 chars."),
        into: S("When `merged`: the node it merged into.")
    } }
}, {
    name: "research_agent",
    description: "Report a minion on the topic's running strip. Call it again with the same `name` and just a `done` line when it lands — lines merge by name, so nothing needs repeating.",
    inputSchema: { type: "object", required: ["slug", "name"], properties: {
        slug: SLUG,
        name: S("The minion's name — the key these lines merge on."),
        doing: S("What it is doing right now, one line. Give this or `done`."),
        persona: S("The seat it is filling, e.g. `skeptic`."),
        model: S("Which model is running it."),
        done: S("Its outcome, one line. Send this when it lands.")
    } }
}, {
    name: "research_log",
    description: "Narrate: a round starting, a direction from the owner (start the message with `owner:`).",
    inputSchema: { type: "object", required: ["slug", "msg"], properties: { slug: SLUG, msg: S("One line.") } }
}, {
    name: "research_outline",
    description: "The topic's tree as indented text — `id · kind · score · verdict · by · text`. Read THIS instead of the file: it is a screen, not a transcript, and the ids are what you reply to. Narrow it with `under`, `depth` and `min` rather than reading everything each round.",
    inputSchema: { type: "object", required: ["slug"], properties: {
        slug: SLUG,
        under: S("Only the subtree beneath this node id."),
        depth: { type: "integer", description: "How many levels down, default 9." },
        min: { type: "number", description: "Hide anything scoring below this (the path to a keeper stays)." }
    } }
}, {
    name: "research_summary",
    description: "The report: header, the orchestrator's summary block, the top-scoring roots, and who is running.",
    inputSchema: { type: "object", required: ["slug"], properties: {
        slug: SLUG,
        top: { type: "integer", description: "How many roots, default 7." }
    } }
}];

/* The research log's writers, as MCP tools, so a minion's turn is a tool call
 * with a schema instead of a hand-written JSON line. Same store.mjs the CLI
 * calls — whatever `research.mjs` refuses, an agent cannot write either.
 * Appended lines reach the open page over the socket (`Tail`), no reload.
 * See public/framework/ext/Research/doc/writers.md. */
export default class Research {

    static setup(server){ new Research(server); }

    constructor(server){
        this.server = server;
        server.research = this;
        TOOLS.forEach(tool => server.mcp.register(tool, args => this.call(tool.name, args)));
    }

    call(name, { slug, ...args }){
        const verb = name.replace("research_", "");
        if (verb === "outline") return outline(slug, args);
        if (verb === "summary") return summary(slug, args);

        const written = write(slug, verb === "say" ? "node" : verb, args);
        return `${verb} ok${written.id ? ` — id ${written.id}, reply to it with parent: "${written.id}"` : ""}`;
    }
}
