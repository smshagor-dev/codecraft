import { v4 as uuidv4 } from 'uuid';

export const FILE_TYPES = {
  FOLDER: 'folder',
  FILE: 'file'
};

export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export const getLanguageFromExtension = (filename) => {
  const extension = getFileExtension(filename);
  
  const languageMap = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'vue': 'vue',
    'svelte': 'svelte',
    
    // Web
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    
    // Backend & Programming Languages
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'cxx': 'cpp',
    'cc': 'cpp',
    'c': 'c',
    'h': 'c',
    'hpp': 'cpp',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'sol': 'solidity',
    'php': 'php',
    'rb': 'ruby',
    'scala': 'scala',
    'pl': 'perl',
    'pm': 'perl',
    'lua': 'lua',
    'hs': 'haskell',
    'elm': 'elm',
    'clj': 'clojure',
    'cljs': 'clojure',
    'erl': 'erlang',
    'ex': 'elixir',
    'exs': 'elixir',
    'r': 'r',
    'm': 'matlab',
    
    // Data & Config
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'prisma': 'prisma',
    'graphql': 'graphql',
    'gql': 'graphql',
    'csv': 'plaintext',
    'tsv': 'plaintext',
    
    // Documentation
    'md': 'markdown',
    'mdx': 'markdown',
    'txt': 'plaintext',
    'rst': 'restructuredtext',
    
    // Shell & Configs
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'ps1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',
    'conf': 'plaintext',
    'config': 'plaintext',
    'ini': 'ini',
    'toml': 'toml'
  };

  return languageMap[extension] || 'plaintext';
};

export const getIconForFile = (filename) => {
  const extension = getFileExtension(filename);
  
  const iconMap = {
    // JavaScript/TypeScript
    'js': '📜',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'vue': '💚',
    'svelte': '🟧',
    
    // Web
    'html': '🌐',
    'css': '🎨',
    'scss': '💜',
    'sass': '💜',
    'less': '🔵',
    
    // Backend
    'py': '🐍',
    'java': '☕',
    'go': '🔷',
    'rs': '🦀',
    'cpp': '🔵',
    'c': '🔵',
    'swift': '🐦',
    'kt': '🟣',
    'dart': '💙',
    'php': '🐘',
    'rb': '💎',
    
    // Data
    'json': '📋',
    'yaml': '⚙️',
    'yml': '⚙️',
    'xml': '📰',
    'sql': '🗃️',
    
    // Docs
    'md': '📝',
    'txt': '📄',
    'pdf': '📕'
  };

  return iconMap[extension] || '📄';
};

export const getFileCategory = (filename) => {
  const extension = getFileExtension(filename);
  
  const categories = {
    // Code
    'js': 'code', 'jsx': 'code', 'ts': 'code', 'tsx': 'code', 'vue': 'code', 'svelte': 'code',
    'py': 'code', 'java': 'code', 'go': 'code', 'rs': 'code', 'cpp': 'code', 'c': 'code',
    'swift': 'code', 'kt': 'code', 'dart': 'code', 'php': 'code', 'rb': 'code', 'scala': 'code',
    'lua': 'code', 'hs': 'code', 'elm': 'code', 'clj': 'code', 'erl': 'code', 'ex': 'code',
    
    // Web
    'html': 'web', 'css': 'web', 'scss': 'web', 'sass': 'web', 'less': 'web',
    
    // Data
    'json': 'data', 'yaml': 'data', 'yml': 'data', 'xml': 'data', 'sql': 'data',
    'csv': 'data', 'tsv': 'data', 'graphql': 'data', 'gql': 'data',
    
    // Docs
    'md': 'document', 'txt': 'document', 'pdf': 'document', 'doc': 'document', 'docx': 'document',
    
    // Images
    'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'gif': 'image', 'svg': 'image',
    'webp': 'image', 'bmp': 'image', 'ico': 'image',
    
    // Media
    'mp4': 'media', 'avi': 'media', 'mov': 'media', 'mp3': 'media', 'wav': 'media',
    
    // Archives
    'zip': 'archive', 'rar': 'archive', 'tar': 'archive', 'gz': 'archive',
    
    // Config
    'conf': 'config', 'config': 'config', 'ini': 'config', 'toml': 'config'
  };

  return categories[extension] || 'file';
};

export class FileSystemNode {
  constructor(name, type = FILE_TYPES.FILE, parent = null) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.parent = parent;
    this.children = type === FILE_TYPES.FOLDER ? [] : null;
    this.content = type === FILE_TYPES.FILE ? '' : null;
    this.language = type === FILE_TYPES.FILE ? getLanguageFromExtension(name) : null;
    this.category = type === FILE_TYPES.FILE ? getFileCategory(name) : null;
    this.isOpen = type === FILE_TYPES.FOLDER ? false : null;
    this.createdAt = new Date().toISOString();
    this.modifiedAt = new Date().toISOString();
    this.size = 0;
    this.encoding = 'utf-8';
  }

  addChild(child) {
    if (this.type === FILE_TYPES.FOLDER) {
      child.parent = this.id;
      this.children.push(child);
      this.updateModified();
      return child;
    }
    throw new Error('Cannot add child to a file');
  }

  removeChild(childId) {
    if (this.type === FILE_TYPES.FOLDER) {
      this.children = this.children.filter(child => child.id !== childId);
      this.updateModified();
    }
  }

  findNode(nodeId) {
    if (this.id === nodeId) {
      return this;
    }
    if (this.type === FILE_TYPES.FOLDER && this.children) {
      for (const child of this.children) {
        const found = child.findNode(nodeId);
        if (found) return found;
      }
    }
    return null;
  }

  findNodeByPath(path) {
    const parts = path.split('/').filter(part => part && part !== '.');
    let current = this;

    for (const part of parts) {
      if (current.type !== FILE_TYPES.FOLDER) return null;
      const child = current.children?.find(child => child.name === part);
      if (!child) return null;
      current = child;
    }

    return current;
  }

  getPath() {
    const path = [];
    let current = this;
    while (current && current.name !== 'root') {
      path.unshift(current.name);
      current = current.parent instanceof FileSystemNode ? current.parent : null;
    }
    return path.join('/');
  }

  updateModified() {
    this.modifiedAt = new Date().toISOString();
  }

  calculateSize() {
    if (this.type === FILE_TYPES.FILE) {
      this.size = this.content ? Buffer.from(this.content).length : 0;
    } else if (this.type === FILE_TYPES.FOLDER && this.children) {
      this.size = this.children.reduce((total, child) => total + child.calculateSize(), 0);
    }
    return this.size;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      parent: this.parent,
      children: this.children ? this.children.map(child => child.toJSON()) : null,
      content: this.content,
      language: this.language,
      category: this.category,
      isOpen: this.isOpen,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      size: this.size,
      encoding: this.encoding
    };
  }

  static fromJSON(json) {
    const node = new FileSystemNode(json.name, json.type);
    node.id = json.id;
    node.parent = json.parent;
    node.content = json.content;
    node.language = json.language;
    node.category = json.category;
    node.isOpen = json.isOpen;
    node.createdAt = json.createdAt;
    node.modifiedAt = json.modifiedAt;
    node.size = json.size || 0;
    node.encoding = json.encoding || 'utf-8';
    
    if (json.children && Array.isArray(json.children)) {
      node.children = json.children.map(child => FileSystemNode.fromJSON(child));
    }
    
    return node;
  }

  // Helper methods for file operations
  isTextFile() {
    if (this.type !== FILE_TYPES.FILE) return false;
    
    const textExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
      'html', 'css', 'scss', 'sass', 'less',
      'py', 'java', 'go', 'rs', 'cpp', 'c', 'h', 'swift', 'kt', 'dart',
      'php', 'rb', 'scala', 'lua', 'hs', 'elm', 'clj', 'erl', 'ex',
      'json', 'yaml', 'yml', 'xml', 'sql', 'graphql', 'gql',
      'md', 'txt', 'rst', 'sh', 'bash', 'ps1', 'bat', 'cmd',
      'conf', 'config', 'ini', 'toml'
    ];
    
    return textExtensions.includes(getFileExtension(this.name));
  }

  getMimeType() {
    const extension = getFileExtension(this.name);
    const mimeTypes = {
      'js': 'application/javascript',
      'jsx': 'application/javascript',
      'ts': 'application/typescript',
      'tsx': 'application/typescript',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'py': 'text/x-python',
      'java': 'text/x-java',
      'cpp': 'text/x-c++',
      'c': 'text/x-c',
      'php': 'application/x-php',
      'xml': 'application/xml',
      'svg': 'image/svg+xml',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'zip': 'application/zip'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

export class FileSystem {
  constructor() {
    this.root = new FileSystemNode('root', FILE_TYPES.FOLDER);
    this.openFiles = new Map();
    this.selectedFile = null;
    this.recentFiles = [];
  }

  createFile(parentId, filename, content = '') {
    const parent = parentId ? this.findNode(parentId) : this.root;
    if (!parent || parent.type !== FILE_TYPES.FOLDER) {
      throw new Error('Invalid parent folder');
    }
    
    // Check if file already exists
    if (parent.children?.some(child => child.name === filename)) {
      throw new Error(`File "${filename}" already exists`);
    }
    
    const file = new FileSystemNode(filename, FILE_TYPES.FILE);
    file.content = content;
    file.language = getLanguageFromExtension(filename);
    file.category = getFileCategory(filename);
    parent.addChild(file);
    
    return file;
  }

  createFolder(parentId, foldername) {
    const parent = parentId ? this.findNode(parentId) : this.root;
    if (!parent || parent.type !== FILE_TYPES.FOLDER) {
      throw new Error('Invalid parent folder');
    }
    
    // Check if folder already exists
    if (parent.children?.some(child => child.name === foldername)) {
      throw new Error(`Folder "${foldername}" already exists`);
    }
    
    const folder = new FileSystemNode(foldername, FILE_TYPES.FOLDER);
    parent.addChild(folder);
    return folder;
  }

  deleteNode(nodeId) {
    if (nodeId === this.root.id) {
      throw new Error('Cannot delete root folder');
    }
    
    const node = this.findNode(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    // Find parent and remove child
    const parent = this.findNode(node.parent);
    if (parent) {
      parent.removeChild(nodeId);
    }
    
    // Clean up open files and selection
    this.openFiles.delete(nodeId);
    if (this.selectedFile === nodeId) {
      this.selectedFile = null;
    }
    this.recentFiles = this.recentFiles.filter(id => id !== nodeId);
    
    return true;
  }

  renameNode(nodeId, newName) {
    const node = this.findNode(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    // Check for name conflicts in the same directory
    const parent = this.findNode(node.parent);
    if (parent && parent.children?.some(child => child.id !== nodeId && child.name === newName)) {
      throw new Error(`A file or folder with name "${newName}" already exists`);
    }
    
    node.name = newName;
    if (node.type === FILE_TYPES.FILE) {
      node.language = getLanguageFromExtension(newName);
      node.category = getFileCategory(newName);
    }
    node.updateModified();
    
    return node;
  }

  updateFileContent(fileId, content) {
    const file = this.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    file.content = content;
    file.updateModified();
    file.calculateSize();
    
    return file;
  }

  getFileContent(fileId) {
    const file = this.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    return file.content;
  }

  openFile(fileId) {
    const file = this.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    this.openFiles.set(fileId, file);
    this.selectedFile = fileId;
    
    // Add to recent files
    this.recentFiles = this.recentFiles.filter(id => id !== fileId);
    this.recentFiles.unshift(fileId);
    if (this.recentFiles.length > 10) {
      this.recentFiles.pop();
    }
    
    return file;
  }

  closeFile(fileId) {
    this.openFiles.delete(fileId);
    if (this.selectedFile === fileId) {
      this.selectedFile = null;
    }
  }

  getOpenFiles() {
    return Array.from(this.openFiles.values());
  }

  toggleFolder(folderId) {
    const folder = this.findNode(folderId);
    if (!folder || folder.type !== FILE_TYPES.FOLDER) {
      throw new Error('Folder not found');
    }
    
    folder.isOpen = !folder.isOpen;
    folder.updateModified();
    return folder;
  }

  findNode(nodeId) {
    return this.root.findNode(nodeId);
  }

  findNodeByPath(path) {
    return this.root.findNodeByPath(path);
  }

  getAllFiles() {
    const files = [];
    
    const traverse = (node) => {
      if (node.type === FILE_TYPES.FILE) {
        files.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    traverse(this.root);
    return files;
  }

  getFilesByType(extension) {
    return this.getAllFiles().filter(file => 
      getFileExtension(file.name) === extension
    );
  }

  searchFiles(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    const traverse = (node) => {
      if (node.name.toLowerCase().includes(searchTerm)) {
        results.push(node);
      }
      if (node.type === FILE_TYPES.FILE && node.content && 
          node.content.toLowerCase().includes(searchTerm)) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    traverse(this.root);
    return [...new Set(results)]; // Remove duplicates
  }

  calculateTotalSize() {
    return this.root.calculateSize();
  }

  exportToJSON() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const newFS = FileSystem.fromJSON(data);
      
      // Copy properties
      this.root = newFS.root;
      this.openFiles = newFS.openFiles;
      this.selectedFile = newFS.selectedFile;
      this.recentFiles = newFS.recentFiles;
      
      return true;
    } catch (error) {
      throw new Error('Invalid project file format');
    }
  }

  toJSON() {
    return {
      root: this.root.toJSON(),
      openFiles: Array.from(this.openFiles.keys()),
      selectedFile: this.selectedFile,
      recentFiles: this.recentFiles,
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
  }

  static fromJSON(json) {
    const fs = new FileSystem();
    fs.root = FileSystemNode.fromJSON(json.root);
    
    if (json.openFiles) {
      json.openFiles.forEach(fileId => {
        const file = fs.findNode(fileId);
        if (file) {
          fs.openFiles.set(fileId, file);
        }
      });
    }
    
    fs.selectedFile = json.selectedFile || null;
    fs.recentFiles = json.recentFiles || [];
    
    return fs;
  }

  // Create a comprehensive default project structure
  static createDefaultProject() {
    const fs = new FileSystem();
    
    // Create src folder
    const srcFolder = fs.createFolder(fs.root.id, 'src');
    const componentsFolder = fs.createFolder(srcFolder.id, 'components');
    const utilsFolder = fs.createFolder(srcFolder.id, 'utils');
    
    // Create public folder
    const publicFolder = fs.createFolder(fs.root.id, 'public');
    
    // Create config files
    fs.createFile(fs.root.id, 'package.json', `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A new project created with Online Code Editor",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}`);

    fs.createFile(fs.root.id, 'vite.config.js', `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})`);

    // Create main application files
    fs.createFile(srcFolder.id, 'main.jsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

    fs.createFile(srcFolder.id, 'App.jsx', `import { useState } from 'react'
import Header from './components/Header.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <h1>Welcome to Your New Project!</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
      </main>
    </div>
  )
}

export default App`);

    fs.createFile(srcFolder.id, 'index.css', `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}`);

    fs.createFile(srcFolder.id, 'App.css', `.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card {
  padding: 2em;
  margin: 1em 0;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  button {
    background-color: #f9f9f9;
    color: #213547;
  }
}`);

    // Create components
    fs.createFile(componentsFolder.id, 'Header.jsx', `import './Header.css'

function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <h1>My Awesome Project</h1>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header`);

    fs.createFile(componentsFolder.id, 'Header.css', `.header {
  background-color: #1a1a1a;
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.nav h1 {
  color: #646cff;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: inherit;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #646cff;
}`);

    // Create utility files
    fs.createFile(utilsFolder.id, 'helpers.js', `// Utility functions
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}`);

    fs.createFile(utilsFolder.id, 'constants.js', `// Application constants
export const APP_CONFIG = {
  name: 'My Project',
  version: '1.0.0',
  author: 'Developer',
  repository: 'https://github.com/username/my-project'
}

export const API_ENDPOINTS = {
  BASE_URL: 'https://api.example.com',
  USERS: '/users',
  POSTS: '/posts',
  COMMENTS: '/comments'
}

export const THEME = {
  colors: {
    primary: '#646cff',
    secondary: '#535bf2',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
}`);

    // Create public files
    fs.createFile(publicFolder.id, 'index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Project - Online Code Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`);

    fs.createFile(publicFolder.id, 'vite.svg', `<svg width="31" height="32" viewBox="0 0 31 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M30.155 2.899L23.43 29.35a1.347 1.347 0 01-2.322.663l-5.238-5.68-3.166 4.06a.732.732 0 01-1.212-.073l-2.74-4.944-6.563-3.998a1.347 1.347 0 01.396-2.467l26.916-7.594a.675.675 0 01.854.8z" fill="url(#paint0_linear_83_60)"/>
<path d="M21.387 25.688l-4.115-10.986 10.358 2.921-6.243 8.065z" fill="url(#paint1_linear_83_60)"/>
<defs>
<linearGradient id="paint0_linear_83_60" x1="25.993" y1="4.067" x2="8.797" y2="29.447" gradientUnits="userSpaceOnUse">
<stop stop-color="#41D1FF"/>
<stop offset="1" stop-color="#BD34FE"/>
</linearGradient>
<linearGradient id="paint1_linear_83_60" x1="23.262" y1="16.297" x2="20.306" y2="24.846" gradientUnits="userSpaceOnUse">
<stop stop-color="#FFEA83"/>
<stop offset="0.083" stop-color="#FFDD35"/>
<stop offset="1" stop-color="#FFA800"/>
</linearGradient>
</defs>
</svg>`);

    // Create documentation
    fs.createFile(fs.root.id, 'README.md', `# My Project

Welcome to your new project created with the Online Code Editor!

## 🚀 Features

- **Modern Stack**: React 18 + Vite for fast development
- **Hot Reload**: Instant preview of your changes
- **TypeScript Ready**: Configured for TypeScript development
- **Responsive Design**: Mobile-first CSS approach

## 📁 Project Structure

\`\`\`
my-project/
├── public/
│   ├── index.html
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── utils/
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
\`\`\`

## 🛠️ Getting Started

1. **Edit files** in the file explorer
2. **Run your code** with Cmd/Ctrl + Enter
3. **View output** in the developer console
4. **Customize** the components and styles

## 📚 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build

## 🎯 Next Steps

1. Explore the component structure
2. Modify the App.jsx to build your UI
3. Add new components in the components folder
4. Customize styles in CSS files
5. Install additional dependencies as needed

Happy coding! 🎉`);

    // Create additional configuration files
    fs.createFile(fs.root.id, '.gitignore', `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and *not* Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test`);

    // Open the main App file by default
    const appFile = srcFolder.children.find(child => child.name === 'App.jsx');
    if (appFile) {
      fs.openFile(appFile.id);
    }

    return fs;
  }
}

// Utility functions for file operations
export const isValidFilename = (filename) => {
  const invalidChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
  return !invalidChars.some(char => filename.includes(char)) && filename.trim() !== '';
};

export const generateUniqueName = (baseName, existingNames) => {
  let counter = 1;
  let newName = baseName;
  
  while (existingNames.includes(newName)) {
    const extension = getFileExtension(baseName);
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
    newName = extension ? `${nameWithoutExt} (${counter}).${extension}` : `${baseName} (${counter})`;
    counter++;
  }
  
  return newName;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getSupportedFileTypes = () => {
  return {
    code: ['js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'php', 'rb'],
    web: ['html', 'css', 'scss', 'sass', 'less'],
    data: ['json', 'yaml', 'yml', 'xml', 'sql', 'csv'],
    documents: ['md', 'txt', 'pdf'],
    config: ['json', 'yaml', 'yml', 'toml', 'ini']
  };
};