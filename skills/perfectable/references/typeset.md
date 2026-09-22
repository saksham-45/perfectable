# Typeset

Separate chrome type from document type and apply [canon/type.md](canon/type.md). Sizes come from the platform file. Do not restate them here.

## Procedure

1. Mark every text run as chrome or document. A label, tab, tree row, toolbar, and status item are chrome. A message, article, or preview paragraph is document. Code is neither prose nor chrome.
2. Set the platform UI face on chrome. Set the measure on document prose. Leave code and tables on the pane width.
3. Check, in one pass: truncation, tabular figures on counts and gutters, tracking on chrome, the largest text size the app claims, and a string about 40 percent longer than the English source.
4. Fix in one batch. Confirm once. Stop.

Do not fluid-size chrome with `clamp()` or `vw`. Do not introduce a display face into labels.

Hand `layout` back if the column is the right width and the window around it is still one padding everywhere. Hand `materials` the color of type if contrast is the remaining defect.
