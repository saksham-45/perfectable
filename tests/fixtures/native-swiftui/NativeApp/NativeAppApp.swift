import SwiftUI

@main
struct NativeApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: NativeAppDocument()) { file in
            ContentView(document: file.$document)
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