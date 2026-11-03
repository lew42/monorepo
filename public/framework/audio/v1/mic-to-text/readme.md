# Mic → Whisper → text

`MicStream` opens the mic and keeps the sample buffer `Transcriber.Whisper` needs;
`Transcriber.Whisper` resends the growing segment every ~900ms (the grey partial) and, once a
700ms pause closes it, posts the final answer to whisper-server through the page-origin
`/whisper/inference` proxy (`Server/plugins/Whisper.js`).

## More

- [Overview](/framework/audio/mic-to-text/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library · [Transcriber](/framework/audio/Transcriber/)
