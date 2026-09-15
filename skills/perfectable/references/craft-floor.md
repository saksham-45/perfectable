# Craft floor

Load after direction is settled, immediately before editing UI. A pinned APP.md / CHROME.md overrides anything here. Detector findings are acted on; do not re-audit a rule the scanner already named.

## Verify

Run these together on the built result in one inspection round.

- **Contrast:** chrome text, editor text, placeholders, selection, and find-highlights ≥4.5:1. Secondary text is tinted from the surface, never raw gray on color.
- **Density:** tree rows, tabs, and menu items 22–28px tall with extra hit padding, not 44px touch rows. Tight groups, generous separation between regions.
- **Type:** one family for chrome. Fixed sizes, not fluid clamp. Mono only in editor, terminal, and diffs. Tabular nums in gutters and status.
- **States:** every control has default, hover, focus, active, disabled, loading, error. Empty states teach the next action.
- **Keyboard:** every primary action has a shortcut; focus never vanishes; Esc backs out of palette, menu, and modal.
- **Window:** titlebar shows filename and dirty state; menus match the OS; system file dialogs; appearance follows the OS.
- **Motion:** 150–250ms, state only, interruptible. No load choreography.
- **Copy:** controls name the action (“Save”, not “Submit”). Errors name the problem and the recovery.

## Refuse

The brief can earn any of these. Reaching for one when the axis is free means you were not deciding — rewrite the element.

- VS Code skin (48px activity bar, icon-only, Inter/Geist, violet accent) when the product is not VS Code.
- Web primary buttons, pills, and marketing CTAs inside tool chrome.
- Gradient text, glow shadows, pulsing status dots, fake typing carets.
- Nested cards in settings.
- Modal as the first answer for preferences, pickers, or confirmations.
- Icon-only nav with neither tooltip nor shortcut nor accessible name.
- Custom window controls that ignore traffic-light / caption geometry.
- Display fonts in labels, tabs, trees, status.
- Hover-only affordances on desktop chrome.
- Invented Open / Save / Preferences / Quit that bypass the OS.

The floor holds mechanics. It never picks the visual world. When torn between refined and committed, commit.
