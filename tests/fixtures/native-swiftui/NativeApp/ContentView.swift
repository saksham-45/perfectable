import SwiftUI
import UniformTypeIdentifiers

struct NativeAppDocument: FileDocument {
    var text: String = ""

    static var readableContentTypes: [UTType] { [.plainText] }

    init(text: String = "") { self.text = text }

    init(configuration: ReadConfiguration) throws {
        if let data = configuration.file.regularFileContents,
           let string = String(data: data, encoding: .utf8) {
            text = string
        }
    }

    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        FileWrapper(regularFileWithContents: text.data(using: .utf8)!)
    }
}

struct ContentView: View {
    @Binding var document: NativeAppDocument

    var body: some View {
        VStack(spacing: 0) {
            // Native toolbar
            HStack {
                Button("New") { NSDocumentController.shared.newDocument(nil) }
                    .keyboardShortcut("n", modifiers: .command)
                Button("Open...") { openDocument() }
                    .keyboardShortcut("o", modifiers: .command)
                Button("Save") { saveDocument() }
                    .keyboardShortcut("s", modifiers: .command)
                Button("Save As...") { saveDocumentAs() }
                    .keyboardShortcut("s", modifiers: [.command, .shift])
                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color(NSColor.windowBackgroundColor))
            .overlay(alignment: .bottom) { Divider() }

            // Editor
            TextEditor(text: $document.text)
                .font(.system(.body, design: .monospaced))
                .frame(minWidth: 600, minHeight: 400)
                .padding()
        }
    }

    func openDocument() {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        panel.canChooseFiles = true
        if panel.runModal() == .OK, let url = panel.url {
            try? document.text = String(contentsOf: url)
        }
    }

    func saveDocument() {
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.plainText]
        if panel.runModal() == .OK, let url = panel.url {
            try? document.text.write(to: url, atomically: true, encoding: .utf8)
        }
    }

    func saveDocumentAs() { saveDocument() }
}

struct SettingsView: View {
    @AppStorage("fontSize") var fontSize: Double = 13
    @AppStorage("theme") var theme: String = "system"

    var body: some View {
        TabView {
            Form {
                Section("Editor") {
                    Stepper("Font Size: \(Int(fontSize))", value: $fontSize, in: 10...24)
                    Picker("Theme", selection: $theme) {
                        Text("System").tag("system")
                        Text("Light").tag("light")
                        Text("Dark").tag("dark")
                    }
                }
            }
            .tabItem { Label("Editor", systemImage: "textformat") }

            Form {
                Section("General") {
                    Text("Native settings window")
                }
            }
            .tabItem { Label("General", systemImage: "gear") }
        }
        .padding()
    }
}