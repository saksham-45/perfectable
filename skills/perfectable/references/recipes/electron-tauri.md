# Electron & Tauri Recipes

Prescriptive layout and styling recipes for AI-generated Electron and Tauri desktop interfaces.

## 1. Titlebar & Window Drag Regions

### ❌ Slop (Missing Drag or Swallowed Controls)
```html
<!-- DON'T: Entire titlebar is marked drag with no no-drag on buttons, so clicks miss -->
<header style="-webkit-app-region: drag; height: 32px; display: flex;">
    <span>My App</span>
    <button onclick="save()">Save</button>
</header>
```

### ✅ Clean (Separated Drag Canvas and Interactive Affordances)
```html
<!-- DO: Titlebar has explicit drag region, interactive buttons set no-drag -->
<header class="titlebar">
    <div class="titlebar-drag-region">
        <span class="window-title">Project - Document.txt</span>
    </div>
    <div class="titlebar-actions" style="-webkit-app-region: no-drag;">
        <button class="titlebar-btn" aria-label="Minimize" data-action="minimize">_</button>
        <button class="titlebar-btn" aria-label="Maximize" data-action="maximize">□</button>
        <button class="titlebar-btn close-btn" aria-label="Close" data-action="close">✕</button>
    </div>
</header>

<style>
.titlebar {
    display: flex;
    height: 32px;
    background: var(--color-chrome);
    border-bottom: 1px solid var(--color-chrome-border);
    user-select: none;
}
.titlebar-drag-region {
    flex: 1;
    display: flex;
    align-items: center;
    padding-left: 12px;
    -webkit-app-region: drag;
}
.titlebar-btn {
    -webkit-app-region: no-drag;
    height: 32px;
    width: 44px;
    border: none;
    background: transparent;
}
.titlebar-btn:hover { background: var(--color-chrome-hover); }
.close-btn:hover { background: #e81123; color: white; }
</style>
```

---

## 2. Window Minimum Dimensions

### ❌ Slop (Window Allowed to Collapse to 0x0)
```javascript
// DON'T: No minWidth/minHeight allows window to shrink into a broken box
const win = new BrowserWindow({
    width: 1200,
    height: 800
});
```

### ✅ Clean (Enforced Minimum Size Bounds)
```javascript
// DO: Lock minimum desktop bounds to prevent control collision and clipping
const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 12 },
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        sandbox: true
    }
});
```

---

## 3. Desktop Layout Units (Avoid 100vh)

### ❌ Slop (100vh on Desktop Shell)
```css
/* DON'T: 100vh does not account for window titlebars or taskbars, creating ghost scrollbars */
.app-shell {
    height: 100vh;
    width: 100vw;
    display: flex;
}
```

### ✅ Clean (CSS Grid 100% Height Root)
```css
/* DO: Root HTML/body uses height 100%, shell uses 100% grid tracks */
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.app-shell {
    display: grid;
    grid-template-rows: auto 1fr auto; /* Titlebar / Workspace / Status */
    height: 100%;
}

.workspace {
    display: grid;
    grid-template-columns: 260px 1fr; /* Fixed sidebar, sovereign workspace */
    min-height: 0; /* Critical for inner scrolling */
    overflow: hidden;
}
```

---

## 4. Native Dialogs vs Web Inputs

### ❌ Slop (Web Input File Picker in Desktop App)
```html
<!-- DON'T: Never use web file inputs in desktop software -->
<input type="file" id="filePicker" onchange="loadFile(event)"/>
```

### ✅ Clean (IPC to Native OS Dialog)
In renderer:
```javascript
// DO: Invoke native OS Open dialog via preload bridge
async function openFile() {
    const filePath = await window.electronAPI.showOpenDialog({
        title: 'Open Workspace Document',
        properties: ['openFile'],
        filters: [{ name: 'Source Files', extensions: ['ts', 'js', 'json', 'txt'] }]
    });
    if (filePath) loadDocument(filePath);
}
```

In main process:
```javascript
ipcMain.handle('dialog:open', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});
```
