import fs from "node:fs";
import path from "node:path";
import { read_key } from "../../../../../Servex/ext/openrouter/provider.js";
import { is_local_model } from "../../../../../Servex/ext/local/provider.js";
import { level_a, level_b, level_c } from "./eval-suite.mjs";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callModel({ model, messages, temperature = 0.1, max_tokens = 4000 }) {
	const t0 = Date.now();
	if (is_local_model(model)) {
		try {
			const res = await fetch("http://127.0.0.1:8998/v1/chat/completions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ model: model.replace(/^local\//, ""), messages, temperature, max_tokens })
			});
			if (!res.ok) {
				return { ok: false, error: `Local HTTP ${res.status}: ${await res.text()}`, ms: Date.now() - t0 };
			}
			const data = await res.json();
			const text = data.choices?.[0]?.message?.content ?? "";
			return { ok: true, text, cost_usd: 0, ms: Date.now() - t0, usage: data.usage };
		} catch (e) {
			return { ok: false, error: `Local call failed: ${e.message}`, ms: Date.now() - t0 };
		}
	}

	const key = read_key();
	try {
		const res = await fetch(OPENROUTER_API_URL, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${key}`,
				"Content-Type": "application/json",
				"HTTP-Referer": "https://lew42.com",
				"X-Title": "Lew42 New Brain Evaluation"
			},
			body: JSON.stringify({
				model,
				messages,
				temperature,
				max_tokens,
				usage: { include: true },          // OpenRouter returns the real charge in usage.cost
				reasoning: { effort: "low" }       // reasoning models spent the whole budget thinking and answered ""
			})
		});
		if (!res.ok) {
			const errText = await res.text();
			return { ok: false, error: `OpenRouter HTTP ${res.status}: ${errText}`, ms: Date.now() - t0 };
		}
		const data = await res.json();
		const text = data.choices?.[0]?.message?.content ?? "";

		// Calculate pricing from OpenRouter usage & model rates
		let cost_usd = 0;
		if (typeof data.usage?.cost === "number") cost_usd = data.usage.cost;   // the real charge
		else if (data.usage) {
			// Cost if available in response native header or calculated from tokens
			const p = data.usage.prompt_tokens || 0;
			const c = data.usage.completion_tokens || 0;
			// Rough estimate per model family:
			if (model.includes(":free")) cost_usd = 0;
			else if (model.includes("deepseek-v4.1-flash")) cost_usd = (p * 0.03 + c * 0.14) / 1000000;
			else if (model.includes("gpt-6-luna")) cost_usd = (p * 0.10 + c * 0.40) / 1000000;
			else if (model.includes("gemini-3.8-flash")) cost_usd = (p * 0.75 + c * 3.00) / 1000000;
			else if (model.includes("gemini-3.5-flash-lite")) cost_usd = (p * 0.30 + c * 1.20) / 1000000;
			else if (model.includes("claude-haiku")) cost_usd = (p * 1.00 + c * 5.00) / 1000000;
		}

		return {
			ok: true,
			text,
			cost_usd,
			ms: Date.now() - t0,
			usage: data.usage
		};
	} catch (e) {
		return { ok: false, error: `OpenRouter call failed: ${e.message}`, ms: Date.now() - t0 };
	}
}

// Prompt refinement evaluator
export function evaluateRefinement(raw, refined) {
	if (!refined || typeof refined !== "string") return { pass: false, score: 0, reason: "empty output" };

	// Split refined into numbered sentences / items
	const lines = refined.split("\n").map(l => l.trim()).filter(Boolean);
	const numbered = lines.filter(l => /^(\d+[\.\)]|[-*])\s+/.test(l));
	const hasStructure = numbered.length >= 1;

	// Deterministic coverage check: key words from raw (excluding common stopwords)
	const stopWords = new Set(["the", "and", "that", "this", "with", "from", "have", "what", "where", "when", "which", "about", "like", "just", "kind", "some", "they", "there", "their", "your", "were", "been", "would", "could", "should", "know", "then", "into", "also", "very", "more", "much", "well", "will", "than"]);
	const rawWords = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
	const refinedLower = refined.toLowerCase();

	let matched = 0;
	const uniqueWords = [...new Set(rawWords)];
	for (const w of uniqueWords) {
		if (refinedLower.includes(w)) matched++;
	}
	const coverageRatio = uniqueWords.length ? matched / uniqueWords.length : 1;

	// Pass if structure exists and coverage is >= 75%
	const pass = hasStructure && coverageRatio >= 0.70;
	return {
		pass,
		score: Math.round(coverageRatio * 100),
		hasStructure,
		coverageRatio
	};
}
