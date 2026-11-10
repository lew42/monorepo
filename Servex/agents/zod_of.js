// JSON Schema → zod, for the property kinds the tools use (tools.js server(): the in-process MCP, `mcp__local__*` included).
import { z } from "zod";

// A list of types is a union of exactly those (`task`: an object, or false; the item tool's `args`: anything a method
// takes). No type at all accepts any value: before 2026-11-09 it became a string, so a client sent an object as JSON text.
const one_kind = (type, items) => type === "number" ? z.number() : type === "boolean" ? z.boolean()
	: type === "object" ? z.looseObject({})   // NOT z.record(): one record breaks the SDK server's whole tools/list
	: type === "array" ? z.array(items?.type === "string" ? z.string() : z.any())
	: type === "string" ? z.string() : z.any();
export const zod_of = ({ type, items, enum: one_of }) => one_of ? z.enum(one_of)
	: Array.isArray(type) ? z.union(type.map(t => one_kind(t, items))) : one_kind(type, items);
