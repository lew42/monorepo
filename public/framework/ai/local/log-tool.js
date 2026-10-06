/* log-tool.js — Universal Unopinionated Logging Tool for Local & Constrained Models.
 *
 * Provides a minimal (~120 token) tool schema that fits easily into small context windows
 * (e.g. Qwen3-8B's 32k/36k window), avoiding the ~75,000 token blowout of full MCP catalogs.
 *
 * Accepts arbitrary JSON payloads from the model and automatically enriches them with:
 *   - `ts`: ISO-8601 timestamp
 *   - `delta_ms`: elapsed duration since the previous write in this stream
 *   - `by`: authenticated caller/author identifier
 *   - `seq`: monotonic sequence counter
 */
import fs from "node:fs";
import path from "node:path";

export const UNIVERSAL_LOG_TOOL = {
	name: "log",
	description: "Record a structured finding, note, parameter update, metric, or state to the persistent file system.",
	input_schema: {
		type: "object",
		properties: {
			kind: {
				type: "string",
				enum: ["param", "insight", "note", "step", "metric", "state"],
				description: "The category of log entry."
			},
			data: {
				type: "object",
				description: "Arbitrary structured JSON data or key-value updates to persist."
			},
			target: {
				type: "string",
				description: "Optional destination log path or page identifier (defaults to active log)."
			}
		},
		required: ["kind", "data"]
	}
};

export const OPENAI_LOG_TOOL = {
	type: "function",
	function: {
		name: UNIVERSAL_LOG_TOOL.name,
		description: UNIVERSAL_LOG_TOOL.description,
		parameters: UNIVERSAL_LOG_TOOL.input_schema
	}
};

export class UniversalLogger {
	constructor({ default_path = "log.jsonl", caller = "local/qwen3-8b" } = {}){
		this.default_path = default_path;
		this.caller = caller;
		this.last_ts = 0;
		this.seq = 0;
	}

	/* Appends an unopinionated JSON line to the target .jsonl file with automated metadata. */
	append({ kind = "note", data = {}, target = null } = {}){
		if (!data || typeof data !== "object"){
			return { ok: false, why: "data must be a valid JSON object" };
		}
		const now = Date.now();
		const delta_ms = this.last_ts > 0 ? now - this.last_ts : 0;
		this.last_ts = now;
		this.seq += 1;

		const entry = {
			seq: this.seq,
			ts: new Date(now).toISOString(),
			delta_ms,
			by: this.caller,
			kind: String(kind || "note"),
			data
		};

		const filePath = path.resolve(target || this.default_path);
		try {
			const dir = path.dirname(filePath);
			if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
			fs.appendFileSync(filePath, JSON.stringify(entry) + "\n", "utf8");
			return { ok: true, line: entry, delta_ms, seq: this.seq };
		} catch (err){
			return { ok: false, why: `Failed to write log line: ${err.message}` };
		}
	}
}

export default UniversalLogger;
