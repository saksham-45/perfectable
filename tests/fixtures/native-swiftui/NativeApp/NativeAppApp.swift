import SwiftUI

@main
struct NativeApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: NativeAppDocument()) { file in
            ContentView(document: file.$document)
        }
        Settings {
            SettingsView()
        }
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("New Document") {
                    NSDocumentController.shared.newDocument(nil)
                }
                .keyboardShortcut("n", modifiers: .command)
            }
        }
    }
}