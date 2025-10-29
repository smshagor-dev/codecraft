const STORAGE_KEYS = {
  FILES: 'codeEditor_files',
  ACTIVE_FILE: 'codeEditor_activeFile',
  EDITOR_SETTINGS: 'codeEditor_settings',
  WORKSPACE: 'codeEditor_workspace',
  RECENT_FILES: 'codeEditor_recentFiles',
  THEME: 'codeEditor_theme'
};

export const storage = {
  // Save data to localStorage
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },

  // Load data from localStorage
  load: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },

  // Clear all editor related data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      storage.remove(key);
    });
  },

  // Save files
  saveFiles: (files) => {
    return storage.save(STORAGE_KEYS.FILES, files);
  },

  // Load files
  loadFiles: () => {
    return storage.load(STORAGE_KEYS.FILES, []);
  },

  // Save active file ID
  saveActiveFile: (fileId) => {
    return storage.save(STORAGE_KEYS.ACTIVE_FILE, fileId);
  },

  // Load active file ID
  loadActiveFile: () => {
    return storage.load(STORAGE_KEYS.ACTIVE_FILE, null);
  },

  // Save editor settings
  saveSettings: (settings) => {
    return storage.save(STORAGE_KEYS.EDITOR_SETTINGS, settings);
  },

  // Load editor settings
  loadSettings: () => {
    return storage.load(STORAGE_KEYS.EDITOR_SETTINGS, {
      fontSize: 14,
      minimap: true,
      wordWrap: "on",
      autoSave: true,
      autoSaveDelay: 1000
    });
  },

  // Save workspace
  saveWorkspace: (workspace) => {
    const workspaceData = {
      name: workspace.name || 'Untitled Workspace',
      files: workspace.files,
      activeFileId: workspace.activeFileId,
      settings: workspace.settings,
      savedAt: new Date().toISOString()
    };
    return storage.save(STORAGE_KEYS.WORKSPACE, workspaceData);
  },

  // Load workspace
  loadWorkspace: () => {
    return storage.load(STORAGE_KEYS.WORKSPACE, null);
  },

  // Export workspace as JSON
  exportWorkspace: () => {
    const workspace = storage.loadWorkspace();
    if (!workspace) return null;
    
    const dataStr = JSON.stringify(workspace, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `${workspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    return true;
  },

  // Import workspace from JSON
  importWorkspace: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workspace = JSON.parse(e.target.result);
          storage.saveWorkspace(workspace);
          resolve(workspace);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
};

export { STORAGE_KEYS };