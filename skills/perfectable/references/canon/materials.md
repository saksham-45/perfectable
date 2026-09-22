# Materials

Owns color strategy, token names, elevation, and which layer a surface belongs to. The platform file names the material (Liquid Glass, mica, acrylic, toolkit theme) and the contrast behavior for that desktop.

Motion timing for ordinary state changes lives in the craft floor. Gesture physics, springs, and reduced-motion equivalents live in the apple-design skill. Do not restyle desktop chrome as a marketing animation.

## Strategy

Default to Restrained: neutral surfaces and one accent. The accent marks the current selection, the primary action, and real state. It is not a wash behind the sidebar and not a gradient in the title.

A canvas tool or a media tool may pin a dark sovereign surface in APP.md because the work is color-critical. Everything outside that sentence follows the OS: light, dark, and high contrast.

## Tokens

Name these and map them. Do not invent a second vocabulary in a component.

`surface`, `chrome`, `editor` (or `canvas`), `selection`, `find`, `error`, `warning`, `success`, `focus`.

Secondary text is mixed from the foreground and the surface it sits on. A raw gray placed on a colored or translucent ground fails.

Text contrast and non-text contrast (boundaries, focus) use the thresholds in the craft floor.

## Layers

Three layers, and a surface is only one of them:

| Layer | Holds | Material |
|---|---|---|
| Content | Editor, table, document, canvas, scrolling list | Solid. No blur, no glass, no decorative shadow. |
| Functional | Toolbar, sidebar, tab bar, header bar | The platform's chrome material, from the platform file. |
| Transient | Menu, popover, flyout, modal scrim | The platform's transient material, then it leaves. |

Do not stack functional materials on top of each other. Do not put the content layer on the functional material. A detector hit for `glass-on-content` means blur landed on the content layer.

Honor reduced transparency, increased contrast, and reduced motion. When transparency is reduced, the functional layer becomes solid and keeps its edges.

## Radius and elevation

Radius follows the control, and the platform file says which controls are rounded rectangles and which are capsules. A large radius on a dense row is a costume (`marketing-radius-on-row`).

One elevation statement per surface. A separator, or a material, or a shadow. A border under a wide soft shadow is two statements; remove one.

High contrast uses the platform's system colors, not a dimmed version of the accent.
