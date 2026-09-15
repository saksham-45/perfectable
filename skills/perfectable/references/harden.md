# Harden

Production paths: errors, recovery, permissions, i18n, accessibility. Not a visual redesign.

## Cover

- **Document model:** untitled name, dirty indicator in title and dock/taskbar, close-with-dirty prompt, save failure that keeps the buffer, crash restore.
- **Permissions:** file, camera, mic, network — ask at the moment of use, explain why, survive denial.
- **Network / tool jobs:** LSP down, install failed, command failed — status + retry + preserve work.
- **i18n:** strings in a catalog; layout survives +30% text; no concatenated sentences; OS locale for dates/numbers.
- **A11y:** names, roles, focus order, contrast, Reduce Motion, text scaling. Keyboard-only primary path.
- **First run:** skippable; lands in the editor; empty state teaches Open / New.

## Method

1. List the real failure modes of this app (from APP.md + code), not a generic checklist.
2. For each, say what the user sees, what is preserved, and how they continue.
3. Implement the missing paths. Prefer inline recovery over modal stacks.
4. Run `detect.mjs` on touched files. Walk the failure paths once.

Do not invent legal/compliance claims. Do not add onboarding theater.
