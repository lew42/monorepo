# MicStream.js — notes and design decisions

## Class consolidation

This used to be three classes (2026-09-30, the owner: "which of these could be merged?"):
- MicPicker - device choice
- LevelMeter - level visualization  
- PushToTalk - hold/toggle-to-talk

They were merged because all three are really just "a setting on, or a way of starting/stopping, one microphone", not things worth their own class. Recorder and Transcriber.Whisper still subscribe to the level and the stream, same as always.

## Constructor field initialization

Field declarations (`device_id = null`, `mode = null`, etc.) initialize AFTER `super()` returns (real JS class-field order, not a framework quirk), so Part's own `this.assign(...args)` — called from inside `super()` — runs too EARLY and gets silently overwritten by MicStream's own field defaults the moment `super()` returns. `new MicStream({ mode: "toggle" })` was landing with `mode: null` until the reassignment line in the constructor was added (found while proving the task's own demo, 2026-09-30). Every Part subclass with a field of the same name as an option it accepts has this same trap.

## Device label retrieval

Labels read as empty strings until mic permission has been granted somewhere on this page (a browser rule, not a bug here); a caller showing the list before then should fall back to "Microphone 1", "Microphone 2", etc. (see MicStream.Controls below).

## Buffer extraction and copying

The buffer (`chunks`/`snapshot()`/`cut()`) is extracted straight from `ux/Dictate/capture.js`, which this file does not import (it is read-only for this task) but copies, because the shape is exactly what `worth_sending()` / whisper needs: every sample since `start()` or the last `cut()`, and the "how many ms of this are actually loud" measure that tells a segment from silence (`loudness()`).

## Sample rate

The rate the browser actually gave us — see `capture.js`'s own note: a browser is allowed to refuse the requested rate.

## Loudness calculation

How loud a stretch of samples is, and — the number a silence rule actually needs — how many MILLISECONDS of it are loud, in 20ms frames above `floor`. Whole-segment RMS cannot separate "one loud click in a silent room" from real speech; this can (measured 2026-09-22).

## View implementation

The three-size state view every audio/ class carries: icon (a mic glyph + connected/clipping flags), row (+ the device label and the live level), panel (+ every own property — sample rate, the settings the browser actually gave us, how many chunks are buffered — from `PartView`'s generic fallback).

## Controls rendering

The interactive picker + level bar + hold/toggle button, all pointed at one MicStream. This is the one place the three old classes' UI lives now: MicPicker's `<select>`, LevelMeter's bar, PushToTalk's button — each still just a few lines, but drawing straight off the MicStream they used to watch from outside, so there is exactly one implementation of "open a mic".

## MicStream.Controls field initialization  

No `show_picker = true` field on purpose: View's own constructor calls `render()` from INSIDE `super()`, before a subclass's own field initializers have run (real JS order — a derived class's fields initialize the instant `super()` RETURNS, and `render()` runs earlier than that, as part of `super()` itself). A `show_picker = true` field would read as `undefined` here every time, never `true` — so "on by default" is written as "not explicitly turned off" instead. An explicit `{ show_picker: false }` constructor option IS visible by the time `render()` runs, so this still does exactly what the doc comment promises.
