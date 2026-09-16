import { useState, useEffect } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

function App() {
  const [files, setFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadFileList();
  }, []);

  async function loadFileList() {
    try {
      const result = await invoke('list_files');
      setFiles(result);
    } catch (e) {
      console.error('Failed to load files:', e);
    }
  }

  async function handleNewFile() {
    const path = await open({ directory: false, multiple: false, title: 'Create new file' });
    if (path) {
      await writeTextFile(path, '');
      await loadFileList();
      setActiveFile(path);
      setContent('');
      setIsDirty(false);
    }
  }

  async function handleOpenFile() {
    const path = await open({ directory: false, multiple: false, title: 'Open file' });
    if (path) {
      const fileContent = await readTextFile(path);
      await loadFileList();
      setActiveFile(path);
      setContent(fileContent);
      setIsDirty(false);
    }
  }

  async function handleSaveFile() {
    if (!activeFile) {
      const path = await save({ title: 'Save file' });
      if (path) {
        await writeTextFile(path, content);
        await loadFileList();
        setActiveFile(path);
        setIsDirty(false);
      }
      return;
    }
    await writeTextFile(activeFile, content);
    setIsDirty(false);
  }

  return (
    <div className="app">
      <header className="titlebar" data-tauri-drag-region>
        <div className="titlebar-drag" style={{ WebkitAppRegion: 'drag' }}>
          <span className="titlebar-title">{activeFile || 'Untitled'}{isDirty && ' ●'}</span>
        </div>
        <div className="titlebar-controls" style={{ WebkitAppRegion: 'no-drag' }}>
          <button className="titlebar-btn" onClick={() => invoke('minimize')} aria-label="Minimize">−</button>
          <button className="titlebar-btn" onClick={() => invoke('maximize')} aria-label="Maximize">□</button>
          <button className="titlebar-btn" onClick={() => invoke('close')} aria-label="Close">×</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar" role="navigation" aria-label="File explorer">
          <div className="sidebar-header">Files</div>
          <ul className="file-tree" role="tree" aria-label="Project files">
            {files.map((file) => (
              <li
                key={file}
                className="file-tree-item"
                role="treeitem"
                tabIndex={0}
                aria-selected={file === activeFile}
                onClick={() => {
                  setActiveFile(file);
                  readTextFile(file).then(setContent);
                  setIsDirty(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveFile(file);
                    readTextFile(file).then(setContent);
                    setIsDirty(false);
                  }
                }}
              >
                <span className="file-icon" aria-hidden="true">📄</span>
                <span className="file-name">{file.split('/').pop()}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="editor-area" role="main">
          <div className="toolbar" role="toolbar" aria-label="File operations">
            <button onClick={handleNewFile} aria-label="New file (Ctrl+N)">New</button>
            <button onClick={handleOpenFile} aria-label="Open file (Ctrl+O)">Open</button>
            <button onClick={handleSaveFile} aria-label="Save file (Ctrl+S)" disabled={!isDirty}>Save</button>
          </div>
          <textarea
            className="editor"
            value={content}
            onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
            spellCheck={false}
            aria-label={`Editor for ${activeFile || 'new file'}`}
            placeholder={activeFile ? '' : 'Open or create a file to start editing...'}
          />
        </main>
      </div>

      <footer className="statusbar" role="status" aria-live="polite">
        <div className="statusbar-left">
          <span className="status-item">{activeFile ? '●' : '○'} {activeFile || 'No file open'}</span>
        </div>
        <div className="statusbar-right">
          <span className="status-item">Tauri + React</span>
        </div>
      </footer>
    </div>
  );
}

export default App;