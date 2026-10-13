# Fix: default Gemini model is retired

Google's API now rejects the configured default model: `models/gemini-2.5-flash` is "no longer available to new users." Google's own error message names the replacement: `models/gemini-3.8-flash`.

## Change
In `lib/grader/gemini.ts`, change the default model id from `gemini-2.5-flash` to `gemini-3.8-flash`. Keep the `TOWER_GEMINI_MODEL` env override working exactly as before — only the default changes.

Update any references to the old default in `README.md` and `.env.example`.

Do not change the REST `generateContent` call shape, the two-call pipeline, the honesty rules, or anything visual. The report footnote already reads the model id from config, so it will update itself.

## Acceptance
- `npm run build` passes clean.
- Report the one-line change and confirm nothing else moved.
