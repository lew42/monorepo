# Layout Analysis: broken-overflow Test Page

## The Issue

The page displays a "Status panel" with text that deliberately overflows on narrow viewports.

**Root cause:** A `div` element at `page.js:17-18` has an inline style `width: 900px`, which is wider than the narrow viewport (400px or less). This forces horizontal scrolling instead of text wrapping.

## Visual Evidence

- **At 1400px width:** Content displays normally, text wraps, no horizontal overflow
- **At 400px width:** Text overflows the right edge, requires horizontal scroll

The content itself describes the problem: *"This status line is pinned to a fixed width wider than the page, so narrow screens see it run off the right edge instead of wrapping."*

## The Code

```js
div("This status line is pinned to a fixed width wider than the page, so narrow screens see it run off the right edge instead of wrapping.")
    .style("width", "900px");  // ← The problematic fixed width
```

## How to Fix

Replace the fixed width with one of these approaches:

1. **Remove the width entirely:** Let the content reflow naturally
2. **Use `max-width` instead:** `.style("max-width", "900px")` allows the div to shrink on narrow screens while capping at 900px on wide screens

The second approach is best: it preserves the intended desktop width while fixing overflow on mobile.

## Test Library Context

This is a deliberate test case for the OpenRouter model evaluation library. The `page.js` comment notes: *"Never fix this file directly: library.mjs copies it into a fresh run dir per test run."* This is intentional broken code for testing whether models can identify and diagnose overflow issues.
