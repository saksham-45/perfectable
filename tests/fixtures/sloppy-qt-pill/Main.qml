import QtQuick
import QtQuick.Controls

ApplicationWindow {
    width: 800
    height: 600
    visible: true

    menuBar: MenuBar {
        Menu {
            title: "File"
        }
    }

    Button {
        text: "Submit"
        radius: 24
    }
}
