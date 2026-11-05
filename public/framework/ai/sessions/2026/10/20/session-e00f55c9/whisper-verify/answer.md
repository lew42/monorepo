# The phone's live transcript is made by Whisper, including through the 17:37 restart

Times are local (UTC-6). Read-only: nothing was changed.

| You asked | Answer | Proof |
|---|---|---|
| Whisper or Chrome's speech API? | **Whisper** | All 69 voice lines of session `v-u48msei` match a Whisper reply in `ai/whisper/bucket.jsonl` (69 of 69). Each reply carries whisper.cpp fields (`task:"transcribe"`, `t_dtw`, `avg_logprob`), which Chrome's engine never produces. |
| Which engine during the 17:37 restart? | **Whisper** | The dev server (hosts `/whisper`) and `whisper-server.exe` (pid 21324) never stopped. Only the socket to Servex dropped (23:37:32Z to 23:38:04Z), and Whisper replies 473-475 arrived inside that gap. |
| Does the `ux-dictate-engine` label show it? | **No** | `name_engine()` (`ux/Dictate/Dictate.js:227-229`) prints nothing for Whisper and text only for the browser engine. A blank label means Whisper. "Whisper: connected" shows in `ux-dictate-diag` (`Dictate.js:199-203`). |
| Ever used Whisper on the phone? | **Yes today; "ever" is unproven** | 356 Whisper finals since 17:05 today, from Host `10.0.0.135:3104`, the address the gateway (`SiteGateway.mjs:48-93`) sends for `monorepo.lew42.com`. The log has no device field, so a direct visit on this PC would look the same: likely the phone, not proven. |

## How audio reaches Whisper from the phone

```
phone → monorepo.lew42.com → gateway → dev server :3104 /whisper → whisper-server
```

- `default_whisper_url()` (`Dictate.js:799-803`) uses `<origin>/whisper` on any non-localhost host.
- The proxy is `Server/plugins/Whisper.js:94-120`.
- Chrome's engine runs only if Whisper was never seen in that browser and its health check fails (`Dictate.js:211-224`).

## Not done

I did not load the public URL headless. The logs settle the question.
