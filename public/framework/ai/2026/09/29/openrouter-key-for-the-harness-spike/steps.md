## What I need from you: one OpenRouter key (about 5 minutes)

- [ ] 1. Sign in at [openrouter.ai](https://openrouter.ai) (Google sign-in works)
- [ ] 2. **Credits:** add about **$10** ([openrouter.ai/settings/credits](https://openrouter.ai/settings/credits))
- [ ] 3. **Keys:** create a key named `servex-spike` ([openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)). A credit limit of $10 on the key is a good idea
- [ ] 4. Save the key as the only line of this file:

```
%LOCALAPPDATA%\lew42\servex\openrouter.key
```

That's `C:\Users\mike\AppData\Local\lew42\servex\openrouter.key`. The folder already exists. It sits outside the repo, so the key never gets committed.

**Then nothing else.** The VS Code tab is watching for that file. The moment it appears, the spike starts: GPT, Gemini and Grok each run a small real task through our tools, on the Claude SDK and on opencode, with the true cost logged. It costs about $3–5.
