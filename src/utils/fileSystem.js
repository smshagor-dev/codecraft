import { v4 as uuidv4 } from 'uuid';

export const FILE_TYPES = {
  FOLDER: 'folder',
  FILE: 'file'
};

export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
};

export const getLanguageFromExtension = (filename) => {
  const extension = getFileExtension(filename);
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cs': 'csharp',
    'php': 'php',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  return languageMap[extension] || 'plaintext';
};

export const getIconForFile = (filename) => {
  const extension = getFileExtension(filename);
  const iconMap = {
    'js': '📜',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'py': '🐍',
    'java': '☕',
    'cs': '🔷',
    'php': '🐘',
    'html': '🌐',
    'css': '🎨',
    'json': '📋',
    'md': '📝',
    'txt': '📄',
    'xml': '📰',
    'yaml': '⚙️',
    'yml': '⚙️'
  };
  return iconMap[extension] || '📄';
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
    this.isOpen = false;
    this.createdAt = new Date().toISOString();
    this.modifiedAt = new Date().toISOString();
  }

  addChild(child) {
    if (this.type === FILE_TYPES.FOLDER) {
      child.parent = this.id;
      this.children.push(child);
      return child;
    }
    throw new Error('Cannot add child to a file');
  }

  removeChild(childId) {
    if (this.type === FILE_TYPES.FOLDER) {
      this.children = this.children.filter(child => child.id !== childId);
    }
  }

  findNode(nodeId) {
    if (this.id === nodeId) {
      return this;
    }
    if (this.type === FILE_TYPES.FOLDER) {
      for (const child of this.children) {
        const found = child.findNode(nodeId);
        if (found) return found;
      }
    }
    return null;
  }

  getPath() {
    const path = [];
    let current = this;
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    return path.join('/');
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
      isOpen: this.isOpen,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt
    };
  }

  static fromJSON(json) {
    const node = new FileSystemNode(json.name, json.type);
    node.id = json.id;
    node.parent = json.parent;
    node.content = json.content;
    node.language = json.language;
    node.isOpen = json.isOpen;
    node.createdAt = json.createdAt;
    node.modifiedAt = json.modifiedAt;
    
    if (json.children) {
      node.children = json.children.map(child => FileSystemNode.fromJSON(child));
    }
    
    return node;
  }
}

export class FileSystem {
  constructor() {
    this.root = new FileSystemNode('root', FILE_TYPES.FOLDER);
    this.openFiles = new Map();
  }

  createFile(parentId, filename, content = '') {
    const parent = parentId ? this.root.findNode(parentId) : this.root;
    if (!parent || parent.type !== FILE_TYPES.FOLDER) {
      throw new Error('Invalid parent folder');
    }
    
    const file = new FileSystemNode(filename, FILE_TYPES.FILE);
    file.content = content;
    file.language = getLanguageFromExtension(filename);
    parent.addChild(file);
    return file;
  }

  createFolder(parentId, foldername) {
    const parent = parentId ? this.root.findNode(parentId) : this.root;
    if (!parent || parent.type !== FILE_TYPES.FOLDER) {
      throw new Error('Invalid parent folder');
    }
    
    const folder = new FileSystemNode(foldername, FILE_TYPES.FOLDER);
    parent.addChild(folder);
    return folder;
  }

  deleteNode(nodeId) {
    if (nodeId === this.root.id) {
      throw new Error('Cannot delete root folder');
    }
    
    const node = this.root.findNode(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    // Find parent and remove child
    const parent = this.root.findNode(node.parent);
    if (parent) {
      parent.removeChild(nodeId);
    }
    
    // Close file if open
    this.openFiles.delete(nodeId);
    
    return true;
  }

  renameNode(nodeId, newName) {
    const node = this.root.findNode(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    node.name = newName;
    if (node.type === FILE_TYPES.FILE) {
      node.language = getLanguageFromExtension(newName);
    }
    node.modifiedAt = new Date().toISOString();
    
    return node;
  }

  updateFileContent(fileId, content) {
    const file = this.root.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    file.content = content;
    file.modifiedAt = new Date().toISOString();
    
    return file;
  }

  getFileContent(fileId) {
    const file = this.root.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    return file.content;
  }

  openFile(fileId) {
    const file = this.root.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    this.openFiles.set(fileId, file);
    return file;
  }

  closeFile(fileId) {
    this.openFiles.delete(fileId);
  }

  getOpenFiles() {
    return Array.from(this.openFiles.values());
  }

  toggleFolder(folderId) {
    const folder = this.root.findNode(folderId);
    if (!folder || folder.type !== FILE_TYPES.FOLDER) {
      throw new Error('Folder not found');
    }
    
    folder.isOpen = !folder.isOpen;
    return folder;
  }

  toJSON() {
    return {
      root: this.root.toJSON(),
      openFiles: Array.from(this.openFiles.keys())
    };
  }

  static fromJSON(json) {
    const fs = new FileSystem();
    fs.root = FileSystemNode.fromJSON(json.root);
    
    if (json.openFiles) {
      json.openFiles.forEach(fileId => {
        const file = fs.root.findNode(fileId);
        if (file) {
          fs.openFiles.set(fileId, file);
        }
      });
    }
    
    return fs;
  }

  // Create a default project structure
  static createDefaultProject() {
    const fs = new FileSystem();
    
    // Create src folder
    const srcFolder = fs.createFolder(fs.root.id, 'src');
    
    // Create default files
    fs.createFile(srcFolder.id, 'index.js', `// Welcome to Online Code Editor
console.log('Hello, World!');

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));`);
    
    fs.createFile(srcFolder.id, 'styles.css', `/* Global Styles */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}`);
    
    fs.createFile(fs.root.id, 'README.md', `# My Project

Welcome to your new project!

## Getting Started

1. Edit files in the file explorer
2. Press Cmd/Ctrl + Enter to run your code
3. View output in the developer console

## Features

- Multiple file support
- Syntax highlighting
- Auto-save functionality
- Developer tools integration`);
    
    return fs;
  }
}