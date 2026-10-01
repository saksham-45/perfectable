# Qt Quick / QML Recipes

Prescriptive layout and styling recipes for AI-generated Qt Quick desktop interfaces.

## 1. Window Frame & Menu Bar

### ❌ Slop (No Alt Mnemonics, No Drag Handler on Frameless)
```qml
// DON'T: Frameless window cannot be dragged, menus lack Alt mnemonics
Window {
    flags: Qt.FramelessWindowHint
    MenuBar {
        Menu {
            title: "File"
            MenuItem { text: "Open" }
        }
    }
}
```

### ✅ Clean (System Frame or Native Move, Keyboard Mnemonics)
```qml
// DO: Native ApplicationWindow with Alt mnemonics (&) and standard shortcuts
ApplicationWindow {
    id: window
    width: 1024
    height: 768
    minimumWidth: 800
    minimumHeight: 600
    visible: true
    title: qsTr("Qt Workbench")

    menuBar: MenuBar {
        Menu {
            title: qsTr("&File")
            Action {
                text: qsTr("&Open...")
                shortcut: StandardKey.Open
                onTriggered: fileDialog.open()
            }
            Action {
                text: qsTr("&Save")
                shortcut: StandardKey.Save
                onTriggered: window.saveDocument()
            }
            MenuSeparator {}
            Action {
                text: qsTr("&Quit")
                shortcut: StandardKey.Quit
                onTriggered: Qt.quit()
            }
        }
    }
}
```

---

## 2. Desktop Controls vs Web Pill Buttons

### ❌ Slop (Mobile Pill Button in Desktop Toolbar)
```qml
// DON'T: 24px radius or height/2 creates web pill buttons in desktop toolbars
Button {
    text: "Execute"
    background: Rectangle {
        radius: 24
        color: "#7c3aed"
    }
}
```

### ✅ Clean (Subtle Platform Rounding)
```qml
// DO: Desktop controls use subtle 2–4px rounding matching system style
Button {
    text: qsTr("&Execute")
    background: Rectangle {
        radius: 4
        color: parent.down ? palette.mid : (parent.hovered ? palette.light : palette.button)
        border.color: palette.midlight
        border.width: 1
    }
}
```

---

## 3. Virtualized List vs Repeater

### ❌ Slop (Unvirtualized Repeater in ScrollView)
```qml
// DON'T: Repeater instantiates all delegates at once, killing performance
ScrollView {
    Column {
        Repeater {
            model: fileModel
            Text { text: modelData }
        }
    }
}
```

### ✅ Clean (Virtualized ListView)
```qml
// DO: ListView dynamically virtualizes rows on screen
ListView {
    anchors.fill: parent
    model: fileModel
    clip: true
    delegate: ItemDelegate {
        width: ListView.view.width
        text: modelData
        highlighted: ListView.isCurrentItem
    }
    ScrollBar.vertical: ScrollBar {}
}
```

---

## 4. Multi-Pane Workspace Layout

### ❌ Slop (Hardcoded Pixel Offsets)
```qml
// DON'T: Hardcoded geometry breaks on window resize or high DPI scaling
Rectangle {
    x: 0; y: 40; width: 250; height: 500
}
Rectangle {
    x: 250; y: 40; width: 750; height: 500
}
```

### ✅ Clean (SplitView with Fill-Width Sovereign Surface)
```qml
// DO: SplitView handles DPI scaling and lets sovereign pane absorb window width
SplitView {
    anchors.fill: parent
    orientation: Qt.Horizontal

    // Sidebar: fixed initial width with bounds
    Pane {
        SplitView.preferredWidth: 260
        SplitView.minimumWidth: 200
        SplitView.maximumWidth: 400
        // ... tree or navigator
    }

    // Sovereign Editor/Canvas: fills remaining width
    Pane {
        SplitView.fillWidth: true
        SplitView.minimumWidth: 400
        // ... sovereign work surface
    }
}
```
