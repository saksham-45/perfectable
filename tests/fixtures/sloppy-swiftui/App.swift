import SwiftUI

@main
struct SloppyApp: App {
    var body: some Scene {
        WindowGroup {
            EditorView()
        }
    }
}

struct EditorView: View {
    @State private var text = ""
    @State private var files = ["a.swift", "b.swift"]

    var body: some View {
        VStack {
            Button("Open") { text = "/tmp/notes.txt" }
            ScrollView {
                ForEach(files, id: \.self) { name in
                    Text(name)
                }
            }
            TextEditor(text: $text)
                .font(.system(size: 13))
                .animation(.default)
        }
        .sheet(isPresented: .constant(true)) {
            Text("Settings")
        }
    }
}
