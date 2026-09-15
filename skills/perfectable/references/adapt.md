# Adapt

Make chrome work across window sizes, appearances, and density — not a restyle.

Load the platform file first. Native windowing beats CSS breakpoints.

## Check

- **Widths:** compact (~800px), regular (~1200px), wide (~1600px+). Sidebars collapse; the editor keeps measure; no horizontal clip of tabs/title.
- **Heights:** short laptop screens; status + tabs + titlebar must leave an editor.
- **HiDPI:** hairlines stay 1px device, icons snap to the grid, no blurry custom window controls.
- **Appearances:** light, dark, system follow. High contrast if the OS has it.
- **Compact chrome:** a density toggle or a width at which labels drop and tooltips + shortcuts remain.
- **Multi-window / multi-monitor:** extra document or panel windows remember screen and size.
- **Keyboard overlay:** OS keyboard viewer / on-screen keyboard must not cover the focused field without scrolling.

## Method

1. Identify which of the above the target actually claims to support.
2. Inspect at those sizes and appearances together in one pass.
3. Fix structural issues (flex/grid, split mins, titlebar drag region, safe-area/insets) before visual tweaks.
4. Re-inspect once. Stop.

Do not introduce a mobile layout. This skill does not ship phone UIs.
