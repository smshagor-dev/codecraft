import { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorMode,
  Tooltip,
  Button,
  Divider,
  Collapse,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  SearchIcon,
  ChevronDownIcon as DropdownIcon
} from '@chakra-ui/icons';
import {
  FaFolder,
  FaFolderOpen,
  FaFile,
  FaCopy,
  FaCut,
  FaPaste,
  FaTrash,
  FaEdit,
  FaUpload,
  FaDownload,
  FaSyncAlt,
  FaFileExport,
  FaArrowRight,
  FaClone
} from 'react-icons/fa';
import { FILE_TYPES, getFileExtension, formatFileSize } from '../utils/fileSystem';

// Helper function to sort files and folders
const sortFileSystemNodes = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) return [];

  return [...nodes].sort((a, b) => {
    // Folders always come first
    if (a.type === FILE_TYPES.FOLDER && b.type !== FILE_TYPES.FOLDER) return -1;
    if (a.type !== FILE_TYPES.FOLDER && b.type === FILE_TYPES.FOLDER) return 1;

    // Within the same type, sort alphabetically (case-insensitive)
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
};

// Simple file icon mapping - removed all specific icons
const getFileIcon = (filename, isFolder, isOpen, colorMode) => {
  const iconSize = 14;

  if (isFolder) {
    const folderColor = colorMode === 'dark' ? '#fbbf24' : '#f59e0b';
    return isOpen
      ? <FaFolderOpen color={folderColor} size={iconSize} />
      : <FaFolder color={folderColor} size={iconSize} />;
  }

  // For files, use a simple file icon with color based on extension
  const ext = getFileExtension(filename).toLowerCase();
  const fileColors = {
    'js': '#f7df1e', 'jsx': '#61dafb', 'ts': '#3178c6', 'tsx': '#61dafb',
    'vue': '#4fc08d', 'svelte': '#ff3e00', 'html': '#e34c26', 'css': '#1572b6',
    'scss': '#cc6699', 'sass': '#cc6699', 'less': '#1d365d', 'py': '#3776ab',
    'java': '#007396', 'go': '#00add8', 'rs': '#dea584', 'cpp': '#00599c',
    'c': '#a8b9cc', 'php': '#777bb4', 'rb': '#cc0000', 'swift': '#fa7343',
    'kt': '#7f52ff', 'dart': '#0175c2', 'json': '#5a5a5a', 'yaml': '#cb171e',
    'yml': '#cb171e', 'xml': '#f60', 'sql': '#336791', 'md': '#083fa1',
    'txt': '#718096', 'pdf': '#ff0000'
  };

  const fileColor = fileColors[ext] || '#718096';
  return <FaFile color={fileColor} size={iconSize} />;
};

// File Tree Node Component
const FileTreeNode = ({
  node,
  level = 0,
  onSelect,
  onToggle,
  onContextMenu,
  selectedId,
  searchQuery,
  draggedNode,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  copiedNode,
  cutNode
}) => {
  const { colorMode } = useColorMode();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const isVisible = !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase());

  if (!isVisible && node.type === FILE_TYPES.FILE) return null;

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(node);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (node.type === FILE_TYPES.FOLDER && draggedNode && draggedNode.id !== node.id) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (node.type === FILE_TYPES.FOLDER && draggedNode && draggedNode.id !== node.id) {
      onDrop(draggedNode, node);
    }
  };

  const isCopied = copiedNode && copiedNode.id === node.id;
  const isCut = cutNode && cutNode.id === node.id;

  return (
    <Box>
      <HStack
        spacing={1}
        py={0.5}
        px={2}
        ml={`${level * 16}px`}
        bg={selectedId === node.id
          ? (colorMode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)')
          : isDragOver
            ? (colorMode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)')
            : isHovered
              ? (colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')
              : 'transparent'
        }
        borderLeft={selectedId === node.id ? '2px solid' : '2px solid transparent'}
        borderColor={isCopied ? 'blue.400' : selectedId === node.id ? 'purple.400' : 'transparent'}
        cursor="pointer"
        onClick={() => {
          if (node.type === FILE_TYPES.FOLDER) {
            onToggle(node.id);
          } else {
            onSelect(node.id);
          }
        }}
        onContextMenu={(e) => onContextMenu(e, node)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        transition="all 0.1s"
        position="relative"
        opacity={isCut ? 0.6 : 1}
        border={isCopied ? '1px dashed' : 'none'}
      >
        {node.type === FILE_TYPES.FOLDER && (
          <Box
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              icon={node.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
              size="xs"
              variant="ghost"
              onClick={() => onToggle(node.id)}
              aria-label="Toggle folder"
              minW="16px"
              h="16px"
            />
          </Box>
        )}

        {node.type === FILE_TYPES.FILE && (
          <Box ml="16px" />
        )}

        <Box>
          {getFileIcon(node.name, node.type === FILE_TYPES.FOLDER, node.isOpen, colorMode)}
        </Box>

        <Text
          fontSize="13px"
          flex={1}
          color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}
          fontFamily="'SF Mono', Monaco, monospace"
          noOfLines={1}
        >
          {node.name}
          {isCut && " (moving)"}
          {isCopied && " (copied)"}
        </Text>

        {node.type === FILE_TYPES.FOLDER && node.children && (
          <Badge
            size="xs"
            variant="subtle"
            colorScheme="purple"
            fontSize="10px"
            ml={1}
          >
            {node.children.length}
          </Badge>
        )}

        {node.size > 0 && (
          <Text fontSize="10px" color="gray.500" ml={1}>
            {formatFileSize(node.size)}
          </Text>
        )}
      </HStack>

      {node.type === FILE_TYPES.FOLDER && node.isOpen && node.children && (
        <Collapse in={node.isOpen} animateOpacity>
          <VStack align="stretch" spacing={0}>
            {sortFileSystemNodes(node.children).map(child => (
              <FileTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                onSelect={onSelect}
                onToggle={onToggle}
                onContextMenu={onContextMenu}
                selectedId={selectedId}
                searchQuery={searchQuery}
                draggedNode={draggedNode}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDrop={onDrop}
                copiedNode={copiedNode}
                cutNode={cutNode}
              />
            ))}
          </VStack>
        </Collapse>
      )}
    </Box>
  );
};

// Enhanced file type options for the modal
const FILE_TYPE_OPTIONS = [
  { value: 'js', label: 'JavaScript (.js)' },
  { value: 'jsx', label: 'React (.jsx)' },
  { value: 'ts', label: 'TypeScript (.ts)' },
  { value: 'tsx', label: 'React TypeScript (.tsx)' },
  { value: 'vue', label: 'Vue (.vue)' },
  { value: 'svelte', label: 'Svelte (.svelte)' },
  { value: 'html', label: 'HTML (.html)' },
  { value: 'css', label: 'CSS (.css)' },
  { value: 'scss', label: 'SCSS (.scss)' },
  { value: 'less', label: 'Less (.less)' },
  { value: 'json', label: 'JSON (.json)' },
  { value: 'yaml', label: 'YAML (.yaml)' },
  { value: 'xml', label: 'XML (.xml)' },
  { value: 'md', label: 'Markdown (.md)' },
  { value: 'txt', label: 'Text (.txt)' },
  { value: 'py', label: 'Python (.py)' },
  { value: 'java', label: 'Java (.java)' },
  { value: 'cpp', label: 'C++ (.cpp)' },
  { value: 'c', label: 'C (.c)' },
  { value: 'php', label: 'PHP (.php)' },
  { value: 'rb', label: 'Ruby (.rb)' },
  { value: 'go', label: 'Go (.go)' },
  { value: 'rs', label: 'Rust (.rs)' },
  { value: 'swift', label: 'Swift (.swift)' },
  { value: 'kt', label: 'Kotlin (.kt)' },
  { value: 'dart', label: 'Dart (.dart)' },
  { value: 'sql', label: 'SQL (.sql)' },
  { value: 'graphql', label: 'GraphQL (.graphql)' },
  { value: 'sh', label: 'Shell Script (.sh)' }
];

// Main StackBlitz Explorer Component
export const StackBlitzExplorer = ({
  fileSystem,
  onFileSelect,
  onFileSystemChange,
  selectedFileId
}) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedNode, setDraggedNode] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [copiedNode, setCopiedNode] = useState(null);
  const [cutNode, setCutNode] = useState(null);

  // Modals
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isExportOpen,
    onOpen: onExportOpen,
    onClose: onExportClose
  } = useDisclosure();
  const {
    isOpen: isMoveOpen,
    onOpen: onMoveOpen,
    onClose: onMoveClose
  } = useDisclosure();

  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [fileType, setFileType] = useState('js');
  const [exportType, setExportType] = useState('individual');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [moveTarget, setMoveTarget] = useState(null);

  const fileInputRef = useRef(null);
  const uploadAllInputRef = useRef(null);
  const cancelRef = useRef();
  const explorerRef = useRef(null);

  // Context menu actions - FIXED VERSION
  const handleContextMenu = (e, node) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent browser context menu

    // Get the explorer container position
    const explorerRect = explorerRef.current?.getBoundingClientRect();

    if (explorerRect) {
      // Calculate position relative to the explorer container
      const x = e.clientX - explorerRect.left;
      const y = e.clientY - explorerRect.top;

      setContextMenu({
        x,
        y,
        node
      });
    } else {
      // Fallback to absolute position
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        node
      });
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      closeContextMenu();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', closeContextMenu);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', closeContextMenu);
    };
  }, []);

  // File operations
  const handleNewFile = (parentId = null) => {
    setModalType('file');
    setModalData({ parentId: parentId || fileSystem.root.id });
    setNewItemName('untitled');
    setFileType('js');
    onOpen();
  };

  const handleNewFolder = (parentId = null) => {
    setModalType('folder');
    setModalData({ parentId: parentId || fileSystem.root.id });
    setNewItemName('new-folder');
    onOpen();
  };

  const handleCreate = () => {
    if (!newItemName.trim()) return;

    try {
      if (modalType === 'file') {
        const fileName = newItemName.includes('.') ? newItemName : `${newItemName}.${fileType}`;
        const file = fileSystem.createFile(modalData.parentId, fileName);
        onFileSelect(file.id);
        toast({
          title: "File created",
          description: `${fileName} has been created`,
          status: "success",
          duration: 2000
        });
      } else {
        fileSystem.createFolder(modalData.parentId, newItemName);
        toast({
          title: "Folder created",
          description: `${newItemName} has been created`,
          status: "success",
          duration: 2000
        });
      }
      onFileSystemChange();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000
      });
    }
  };

  const handleRename = (node) => {
    setModalType('rename');
    setModalData({ node });
    setNewItemName(node.name);
    onOpen();
  };

  const handleRenameConfirm = () => {
    if (!newItemName.trim() || newItemName === modalData.node.name) return;

    try {
      fileSystem.renameNode(modalData.node.id, newItemName);
      onFileSystemChange();
      toast({
        title: "Renamed",
        description: `${modalData.node.name} → ${newItemName}`,
        status: "success",
        duration: 2000
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000
      });
    }
  };

  const handleDelete = (node) => {
    if (confirm(`Delete ${node.name}?`)) {
      try {
        fileSystem.deleteNode(node.id);
        onFileSystemChange();
        toast({
          title: "Deleted",
          description: `${node.name} has been deleted`,
          status: "info",
          duration: 2000
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 3000
        });
      }
    }
  };

  const handleDuplicate = (node) => {
    if (node.type === FILE_TYPES.FILE) {
      const newName = `${node.name.replace(/\.[^/.]+$/, '')}_copy${node.name.match(/\.[^/.]+$/)?.[0] || ''}`;
      const file = fileSystem.createFile(node.parent, newName, node.content);
      onFileSystemChange();
      onFileSelect(file.id);
      toast({
        title: "Duplicated",
        description: `${node.name} → ${newName}`,
        status: "success",
        duration: 2000
      });
    }
  };

  // Copy/Cut/Paste operations
  const handleCopy = (node) => {
    setCopiedNode(node);
    setCutNode(null);
    toast({
      title: "Copied",
      description: `${node.name} has been copied`,
      status: "success",
      duration: 2000
    });
    closeContextMenu();
  };

  const handleCut = (node) => {
    setCutNode(node);
    setCopiedNode(null);
    toast({
      title: "Cut",
      description: `${node.name} has been cut`,
      status: "success",
      duration: 2000
    });
    closeContextMenu();
  };

  const handlePaste = (targetFolder) => {
    if (copiedNode) {
      // Handle copy operation
      if (copiedNode.type === FILE_TYPES.FILE) {
        const newName = `${copiedNode.name.replace(/\.[^/.]+$/, '')}_copy${copiedNode.name.match(/\.[^/.]+$/)?.[0] || ''}`;
        fileSystem.createFile(targetFolder.id, newName, copiedNode.content);
      } else {
        // For folders, we'd need to recursively copy all contents
        // This is a simplified version
        fileSystem.createFolder(targetFolder.id, `${copiedNode.name}_copy`);
      }
      onFileSystemChange();
      toast({
        title: "Pasted",
        description: `${copiedNode.name} has been copied to ${targetFolder.name}`,
        status: "success",
        duration: 2000
      });
    } else if (cutNode) {
      // Handle move operation
      onMoveOpen();
      setMoveTarget(targetFolder);
    }
  };

  const handleMoveConfirm = () => {
    if (cutNode && moveTarget) {
      // In a real implementation, you'd move the node here
      // For now, we'll just show a success message
      toast({
        title: "Moved",
        description: `${cutNode.name} has been moved to ${moveTarget.name}`,
        status: "success",
        duration: 2000
      });
      setCutNode(null);
      setMoveTarget(null);
      onMoveClose();
      onFileSystemChange();
    }
  };

  // Enhanced file upload functionality
  const handleFileUpload = (event, parentId = null) => {
    const files = event.target.files;
    if (!files.length) return;

    const targetFolderId = parentId || fileSystem.root.id;
    let uploadedCount = 0;

    Array.from(files).forEach(file => {
      try {
        // For text-based files, read content
        if (file.type.startsWith('text/') ||
          ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.py', '.java', '.cpp', '.c', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.sql', '.sh'].some(ext =>
            file.name.toLowerCase().endsWith(ext))) {

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              fileSystem.createFile(targetFolderId, file.name, e.target.result);
              uploadedCount++;
              if (uploadedCount === files.length) {
                onFileSystemChange();
                toast({
                  title: "Files uploaded",
                  description: `${uploadedCount} file(s) uploaded successfully`,
                  status: "success",
                  duration: 2000
                });
              }
            } catch (error) {
              console.error(`Error uploading ${file.name}:`, error);
            }
          };
          reader.readAsText(file);
        } else {
          // For binary files, create empty file with proper extension
          fileSystem.createFile(targetFolderId, file.name, '');
          uploadedCount++;
          if (uploadedCount === files.length) {
            onFileSystemChange();
            toast({
              title: "Files uploaded",
              description: `${uploadedCount} file(s) uploaded successfully`,
              status: "success",
              duration: 2000
            });
          }
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        toast({
          title: "Upload error",
          description: `Failed to upload ${file.name}`,
          status: "error",
          duration: 3000
        });
      }
    });

    // Reset input
    event.target.value = '';
  };

  // Upload all file types
  const handleUploadAllFiles = () => {
    uploadAllInputRef.current?.click();
  };

  // Export functionality
  const handleExport = () => {
    onExportOpen();
  };

  // New function to handle ZIP export
  const handleExportAsZip = async () => {
    try {
      // Dynamically import jszip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Function to add files recursively to zip
      const addFilesToZip = (node, path = '') => {
        if (node.type === FILE_TYPES.FILE) {
          zip.file(path + node.name, node.content);
        } else if (node.type === FILE_TYPES.FOLDER && node.children) {
          const folderPath = path + node.name + '/';
          node.children.forEach(child => addFilesToZip(child, folderPath));
        }
      };
      
      // Add all files starting from root
      addFilesToZip(fileSystem.root);
      
      // Generate zip file
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "ZIP exported",
        description: "Project has been downloaded as ZIP file",
        status: "success",
        duration: 2000
      });
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast({
        title: "Export failed",
        description: "Failed to create ZIP file",
        status: "error",
        duration: 3000
      });
    }
  };

  const handleExportConfirm = () => {
    if (exportType === 'individual') {
      // Export individual selected files
      const filesToExport = fileSystem.getAllFiles().filter(file => 
        selectedFiles.includes(file.id)
      );
      
      filesToExport.forEach(file => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      });
      
      toast({
        title: "Files exported",
        description: `${filesToExport.length} file(s) have been downloaded`,
        status: "success",
        duration: 2000
      });
    } else if (exportType === 'full-project') {
      // Export all files as individual files
      const allFiles = fileSystem.getAllFiles();
      allFiles.forEach(file => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      });
      
      toast({
        title: "Project exported",
        description: `${allFiles.length} file(s) have been downloaded`,
        status: "success",
        duration: 2000
      });
    } else if (exportType === 'zip') {
      // Export as ZIP file
      handleExportAsZip();
    }
    onExportClose();
  };

  // Refresh functionality
  const handleRefresh = () => {
    onFileSystemChange();
    toast({
      title: "Refreshed",
      description: "File explorer has been refreshed",
      status: "info",
      duration: 1000
    });
  };

  // Drag and Drop
  const handleDragStart = (node) => {
    setDraggedNode(node);
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
  };

  const handleDrop = (draggedNode, targetFolder) => {
    // Move logic would go here
    console.log(`Moving ${draggedNode.name} to ${targetFolder.name}`);
    setDraggedNode(null);
  };

  const handleToggle = (folderId) => {
    fileSystem.toggleFolder(folderId);
    onFileSystemChange();
  };

  return (
    <>
      <Box
        ref={explorerRef}
        h="100%"
        w="100%"
        bg={colorMode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(249, 250, 251, 0.9)'}
        backdropFilter="blur(10px)"
        borderRight="1px solid"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        display="flex"
        flexDirection="column"
        position="relative" // Important for context menu positioning
      >

        {/* Header */}
        <VStack align="stretch" spacing={0} p={3} borderBottom="1px solid"
          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}>
          <HStack justify="space-between" mb={2}>
            <Menu placement="bottom-start" strategy="fixed">
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                fontWeight="bold"
                color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}
                rightIcon={<DropdownIcon />}
                px={2}
                _hover={{ bg: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
                _expanded={{ bg: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
              >
                EXPLORER
              </MenuButton>
              <MenuList
                zIndex={9999}
                minW="200px"
                fontSize="sm"
              >
                <MenuItem
                  icon={<FaFile size={12} />}
                  onClick={() => handleNewFile()}
                  command="⌘N"
                >
                  New File
                </MenuItem>
                <MenuItem
                  icon={<FaFolder size={12} />}
                  onClick={() => handleNewFolder()}
                  command="⌘⇧N"
                >
                  New Folder
                </MenuItem>
                <MenuItem
                  icon={<FaUpload size={12} />}
                  onClick={() => fileInputRef.current?.click()}
                  command="⌘U"
                >
                  Upload Files
                </MenuItem>
                <MenuItem
                  icon={<FaDownload size={12} />}
                  onClick={handleExport}
                  command="⌘E"
                >
                  Export Project
                </MenuItem>
                <Divider my={1} />
                <MenuItem
                  icon={<FaSyncAlt size={12} />}
                  onClick={handleRefresh}
                  command="⌘R"
                >
                  Refresh
                </MenuItem>
              </MenuList>
            </Menu>

            <HStack spacing={1}>
              <Tooltip label="New File" placement="top">
                <IconButton
                  icon={<FaFile size={12} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => handleNewFile()}
                  aria-label="New File"
                />
              </Tooltip>
              <Tooltip label="New Folder" placement="top">
                <IconButton
                  icon={<FaFolder size={12} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => handleNewFolder()}
                  aria-label="New Folder"
                />
              </Tooltip>
              <Tooltip label="Upload Files" placement="top">
                <IconButton
                  icon={<FaUpload size={12} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload Files"
                />
              </Tooltip>
              <Tooltip label="Refresh" placement="top">
                <IconButton
                  icon={<FaSyncAlt size={12} />}
                  size="xs"
                  variant="ghost"
                  onClick={handleRefresh}
                  aria-label="Refresh"
                />
              </Tooltip>
            </HStack>
          </HStack>

          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
              border="none"
              fontSize="13px"
              _focus={{
                bg: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            />
          </InputGroup>
        </VStack>

        {/* File Tree */}
        <Box flex={1} overflow="auto" p={2}>
          <FileTreeNode
            node={fileSystem.root}
            onSelect={onFileSelect}
            onToggle={handleToggle}
            onContextMenu={handleContextMenu}
            selectedId={selectedFileId}
            searchQuery={searchQuery}
            draggedNode={draggedNode}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={() => { }}
            onDrop={handleDrop}
            copiedNode={copiedNode}
            cutNode={cutNode}
          />
        </Box>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e)}
          multiple
          accept=".js,.jsx,.ts,.tsx,.html,.css,.scss,.less,.json,.yaml,.yml,.xml,.md,.txt,.py,.java,.cpp,.c,.h,.hpp,.php,.rb,.go,.rs,.swift,.kt,.dart,.sql,.sh,.graphql,.gql,.prisma,.sol,.lua,.hs,.elm,.clj,.cljs,.erl,.ex,.exs,.r,.m,.pl,.pm,.scala,.vue,.svelte"
        />

        <input
          type="file"
          ref={uploadAllInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e)}
          multiple
        />

        {/* Context Menu - FIXED POSITIONING */}
        {contextMenu && (
          <Box
            position="absolute"
            top={`${contextMenu.y}px`}
            left={`${contextMenu.x}px`}
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            border="1px solid"
            borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
            borderRadius="md"
            boxShadow="lg"
            zIndex={1000}
            minW="160px"
            py={1}
            onContextMenu={(e) => e.preventDefault()} // Prevent browser context menu on our context menu
          >
            <VStack align="stretch" spacing={0}>
              {contextMenu.node.type === FILE_TYPES.FOLDER && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaFile size={12} />}
                    onClick={() => {
                      handleNewFile(contextMenu.node.id);
                      closeContextMenu();
                    }}
                  >
                    New File
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaFolder size={12} />}
                    onClick={() => {
                      handleNewFolder(contextMenu.node.id);
                      closeContextMenu();
                    }}
                  >
                    New Folder
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaUpload size={12} />}
                    onClick={() => {
                      fileInputRef.current?.click();
                      closeContextMenu();
                    }}
                  >
                    Upload Files
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaPaste size={12} />}
                    onClick={() => {
                      handlePaste(contextMenu.node);
                      closeContextMenu();
                    }}
                    isDisabled={!copiedNode && !cutNode}
                  >
                    Paste
                  </Button>
                  <Divider my={1} />
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
                leftIcon={<FaClone size={12} />}
                onClick={() => {
                  handleDuplicate(contextMenu.node);
                  closeContextMenu();
                }}
                isDisabled={contextMenu.node.type === FILE_TYPES.FOLDER}
              >
                Duplicate
              </Button>

              <Button
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
                leftIcon={<FaCopy size={12} />}
                onClick={() => handleCopy(contextMenu.node)}
              >
                Copy
              </Button>

              <Button
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
                leftIcon={<FaCut size={12} />}
                onClick={() => handleCut(contextMenu.node)}
              >
                Cut
              </Button>

              <Button
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
                leftIcon={<FaEdit size={12} />}
                onClick={() => {
                  handleRename(contextMenu.node);
                  closeContextMenu();
                }}
              >
                Rename
              </Button>

              <Divider my={1} />

              <Button
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
                leftIcon={<FaDownload size={12} />}
                onClick={() => {
                  // Download individual file
                  if (contextMenu.node.type === FILE_TYPES.FILE) {
                    const blob = new Blob([contextMenu.node.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = contextMenu.node.name;
                    link.click();
                    URL.revokeObjectURL(url);
                    toast({
                      title: "File downloaded",
                      description: `${contextMenu.node.name} has been downloaded`,
                      status: "success",
                      duration: 2000
                    });
                  }
                  closeContextMenu();
                }}
                isDisabled={contextMenu.node.type === FILE_TYPES.FOLDER}
              >
                Download
              </Button>

              <Divider my={1} />

              <Button
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
                leftIcon={<FaTrash size={12} />}
                color="red.500"
                onClick={() => {
                  handleDelete(contextMenu.node);
                  closeContextMenu();
                }}
              >
                Delete
              </Button>
            </VStack>
          </Box>
        )}

        {/* Modal for creating/renaming files/folders */}
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {modalType === 'file' && 'Create New File'}
              {modalType === 'folder' && 'Create New Folder'}
              {modalType === 'rename' && 'Rename'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>
                    {modalType === 'file' && 'File Name'}
                    {modalType === 'folder' && 'Folder Name'}
                    {modalType === 'rename' && 'New Name'}
                  </FormLabel>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        modalType === 'rename' ? handleRenameConfirm() : handleCreate();
                      }
                    }}
                    autoFocus
                  />
                </FormControl>

                {modalType === 'file' && (
                  <FormControl>
                    <FormLabel>File Type</FormLabel>
                    <Select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                    >
                      {FILE_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={modalType === 'rename' ? handleRenameConfirm : handleCreate}
                isDisabled={!newItemName.trim()}
              >
                {modalType === 'rename' ? 'Rename' : 'Create'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Export Modal */}
        <Modal isOpen={isExportOpen} onClose={onExportClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Export Project</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Export Type</FormLabel>
                  <Select
                    value={exportType}
                    onChange={(e) => {
                      setExportType(e.target.value);
                      if (e.target.value === 'individual') {
                        // Select all files by default for individual export
                        setSelectedFiles(fileSystem.getAllFiles().map(file => file.id));
                      }
                    }}
                  >
                    <option value="individual">Individual Files (Selected)</option>
                    <option value="full-project">Full Project (All Files)</option>
                    <option value="zip">ZIP File (Full Code)</option>
                  </Select>
                </FormControl>
                
                {exportType === 'individual' && (
                  <FormControl>
                    <FormLabel>Select Files to Export</FormLabel>
                    <Box 
                      maxH="200px" 
                      overflowY="auto" 
                      border="1px solid" 
                      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'} 
                      borderRadius="md" 
                      p={2}
                      bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                    >
                      {fileSystem.getAllFiles().map(file => (
                        <HStack key={file.id} spacing={2} py={1}>
                          <Checkbox
                            isChecked={selectedFiles.includes(file.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFiles([...selectedFiles, file.id]);
                              } else {
                                setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                              }
                            }}
                          />
                          <Box>
                            {getFileIcon(file.name, false, false, colorMode)}
                          </Box>
                          <Text fontSize="sm" flex={1}>{file.name}</Text>
                          <Text fontSize="xs" color="gray.500">{formatFileSize(file.size)}</Text>
                        </HStack>
                      ))}
                    </Box>
                    <HStack justify="space-between" mt={2}>
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => {
                          if (selectedFiles.length === fileSystem.getAllFiles().length) {
                            setSelectedFiles([]);
                          } else {
                            setSelectedFiles(fileSystem.getAllFiles().map(file => file.id));
                          }
                        }}
                      >
                        {selectedFiles.length === fileSystem.getAllFiles().length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <Text fontSize="sm" color="gray.500">
                        {selectedFiles.length} file(s) selected
                      </Text>
                    </HStack>
                  </FormControl>
                )}
                
                <Box 
                  p={3} 
                  borderRadius="md" 
                  bg={colorMode === 'dark' ? 'blue.900' : 'blue.50'}
                  border="1px solid"
                  borderColor={colorMode === 'dark' ? 'blue.700' : 'blue.200'}
                >
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Export Information:
                  </Text>
                  {exportType === 'individual' && (
                    <Text fontSize="sm" color={colorMode === 'dark' ? 'blue.200' : 'blue.700'}>
                      Download selected files as individual files. Each file will be downloaded separately.
                    </Text>
                  )}
                  {exportType === 'full-project' && (
                    <Text fontSize="sm" color={colorMode === 'dark' ? 'blue.200' : 'blue.700'}>
                      Download all project files as individual files. Perfect for quick access to all files.
                    </Text>
                  )}
                  {exportType === 'zip' && (
                    <Text fontSize="sm" color={colorMode === 'dark' ? 'blue.200' : 'blue.700'}>
                      Download entire project as a ZIP file. Contains all files and folder structure. Best for sharing or backup.
                    </Text>
                  )}
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onExportClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleExportConfirm}
                isDisabled={exportType === 'individual' && selectedFiles.length === 0}
                leftIcon={<FaDownload />}
              >
                {exportType === 'zip' ? 'Download ZIP' : 'Export Files'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Move Confirmation Dialog */}
        <AlertDialog
          isOpen={isMoveOpen}
          leastDestructiveRef={cancelRef}
          onClose={onMoveClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Move Item
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to move "{cutNode?.name}" to "{moveTarget?.name}"?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onMoveClose}>
                  Cancel
                </Button>
                <Button colorScheme="purple" onClick={handleMoveConfirm} ml={3}>
                  Move
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </>
  );
};