import { lineOf, snippetAt } from './lib.mjs';

function hit(rule, file, content, index) {
  const at = index < 0 ? 0 : index;
  return {
    id: rule.id,
    name: rule.name,
    category: rule.category,
    severity: rule.severity,
    file,
    line: lineOf(content, at),
    snippet: snippetAt(content, at),
    message: rule.description,
  };
}

const NATIVE_OPEN = /NSOpenPanel|fileImporter\b|QFileDialog|GtkFileDialog|gtk_file_dialog|GtkFileChooserNative|FileOpenPicker|rfd::|showOpenDialog/;
const DIRTY = /isDocumentEdited|setWindowModified|documentEdited|_isDirty|windowModified|edited\s*=\s*true/;
const ESCAPE = /\bEscape\b|Key\.escape|Qt\.Key_Escape|VK_ESCAPE|cancelAction|keyEquivalent:\s*"\u001b"/;

export const NATIVE_RULES = [
  {
    id: 'swiftui-scroll-unvirtualized',
    category: 'ide',
    severity: 'error',
    immediate: true,
    name: 'Unvirtualized SwiftUI scroll',
    description: 'ScrollView + ForEach materializes every row. Use List or LazyVStack.',
    test(file, content) {
      if (!file.endsWith('.swift')) return [];
      if (/ScrollView\b/.test(content) && /ForEach\b/.test(content) && !/LazyVStack|LazyHStack|\bList\b/.test(content)) {
        return [hit(this, file, content, content.search(/ScrollView\b/))];
      }
      return [];
    },
  },
  {
    id: 'swiftui-settings-sheet',
    category: 'platform',
    severity: 'warning',
    immediate: true,
    name: 'Settings in a sheet',
    description: 'macOS settings belong in a Settings scene, not a sheet over the editor.',
    test(file, content) {
      if (!file.endsWith('.swift')) return [];
      if (/\.sheet\s*\(/.test(content) && /Settings/.test(content)) {
        return [hit(this, file, content, content.search(/\.sheet\s*\(/))];
      }
      return [];
    },
  },
  {
    id: 'swiftui-fixed-type',
    category: 'a11y',
    severity: 'warning',
    name: 'Fixed point size',
    description: '.font(.system(size:)) ignores Dynamic Type. Use a text style.',
    test(file, content) {
      if (!file.endsWith('.swift')) return [];
      const idx = content.search(/\.font\(\s*\.system\(\s*size:/);
      if (idx >= 0) return [hit(this, file, content, idx)];
      return [];
    },
  },
  {
    id: 'swiftui-no-reduce-motion',
    category: 'a11y',
    severity: 'warning',
    name: 'Motion ignores Reduce Motion',
    description: 'Animation with no accessibilityReduceMotion alternative.',
    test(file, content) {
      if (!file.endsWith('.swift')) return [];
      if (/\.animation\s*\(/.test(content) && !/accessibilityReduceMotion/.test(content)) {
        return [hit(this, file, content, content.search(/\.animation\s*\(/))];
      }
      return [];
    },
  },
  {
    id: 'egui-scroll-unvirtualized',
    category: 'ide',
    severity: 'error',
    immediate: true,
    name: 'Unvirtualized egui scroll',
    description: 'ScrollArea walks every row. Use show_rows / show_rows_viewport.',
    test(file, content) {
      if (!file.endsWith('.rs') || !/egui/.test(content)) return [];
      if (/ScrollArea::/.test(content) && /\bfor\b/.test(content) && !/show_rows/.test(content)) {
        return [hit(this, file, content, content.search(/ScrollArea::/))];
      }
      return [];
    },
  },
  {
    id: 'egui-hardcoded-accent',
    category: 'slop',
    severity: 'advisory',
    name: 'Hardcoded egui accent',
    description: 'Violet Color32 on a dark panel is the default AI-IDE palette. Use the theme.',
    test(file, content) {
      if (!file.endsWith('.rs')) return [];
      const idx = content.search(/Color32::from_rgb\(\s*124\s*,\s*58\s*,\s*237\s*\)|Color32::from_rgb\(\s*139\s*,\s*92\s*,\s*246\s*\)/);
      if (idx >= 0) return [hit(this, file, content, idx)];
      return [];
    },
  },
  {
    id: 'qt-frameless-no-drag',
    category: 'platform',
    severity: 'error',
    immediate: true,
    name: 'Frameless Qt window cannot move',
    description: 'FramelessWindowHint without startSystemMove or a drag handler.',
    test(file, content) {
      if (!/\.(qml|cpp|h)$/.test(file)) return [];
      if (/FramelessWindowHint/.test(content) && !/startSystemMove|mousePressEvent/.test(content)) {
        return [hit(this, file, content, content.search(/FramelessWindowHint/))];
      }
      return [];
    },
  },
  {
    id: 'qt-repeater-not-list',
    category: 'ide',
    severity: 'error',
    immediate: true,
    name: 'Qt Repeater instead of ListView',
    description: 'Repeater builds every delegate. Use ListView for a file or row model.',
    test(file, content) {
      if (!file.endsWith('.qml')) return [];
      if (/\bRepeater\b/.test(content) && !/\bListView\b/.test(content)) {
        return [hit(this, file, content, content.search(/\bRepeater\b/))];
      }
      return [];
    },
  },
  {
    id: 'flutter-unvirtualized-list',
    category: 'ide',
    severity: 'error',
    immediate: true,
    name: 'Flutter ListView children',
    description: 'ListView(children:) builds every row. Use ListView.builder.',
    test(file, content) {
      if (!file.endsWith('.dart')) return [];
      if (/ListView\s*\(\s*children:/.test(content) && !/ListView\.builder/.test(content)) {
        return [hit(this, file, content, content.search(/ListView\s*\(/))];
      }
      return [];
    },
  },
  {
    id: 'gtk-css-hardcoded',
    category: 'platform',
    severity: 'warning',
    name: 'Hardcoded GTK CSS color',
    description: 'A hex color in a CSS provider ignores the desktop theme.',
    test(file, content) {
      if (!/\.(c|css|vala)$/.test(file)) return [];
      if (/gtk_css_provider|GtkCssProvider/.test(content) && /#[0-9a-fA-F]{6}/.test(content)) {
        return [hit(this, file, content, content.search(/#[0-9a-fA-F]{6}/))];
      }
      return [];
    },
  },
  {
    id: 'winui-hardcoded-chrome',
    category: 'slop',
    severity: 'warning',
    name: 'Hardcoded WinUI chrome color',
    description: 'Hex background instead of ThemeResource. High contrast will break.',
    test(file, content) {
      if (!file.endsWith('.xaml')) return [];
      const idx = content.search(/Background="#(?:0a0a0a|7c3aed|8b5cf6|111111)"/i);
      if (idx >= 0) return [hit(this, file, content, idx)];
      return [];
    },
  },
  {
    id: 'winui-settings-dialog',
    category: 'platform',
    severity: 'warning',
    name: 'Settings in a ContentDialog',
    description: 'Preferences belong in a window or page, not a ContentDialog over the editor.',
    test(file, content) {
      if (!file.endsWith('.xaml')) return [];
      if (/ContentDialog/.test(content) && /Settings/.test(content)) {
        return [hit(this, file, content, content.search(/ContentDialog/))];
      }
      return [];
    },
  },
];

function projectHit(rule, host, index) {
  const at = index < 0 ? 0 : index;
  return {
    id: rule.id,
    name: rule.name,
    category: rule.category,
    severity: rule.severity,
    file: host.file,
    line: lineOf(host.content, at),
    snippet: snippetAt(host.content, at),
    message: rule.description,
  };
}

export const NATIVE_PROJECT_RULES = [
  {
    id: 'swiftui-no-commands',
    category: 'platform',
    severity: 'error',
    name: 'SwiftUI app has no commands',
    description: 'An App scene with no .commands has no menu-bar keyboard path.',
    run(files, ctx) {
      const swift = files.some((f) => f.file.endsWith('.swift') && /import SwiftUI/.test(f.content));
      if (ctx.shell !== 'swiftui' && !swift) return [];
      const app = files.find((f) => /@main/.test(f.content) && /:\s*App\b/.test(f.content));
      if (!app) return [];
      if (files.some((f) => /\.commands\b/.test(f.content))) return [];
      return [projectHit(this, app, app.content.search(/@main/))];
    },
  },
  {
    id: 'no-native-open',
    category: 'platform',
    severity: 'warning',
    name: 'Open does not use the system dialog',
    description: 'An Open action exists and no OS file dialog (NSOpenPanel, fileImporter, QFileDialog, GTK, FileOpenPicker, rfd, Electron dialog) appears in the scan.',
    run(files) {
      const joined = files.map((f) => f.content).join('\n');
      const opens = files.find((f) => /Button\(\s*"Open|"Open\.\.\."|Text="Open|Content="Open|title:\s*"Open|text:\s*"Open/.test(f.content));
      if (!opens) return [];
      if (NATIVE_OPEN.test(joined)) return [];
      return [projectHit(this, opens, opens.content.search(/Open/))];
    },
  },
  {
    id: 'no-dirty-indicator',
    category: 'ide',
    severity: 'warning',
    name: 'Editor has no dirty indicator',
    description: 'A text editor is shown and nothing marks the document dirty in the title or window.',
    run(files) {
      const joined = files.map((f) => f.content).join('\n');
      if (/DocumentGroup|FileDocument/.test(joined)) return [];
      const editor = files.find((f) => /TextEditor\(|QPlainTextEdit|x:Name="Editor"|TextBox/.test(f.content));
      if (!editor) return [];
      if (DIRTY.test(joined)) return [];
      return [projectHit(this, editor, editor.content.search(/TextEditor\(|QPlainTextEdit|x:Name="Editor"|TextBox/))];
    },
  },
  {
    id: 'no-escape-dismiss',
    category: 'platform',
    severity: 'warning',
    name: 'Overlay has no Escape',
    description: 'A custom sheet is presented and no Escape / cancel path appears in the scan. Platform dialogs already dismiss on Escape.',
    run(files) {
      const joined = files.map((f) => f.content).join('\n');
      const overlay = files.find((f) => /\.sheet\s*\(/.test(f.content));
      if (!overlay) return [];
      if (ESCAPE.test(joined)) return [];
      return [projectHit(this, overlay, overlay.content.search(/\.sheet\s*\(/))];
    },
  },
  {
    id: 'egui-no-menu',
    category: 'platform',
    severity: 'warning',
    name: 'egui app has no menu bar',
    description: 'CentralPanel with no egui::menu::bar. Desktop tools need a menu.',
    run(files, ctx) {
      if (ctx.shell !== 'egui' && !files.some((f) => /egui::/.test(f.content))) return [];
      const panel = files.find((f) => /CentralPanel::/.test(f.content));
      if (!panel) return [];
      if (files.some((f) => /menu::bar|MenuBar::/.test(f.content))) return [];
      return [projectHit(this, panel, panel.content.search(/CentralPanel::/))];
    },
  },
  {
    id: 'qt-no-menubar',
    category: 'platform',
    severity: 'warning',
    name: 'Qt window has no menu bar',
    description: 'A Qt window with no MenuBar or menuBar().',
    run(files, ctx) {
      if (ctx.shell !== 'qt' && !files.some((f) => f.file.endsWith('.qml'))) return [];
      const win = files.find((f) => /ApplicationWindow|QMainWindow|Window\s*\{/.test(f.content));
      if (!win) return [];
      if (files.some((f) => /\bMenuBar\b|menuBar\s*\(/.test(f.content))) return [];
      return [projectHit(this, win, win.content.search(/ApplicationWindow|QMainWindow|Window\s*\{/))];
    },
  },
];
