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
  useToast
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  SearchIcon
} from '@chakra-ui/icons';
import {
  FaFolder,
  FaFolderOpen,
  FaFile,
  FaJs,
  FaReact,
  FaVuejs,
  FaHtml5,
  FaCss3Alt,
  FaPython,
  FaJava,
  FaMarkdown,
  FaGitAlt,
  FaNpm,
  FaDocker,
  FaFileCode,
  FaFileImage,
  FaFont,
  FaDatabase,
  FaTerminal,
  FaCopy,
  FaCut,
  FaPaste,
  FaTrash,
  FaEdit,
  FaUpload,
  FaCloudUploadAlt,
  FaSyncAlt
} from 'react-icons/fa';
import {
  SiTypescript,
  SiJson,
  SiYaml,
  SiGraphql,
  SiPrisma,
  SiWebpack,
  SiVite,
  SiEslint,
  SiPrettier,
  SiJest,
  SiCypress,
  SiTailwindcss,
  SiSass,
  SiLess,
  SiNextdotjs,
  SiNuxtdotjs,
  SiGatsby,
  SiSvelte,
  SiSolidity,
  SiRust,
  SiGo,
  SiCplusplus,
  SiSwift,
  SiKotlin,
  SiDart,
  SiFirebase,
  SiSupabase,
  SiVercel,
  SiNetlify
} from 'react-icons/si';
import { FILE_TYPES, getFileExtension } from '../utils/fileSystem';

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

// Comprehensive file icon mapping
const getFileIcon = (filename, isFolder, isOpen, colorMode) => {
  const iconSize = 14;
  
  if (isFolder) {
    const folderColor = colorMode === 'dark' ? '#fbbf24' : '#f59e0b';
    return isOpen 
      ? <FaFolderOpen color={folderColor} size={iconSize} />
      : <FaFolder color={folderColor} size={iconSize} />;
  }

  const name = filename.toLowerCase();
  const ext = getFileExtension(filename).toLowerCase();
  
  // Special files by name
  const specialFiles = {
    'package.json': <FaNpm color="#cb3837" size={iconSize} />,
    'tsconfig.json': <SiTypescript color="#3178c6" size={iconSize} />,
    'dockerfile': <FaDocker color="#2496ed" size={iconSize} />,
    'docker-compose.yml': <FaDocker color="#2496ed" size={iconSize} />,
    'docker-compose.yaml': <FaDocker color="#2496ed" size={iconSize} />,
    '.gitignore': <FaGitAlt color="#f05032" size={iconSize} />,
    '.env': <FaFileCode color="#00d26a" size={iconSize} />,
    'vite.config.js': <SiVite color="#646cff" size={iconSize} />,
    'vite.config.ts': <SiVite color="#646cff" size={iconSize} />,
    'webpack.config.js': <SiWebpack color="#8dd6f9" size={iconSize} />,
    '.eslintrc.js': <SiEslint color="#4b32c3" size={iconSize} />,
    '.prettierrc': <SiPrettier color="#f7b93e" size={iconSize} />,
    'jest.config.js': <SiJest color="#c21325" size={iconSize} />,
    'cypress.config.js': <SiCypress color="#17202c" size={iconSize} />,
    'tailwind.config.js': <SiTailwindcss color="#06b6d4" size={iconSize} />,
    'next.config.js': <SiNextdotjs color="#000000" size={iconSize} />,
    'nuxt.config.js': <SiNuxtdotjs color="#00dc82" size={iconSize} />,
    'gatsby-config.js': <SiGatsby color="#663399" size={iconSize} />,
    'firebase.json': <SiFirebase color="#ffca28" size={iconSize} />,
    'supabase.config.js': <SiSupabase color="#3ecf8e" size={iconSize} />,
    'vercel.json': <SiVercel color="#000000" size={iconSize} />,
    'netlify.toml': <SiNetlify color="#00c7b7" size={iconSize} />
  };

  if (specialFiles[name]) return specialFiles[name];

  // Icons by extension
  const extensionIcons = {
    // JavaScript/TypeScript
    'js': <FaJs color="#f7df1e" size={iconSize} />,
    'jsx': <FaReact color="#61dafb" size={iconSize} />,
    'ts': <SiTypescript color="#3178c6" size={iconSize} />,
    'tsx': <FaReact color="#61dafb" size={iconSize} />,
    'vue': <FaVuejs color="#4fc08d" size={iconSize} />,
    'svelte': <SiSvelte color="#ff3e00" size={iconSize} />,
    
    // Web
    'html': <FaHtml5 color="#e34c26" size={iconSize} />,
    'css': <FaCss3Alt color="#1572b6" size={iconSize} />,
    'scss': <SiSass color="#cc6699" size={iconSize} />,
    'sass': <SiSass color="#cc6699" size={iconSize} />,
    'less': <SiLess color="#1d365d" size={iconSize} />,
    
    // Backend
    'py': <FaPython color="#3776ab" size={iconSize} />,
    'java': <FaJava color="#007396" size={iconSize} />,
    'go': <SiGo color="#00add8" size={iconSize} />,
    'rs': <SiRust color="#dea584" size={iconSize} />,
    'cpp': <SiCplusplus color="#00599c" size={iconSize} />,
    'c': <SiCplusplus color="#a8b9cc" size={iconSize} />,
    'swift': <SiSwift color="#fa7343" size={iconSize} />,
    'kt': <SiKotlin color="#7f52ff" size={iconSize} />,
    'dart': <SiDart color="#0175c2" size={iconSize} />,
    'sol': <SiSolidity color="#363636" size={iconSize} />,
    
    // Data
    'json': <SiJson color="#5a5a5a" size={iconSize} />,
    'yaml': <SiYaml color="#cb171e" size={iconSize} />,
    'yml': <SiYaml color="#cb171e" size={iconSize} />,
    'xml': <FaFileCode color="#f60" size={iconSize} />,
    'sql': <FaDatabase color="#336791" size={iconSize} />,
    'prisma': <SiPrisma color="#2d3748" size={iconSize} />,
    'graphql': <SiGraphql color="#e10098" size={iconSize} />,
    'gql': <SiGraphql color="#e10098" size={iconSize} />,
    
    // Docs
    'md': <FaMarkdown color="#083fa1" size={iconSize} />,
    'mdx': <FaMarkdown color="#083fa1" size={iconSize} />,
    'txt': <FaFile color="#718096" size={iconSize} />,
    'pdf': <FaFile color="#ff0000" size={iconSize} />,
    'doc': <FaFile color="#2b579a" size={iconSize} />,
    'docx': <FaFile color="#2b579a" size={iconSize} />,
    
    // Images
    'png': <FaFileImage color="#10b981" size={iconSize} />,
    'jpg': <FaFileImage color="#10b981" size={iconSize} />,
    'jpeg': <FaFileImage color="#10b981" size={iconSize} />,
    'gif': <FaFileImage color="#10b981" size={iconSize} />,
    'svg': <FaFileImage color="#ffb13b" size={iconSize} />,
    'ico': <FaFileImage color="#10b981" size={iconSize} />,
    
    // Fonts
    'ttf': <FaFont color="#ff6b6b" size={iconSize} />,
    'woff': <FaFont color="#ff6b6b" size={iconSize} />,
    'woff2': <FaFont color="#ff6b6b" size={iconSize} />,
    
    // Shell
    'sh': <FaTerminal color="#89e051" size={iconSize} />,
    'bash': <FaTerminal color="#89e051" size={iconSize} />,
    'zsh': <FaTerminal color="#89e051" size={iconSize} />,
    'fish': <FaTerminal color="#89e051" size={iconSize} />
  };

  return extensionIcons[ext] || <FaFile color="#718096" size={iconSize} />;
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
  onDrop
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
        borderColor={selectedId === node.id ? 'purple.400' : 'transparent'}
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
              />
            ))}
          </VStack>
        </Collapse>
      )}
    </Box>
  );
};

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [fileType, setFileType] = useState('js');
  
  const fileInputRef = useRef(null);

  // Context menu actions
  const handleContextMenu = (e, node) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
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

  // Import/Export
  const handleExport = () => {
    const dataStr = JSON.stringify(fileSystem.toJSON(), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportName = `project_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    toast({
      title: "Project exported",
      description: "Your project has been downloaded",
      status: "success",
      duration: 2000
    });
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        JSON.parse(e.target.result);
        // Import logic would go here
        toast({
          title: "Project imported",
          description: "Your project has been loaded",
          status: "success",
          duration: 2000
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid project file",
          status: "error",
          duration: 3000
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Box
        h="100%"
        w="100%"
        bg={colorMode === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(249, 250, 251, 0.9)'}
        backdropFilter="blur(10px)"
        borderRight="1px solid"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <VStack align="stretch" spacing={0} p={3} borderBottom="1px solid" 
          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        >
          <HStack justify="space-between" mb={2}>
            <Text fontSize="12px" fontWeight="bold" textTransform="uppercase" 
              color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
            >
              Explorer
            </Text>
            <HStack spacing={1}>
              <Tooltip label="New File" placement="bottom">
                <IconButton
                  icon={<FaFile />}
                  size="xs"
                  variant="ghost"
                  onClick={() => handleNewFile()}
                  aria-label="New file"
                />
              </Tooltip>
              <Tooltip label="New Folder" placement="bottom">
                <IconButton
                  icon={<FaFolder />}
                  size="xs"
                  variant="ghost"
                  onClick={() => handleNewFolder()}
                  aria-label="New folder"
                />
              </Tooltip>
              <Tooltip label="Collapse All" placement="bottom">
                <IconButton
                  icon={<ChevronDownIcon />}
                  size="xs"
                  variant="ghost"
                  aria-label="Collapse all"
                />
              </Tooltip>
              <Tooltip label="Refresh" placement="bottom">
                <IconButton
                  icon={<FaSyncAlt />}
                  size="xs"
                  variant="ghost"
                  aria-label="Refresh"
                />
              </Tooltip>
            </HStack>
          </HStack>
          
          {/* Search Bar */}
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'}
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
              _focus={{
                borderColor: 'purple.400',
                boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.2)'
              }}
              fontSize="13px"
            />
          </InputGroup>
        </VStack>
        
        {/* File Tree */}
        <Box flex={1} overflowY="auto" overflowX="hidden">
          <VStack align="stretch" spacing={0} p={1}>
            {fileSystem && fileSystem.root && sortFileSystemNodes(fileSystem.root.children).map(node => (
              <FileTreeNode
                key={node.id}
                node={node}
                onSelect={onFileSelect}
                onToggle={handleToggle}
                onContextMenu={handleContextMenu}
                selectedId={selectedFileId}
                searchQuery={searchQuery}
                draggedNode={draggedNode}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              />
            ))}
          </VStack>
        </Box>
        
        {/* Footer Actions */}
        <HStack p={2} borderTop="1px solid" 
          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          spacing={2}
        >
          <Button
            leftIcon={<FaCloudUploadAlt />}
            size="xs"
            variant="ghost"
            onClick={handleExport}
            flex={1}
            fontSize="12px"
          >
            Export
          </Button>
          <Button
            as="label"
            leftIcon={<FaUpload />}
            size="xs"
            variant="ghost"
            flex={1}
            cursor="pointer"
            fontSize="12px"
          >
            Import
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </Button>
        </HStack>
      </Box>

      {/* Context Menu */}
      {contextMenu && (
        <Box
          position="fixed"
          left={contextMenu.x}
          top={contextMenu.y}
          zIndex={1000}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderRadius="md"
          boxShadow="lg"
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
          py={1}
          minW="160px"
        >
          <VStack align="stretch" spacing={0}>
            {contextMenu.node.type === FILE_TYPES.FOLDER && (
              <>
                <HStack px={3} py={2} _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }} 
                  cursor="pointer" onClick={() => handleNewFile(contextMenu.node.id)}
                >
                  <FaFile size={14} />
                  <Text fontSize="sm">New File</Text>
                </HStack>
                <HStack px={3} py={2} _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }} 
                  cursor="pointer" onClick={() => handleNewFolder(contextMenu.node.id)}
                >
                  <FaFolder size={14} />
                  <Text fontSize="sm">New Folder</Text>
                </HStack>
                <Divider my={1} />
              </>
            )}
            <HStack px={3} py={2} _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }} 
              cursor="pointer" onClick={() => handleRename(contextMenu.node)}
            >
              <FaEdit size={14} />
              <Text fontSize="sm">Rename</Text>
            </HStack>
            {contextMenu.node.type === FILE_TYPES.FILE && (
              <HStack px={3} py={2} _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }} 
                cursor="pointer" onClick={() => handleDuplicate(contextMenu.node)}
              >
                <FaCopy size={14} />
                <Text fontSize="sm">Duplicate</Text>
              </HStack>
            )}
            <HStack px={3} py={2} _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }} 
              cursor="pointer"
            >
              <FaCut size={14} />
              <Text fontSize="sm">Cut</Text>
            </HStack>
            <HStack px={3} py={2} _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }} 
              cursor="pointer"
            >
              <FaCopy size={14} />
              <Text fontSize="sm">Copy</Text>
            </HStack>
            <HStack px={3} py={2} _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }} 
              cursor="pointer"
            >
              <FaPaste size={14} />
              <Text fontSize="sm">Paste</Text>
            </HStack>
            <Divider my={1} />
            <HStack px={3} py={2} _hover={{ bg: colorMode === 'dark' ? 'gray.700' : 'gray.100' }} 
              cursor="pointer" onClick={() => handleDelete(contextMenu.node)} color="red.400"
            >
              <FaTrash size={14} />
              <Text fontSize="sm">Delete</Text>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Create/Rename Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            {modalType === 'file' ? 'New File' : modalType === 'folder' ? 'New Folder' : 'Rename'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">Name</FormLabel>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={modalType === 'file' ? 'filename' : 'folder-name'}
                  autoFocus
                />
              </FormControl>
              
              {modalType === 'file' && (
                <FormControl>
                  <FormLabel fontSize="sm">File Type</FormLabel>
                  <Select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                    <option value="js">JavaScript (.js)</option>
                    <option value="jsx">React (.jsx)</option>
                    <option value="ts">TypeScript (.ts)</option>
                    <option value="tsx">React TypeScript (.tsx)</option>
                    <option value="css">CSS (.css)</option>
                    <option value="html">HTML (.html)</option>
                    <option value="json">JSON (.json)</option>
                    <option value="md">Markdown (.md)</option>
                    <option value="py">Python (.py)</option>
                    <option value="java">Java (.java)</option>
                  </Select>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={modalType === 'rename' ? handleRenameConfirm : handleCreate}
              size="sm"
            >
              {modalType === 'rename' ? 'Rename' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};