#!/usr/bin/env node
/* Ask-each — ask a model one question at a time, in one continuous session,
 * instead of dumping the whole list into a single prompt.
 *
 * The owner's idea (public/framework/ai/2026-09-28/harness-research/owner-words.md,
 * "Added 2026-09-28 about 11:15 PM"): a prompt with 12 questions in it gets
 * processed once, in one pass — the model's attention is split across all of
 * them and the answers come out shallow. Ask them one at a time in the SAME
 * session (so it still remembers the context and its own earlier answers) and
 * each answer gets the model's full attention.
 *
 * Usage:
 *   node Server/ask-each.mjs <questions.md> [--context <file>] [--model claude-sonnet-5] [--out answers.md]
 *
 * <questions.md> is a plain list: one question per non-empty line (a leading
 * "- ", "* " or "1. " is stripped, so a normal Markdown list just works).
 * --context <file> is sent as the FIRST turn, once, before any question — the
 * background the model needs to answer the rest well (e.g. "you are choosing
 * a page layout; here is the page's content and constraints").
 *
 * This is plain Node calling the Claude Agent SDK's query() the same way
 * Servex/agents/Agents.js does (see its `options()` and `receive()`), kept
 * deliberately dumb: read questions, loop, call the model, write the file.
 * A future OpenRouter harness swaps out only `askOnce()` below — the loop,
 * the file parsing and the output format do not change. See
 * Server/doc/ask-each.md for what "one at a time" actually bought, measured
 * against asking all the questions in a single prompt. */

import { readFile, writeFile } from "node:fs/promises";
import { query } from "../Servex/node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs";

function parseArgs(argv){
	const args = { questions: null, context: null, model: "claude-sonnet-5", out: "answers.md" };
	const rest = [];
	for (let i = 0; i < argv.length; i++){
		const a = argv[i];
		if (a === "--context") args.context = argv[++i];
		else if (a === "--model") args.model = argv[++i];
		else if (a === "--out") args.out = argv[++i];
		else rest.push(a);
	}
	args.questions = rest[0];
	return args;
}

/* One non-empty line = one question. Strips a leading "- ", "* " or "1. " so
 * a normal Markdown list, or a plain line-per-question file, both just work. */
function parseQuestions(text){
	return text.split("\n")
		.map(line => line.trim())
		.filter(Boolean)
		.filter(line => !line.startsWith("#")) // headings are structure, not questions
		.map(line => line.replace(/^(-|\*|\d+\.)\s+/, ""));
}

/* Send one turn in a session (a fresh session on the first call, the SAME
 * session on every later call via `resume`), wait for its result, and return
 * the model's answer text plus what it cost. This is the one function a
 * different provider's harness would replace. */
async function askOnce(text, { model, cwd, sessionId }){
	const q = query({
		prompt: text,
		options: {
			model,
			cwd,
			permissionMode: "bypassPermissions",
			allowedTools: [], // Q&A only — this tool never touches the repo
			...(sessionId ? { resume: sessionId } : {})
		}
	});

	let newSessionId = sessionId;
	let answer = "";
	let result = null;
	for await (const message of q){
		if (message.type === "system" && message.subtype === "init") newSessionId = message.session_id;
		if (message.type === "assistant")
			for (const block of message.message?.content ?? [])
				if (block.type === "text" && block.text.trim()) answer += (answer ? "\n\n" : "") + block.text;
		if (message.type === "result") result = message;
	}
	q.close?.();

	return {
		sessionId: newSessionId,
		answer: result?.result ?? answer,
		cost_usd: result?.total_cost_usd ?? 0,
		duration_ms: result?.duration_ms ?? 0
	};
}

async function main(){
	const args = parseArgs(process.argv.slice(2));
	if (!args.questions){
		console.error("usage: node Server/ask-each.mjs <questions.md> [--context <file>] [--model claude-sonnet-5] [--out answers.md]");
		process.exit(1);
	}

	const questions = parseQuestions(await readFile(args.questions, "utf8"));
	if (!questions.length){
		console.error(`no questions found in ${args.questions}`);
		process.exit(1);
	}

	const cwd = process.cwd();
	let sessionId = null;
	let totalCost = 0;
	const lines = [];

	if (args.context){
		const context = await readFile(args.context, "utf8");
		console.log("sending context…");
		const first = await askOnce(context, { model: args.model, cwd });
		sessionId = first.sessionId;
		totalCost += first.cost_usd;
	}

	for (const [i, question] of questions.entries()){
		console.log(`asking ${i + 1}/${questions.length}: ${question}`);
		const turn = await askOnce(question, { model: args.model, cwd, sessionId });
		sessionId = turn.sessionId;
		totalCost += turn.cost_usd;
		lines.push(`## ${i + 1}. ${question}\n\n${turn.answer}\n`);
	}

	const header = `<!-- ask-each: ${questions.length} questions, one at a time, one session (${sessionId}). Total cost: $${totalCost.toFixed(4)} -->\n\n`;
	await writeFile(args.out, header + lines.join("\n"), "utf8");
	console.log(`wrote ${args.out} — total cost $${totalCost.toFixed(4)}`);
}

main().catch(e => { console.error(e); process.exit(1); });
