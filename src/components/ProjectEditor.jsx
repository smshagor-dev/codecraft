import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  useColorMode,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { Editor } from '@monaco-editor/react';
import { StackBlitzExplorer } from './StackBlitzExplorer';
import { ModernOutput } from './ModernOutput';
import { FileSystem } from '../utils/fileSystem';
import { storage } from '../utils/storage';
import { useAutoSave } from '../hooks/useAutoSave';

export const ProjectEditor = () => {
  const [fileSystem] = useState(() => {
    try {
      const saved = storage.load('fileSystem');
      if (saved) {
        return FileSystem.fromJSON(saved);
      }
    } catch (error) {
      console.error('Failed to load file system:', error);
    }
    return FileSystem.createDefaultProject();
  });
  
  // Use a version counter to force re-renders when fileSystem changes
  const [, setVersion] = useState(0);
  
  const [openFiles, setOpenFiles] = useState(() => {
    try {
      return fileSystem ? fileSystem.getOpenFiles() : [];
    } catch (error) {
      console.error('Failed to get open files:', error);
      return [];
    }
  });
  
  const [activeFileId, setActiveFileId] = useState(() => {
    const saved = storage.load('activeFileId');
    return saved || (openFiles.length > 0 ? openFiles[0].id : null);
  });
  
  const [editorSettings] = useState(() => {
    return storage.loadSettings();
  });

  const { colorMode } = useColorMode();
  const toast = useToast();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Define handlers first
  const handleFileSystemChange = useCallback(() => {
    // Increment version to force re-render
    setVersion(v => v + 1);
    
    if (fileSystem && typeof fileSystem.getOpenFiles === 'function') {
      setOpenFiles(fileSystem.getOpenFiles());
    }
  }, [fileSystem]);

  const handleFileSelect = useCallback((fileId) => {
    if (!fileSystem || !fileSystem.root) {
      console.error('FileSystem not initialized');
      return;
    }
    
    const file = fileSystem.root.findNode(fileId);
    if (!file || file.type !== 'file') return;

    // Expand all parent folders
    let currentNode = file.parent;
    while (currentNode && currentNode.id !== fileSystem.root.id) {
      if (currentNode.type === 'folder' && !currentNode.isOpen) {
        currentNode.isOpen = true;
      }
      currentNode = currentNode.parent;
    }
    
    // Trigger re-render to show expanded folders
    handleFileSystemChange();

    // Open file if not already open
    setOpenFiles(prev => {
      const alreadyOpen = prev.find(f => f.id === fileId);
      if (!alreadyOpen) {
        // Check if openFile method exists
        if (typeof fileSystem.openFile === 'function') {
          fileSystem.openFile(fileId);
        }
        return [...prev, file];
      }
      return prev;
    });
    
    setActiveFileId(fileId);
  }, [fileSystem, handleFileSystemChange]);

  const handleFileContentChange = useCallback((fileId, content) => {
    fileSystem.updateFileContent(fileId, content);
    handleFileSystemChange();
  }, [fileSystem, handleFileSystemChange]);

  // Listen for template events from App.jsx
  useEffect(() => {
    const handleLoadTemplate = (event) => {
      const { template } = event.detail;
      if (template && fileSystem) {
        // Clear existing files and opened files
        fileSystem.root.children = [];
        fileSystem.openFiles.clear(); // Clear the internal open files map
        setOpenFiles([]);
        setActiveFileId(null);
        
        let firstFileId = null;
        
        // Recursive function to create files and folders
        const createStructure = (items, parentId) => {
          items.forEach((item) => {
            if (item.type === 'folder') {
              // Create folder
              const folder = fileSystem.createFolder(parentId, item.name);
              if (folder && item.children) {
                // Recursively create children
                createStructure(item.children, folder.id);
              }
            } else {
              // Create file
              const newFile = fileSystem.createFile(parentId, item.name, item.content || '');
              if (newFile && !firstFileId) {
                // Set the first file to open (skip README.md)
                if (!item.name.toLowerCase().includes('readme')) {
                  firstFileId = newFile.id;
                  fileSystem.openFile(newFile.id);
                }
              }
            }
          });
        };
        
        // Create the structure
        createStructure(template.structure, fileSystem.root.id);
        
        // Update state to reflect changes
        handleFileSystemChange();
        
        // Update file system JSON for auto-save
        if (fileSystem && typeof fileSystem.toJSON === 'function') {
          setFileSystemJSON(fileSystem.toJSON());
        }
        
        // Select and open the first file
        if (firstFileId) {
          setTimeout(() => {
            handleFileSelect(firstFileId);
          }, 100);
        }
      }
    };

    const handleLoadSnippet = (event) => {
      const { code } = event.detail;
      if (editorRef.current && code) {
        editorRef.current.setValue(code);
        
        // Update the active file content if there's one open
        if (activeFileId && fileSystem) {
          handleFileContentChange(activeFileId, code);
        }
      }
    };

    window.addEventListener('loadTemplate', handleLoadTemplate);
    window.addEventListener('loadCodeSnippet', handleLoadSnippet);
    return () => {
      window.removeEventListener('loadTemplate', handleLoadTemplate);
      window.removeEventListener('loadCodeSnippet', handleLoadSnippet);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId, fileSystem, handleFileSelect, handleFileSystemChange]);

  // Create file system JSON for auto-save
  const [fileSystemJSON, setFileSystemJSON] = useState(null);
  
  useEffect(() => {
    if (fileSystem && typeof fileSystem.toJSON === 'function') {
      setFileSystemJSON(fileSystem.toJSON());
    }
  }, [fileSystem]);

  // Auto-save file system
  const { isSaving } = useAutoSave(fileSystemJSON, 'fileSystem', 1000);

  // Auto-save active file
  useAutoSave(activeFileId, 'activeFileId', 500);

  // Auto-save editor settings
  useAutoSave(editorSettings, 'editorSettings', 1000);

  const handleCloseFile = (fileId, e) => {
    e?.stopPropagation();
    
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    fileSystem.closeFile(fileId);
    
    if (activeFileId === fileId) {
      setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[0].id : null);
    }
  };


  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.focus();

    // Add keyboard shortcuts
    editor.addAction({
      id: "run-code",
      label: "Run Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        document.getElementById("run-button")?.click();
      }
    });

    // Save file shortcut
    editor.addAction({
      id: "save-file",
      label: "Save File",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        toast({
          title: "Auto-save enabled",
          description: "Your files are automatically saved",
          status: "info",
          duration: 2000,
          isClosable: true
        });
      }
    });
  };

  const activeFile = activeFileId && fileSystem && fileSystem.root ? fileSystem.root.findNode(activeFileId) : null;

  const editorOptions = {
    minimap: { enabled: editorSettings.minimap },
    fontSize: editorSettings.fontSize,
    wordWrap: editorSettings.wordWrap,
    lineNumbers: "on",
    rulers: [80, 120],
    scrollBeyondLastLine: false,
    renderLineHighlight: "all",
    automaticLayout: true,
    suggestOnTriggerCharacters: true,
    formatOnPaste: true,
    formatOnType: true,
    padding: { top: 10, bottom: 10 },
    smoothScrolling: true,
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: true,
    bracketPairColorization: {
      enabled: true
    },
    folding: true,
    foldingStrategy: "indentation",
    showFoldingControls: "always",
    renderWhitespace: "selection",
    guides: {
      bracketPairs: true,
      indentation: true
    }
  };

  return (
    <HStack h="100%" spacing={0} align="stretch" overflow="hidden">
      {/* File Explorer */}
      <Box w="260px" h="100%">
        {fileSystem && (
          <StackBlitzExplorer
            fileSystem={fileSystem}
            onFileSelect={handleFileSelect}
            onFileSystemChange={handleFileSystemChange}
            selectedFileId={activeFileId}
          />
        )}
      </Box>

      {/* Code Editor */}
      <Box flex={1} h="100%">
        {openFiles.length > 0 ? (
          <Tabs
            index={openFiles.findIndex(f => f.id === activeFileId)}
            onChange={(index) => setActiveFileId(openFiles[index]?.id)}
            h="100%"
            display="flex"
            flexDirection="column"
          >
            <TabList>
              {openFiles.map(file => (
                <Tab key={file.id} pr={1}>
                  <HStack spacing={1}>
                    <Text fontSize="sm">{file.name}</Text>
                    {openFiles.length > 1 && (
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => handleCloseFile(file.id, e)}
                        aria-label="Close file"
                      />
                    )}
                  </HStack>
                </Tab>
              ))}
            </TabList>

            <TabPanels flex={1}>
              {openFiles.map(file => (
                <TabPanel key={file.id} p={0} h="100%">
                  <Editor
                    language={file.language || 'javascript'}
                    theme={`vs-${colorMode}`}
                    value={file.content || ''}
                    onChange={(value) => handleFileContentChange(file.id, value)}
                    onMount={handleEditorMount}
                    options={editorOptions}
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        ) : (
          <Box
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
          >
            <VStack spacing={4}>
              <Text fontSize="lg" color="gray.500">
                No files open
              </Text>
              <Text fontSize="sm" color="gray.400">
                Select a file from the explorer or create a new one
              </Text>
            </VStack>
          </Box>
        )}
      </Box>

      {/* Output Panel */}
      <Box w="40%" h="100%" overflow="hidden">
        <ModernOutput 
          editorRef={editorRef} 
          language={activeFile?.language || 'javascript'}
          fileSystem={fileSystem}
        />
      </Box>
      
      {/* Save indicator */}
      {isSaving && (
        <Box position="fixed" bottom={4} right={4}>
          <Text fontSize="xs" color="gray.500">
            Saving...
          </Text>
        </Box>
      )}
    </HStack>
  );
};