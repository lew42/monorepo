---
url: "https://openrouter.ai/docs/faq"
title: "OpenRouter FAQ"
kind: docs
authority: high
fetched_at: 2026-09-28T19:22:04.437Z
---

# OpenRouter FAQ: API Usage, Plugins, and Pricing

## API Usage

OpenRouter supports multiple authentication methods including API keys (passed as Bearer tokens) and implements the OpenAI API specification for /completions and /chat/completions endpoints. The platform accepts text, images, and PDFs, with streaming available via server-sent events.

Rate limiting depends on account type. Free model users without credits face 50 requests per day total, while those with $10+ in credits receive 1000 requests per day. Paid accounts have different limits detailed in the rate limits documentation.

## Plugins/Integrations

OpenRouter functions as a drop-in replacement for OpenAI, meaning any OpenAI-compatible SDK works automatically. The platform supports numerous frameworks and integrations across different programming languages.

## Pricing

OpenRouter charges 5.5% ($0.80 minimum) for Stripe credit purchases and 5% for cryptocurrency. Importantly, you pay the same rate as you would directly with the provider since there's no markup on inference pricing.

For users providing their own API keys (BYOK), the pay-as-you-go plan includes $25,000 per month with no BYOK fee, with a 5% fee on usage exceeding that threshold. Enterprise plans offer $200,000 monthly allowance before fees apply.
