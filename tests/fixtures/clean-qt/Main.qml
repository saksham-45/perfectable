import QtQuick
import QtQuick.Controls
import QtQuick.Dialogs

ApplicationWindow {
    id: window
    width: 900
    height: 600
    visible: true
    title: qsTr("Clean Qt Workbench")

    menuBar: MenuBar {
        Menu {
            title: qsTr("&File")
            Action {
                text: qsTr("&Open...")
                shortcut: StandardKey.Open
                onTriggered: fileDialog.open()
            }
            Action {
                text: qsTr("&Quit")
                shortcut: StandardKey.Quit
                onTriggered: Qt.quit()
            }
        }
    }

    FileDialog {
        id: fileDialog
        title: qsTr("Choose a file")
    }

    ListView {
        anchors.fill: parent
        model: ["main.cpp", "App.qml"]
        delegate: ItemDelegate {
            text: modelData
            width: ListView.view.width
        }
    }
}
