// Shim (2026-10-12): the Part base class is gone. A part is an ordinary Item with a View
// (PageHeading, PageText, PageCard); this keeps an old `import Part from "./Part.js"` loading.
export { default } from "../../Item/Item.js";
