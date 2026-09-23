import QtQuick
import QtQuick.Window

Window {
    flags: Qt.FramelessWindowHint
    visible: true
    Repeater {
        model: ["a.cpp", "b.cpp"]
        Text { text: modelData }
    }
    Button {
        // Open is a label, not a dialog
        text: "Open"
    }
}
