---
url: "https://openrouter.ai/docs/guides/features/plugins/web-search"
title: "Web Search - Real-time Web Grounding for AI Models"
kind: docs
authority: high
fetched_at: 2026-09-28T19:21:21.718Z
---

# OpenRouter Web Search Feature Documentation

## Overview
OpenRouter enables web search capability for any model by appending `:online` to the model slug or activating the `web` plugin. This provides model-agnostic grounding with current information.

## Basic Usage
The simplest approach uses the `:online` suffix:
```json
{ "model": "openai/gpt-5.2:online" }
```

This functions identically to explicitly configuring the web plugin. Using web search will incur extra costs, even with free models.

## Search Providers
Different search engines power the feature depending on the model:
- **Native providers** (Anthropic, Google, OpenAI, Perplexity, SpaceXAI) use built-in search capabilities
- **Other models** rely on Exa's "auto" search method, combining keyword and embeddings-based approaches

Results include extracts typically spanning 2,000–4,000 characters per source, marked with Exa's `[...]` separators for multi-section content.

## Customization Options
Key configuration parameters include:
- `max_results`: Control result quantity (defaults to 5)
- `search_prompt`: Customize the prompt template
- `include_domains`/`exclude_domains`: Filter results by domain
- `engine`: Select search backend (native, exa, firecrawl, parallel, perplexity)
- `mode`: Adjust speed/depth tradeoffs

## Pricing Structure
- **Exa search**: $0.007 per request (auto mode) for up to 10 results
- **Parallel**: $0.001–$0.005 per request depending on mode
- **Perplexity**: $0.005 per request
- **Firecrawl**: Uses your own credits (2 per 10 results + 5 per scraped result)
- **Native search**: Provider passthrough pricing based on search context size

Additional results beyond 10 cost $0.001 each across most engines.

## Citation Format
Results standardize to OpenAI's Chat Completion annotation schema, including `url_citation` objects with URL, title, content, and character indices for linking citations within model responses.
