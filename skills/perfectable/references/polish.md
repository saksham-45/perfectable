# Polish

Refinement, never concealed redesign. Preserve incumbent chrome, content, behavior, and everything outside scope. If the workspace thesis is wrong, say so and recommend `shape` instead of smuggling a replacement.

A detector result is defect evidence, not proof of quality. Use the feature.

## 1. Establish the system

Read APP.md, CHROME.md, and neighboring chrome (titlebar, sidebar, tabs, status, palette). If no formal system exists, use coherent project conventions.

Classify drift before fixing: missing token · one-off that should be a shared component · conceptual IA mismatch · local defect. Fix at the narrowest correct level.

## 2. Evidence

Use the app at representative window sizes and both appearances. Determine: path complete? quality bar? unfinished on purpose? states users will hit?

If a prior critique exists:

```bash
node <skill-base-dir>/scripts/critique-storage.mjs latest "<resolved target>"
```

Exit 0: incorporate P0/P1 and name the snapshot. Exit 2: none. Independent pass either way.

Run the detector unless `context.mjs` said a hook already covers it (`DETECTOR_HOOK=on`). Then only act on hook findings plus visual judgment.

## 3. Triage order

1. Blocked tasks, data loss, misleading state, inaccessible paths
2. Missing loading / empty / error / success / disabled / permission states
3. Keyboard, platform chrome, layout persistence
4. Density, type, motion consistency
5. Dead code and duplicate chrome

Do not perfect one corner while the rest sits below the same bar.

## 4. Polish the path

- Match neighboring terminology, save behavior, and disclosure.
- Primary task and current state obvious; editor still the product.
- Density from the platform file, with hit padding. Rhythm and spread from [canon/layout-geometry.md](canon/layout-geometry.md): two spacing roles, air in the sovereign surface, optical alignment on a screenshot. A wrong composition goes back to `shape`, not into a quiet restyle.
- Semantic tokens; contrast in every state and appearance.
- One icon family. Visible focus. Interruptible motion, state only.
- Long, missing, localized, offline, and permission-limited content where the product can encounter it.

## 5. Verify and stop

Walk Open → edit → dirty → save → close → crash-restore (or say you could not). Command palette. Menu bar. Light + dark. Keyboard-only primary task. Resize and undock if the app has panels.

Fix real defects. Document only narrow intentional exceptions. Finish with a source diff: no accidental churn. Ship when the path is functionally complete and consistently finished.
