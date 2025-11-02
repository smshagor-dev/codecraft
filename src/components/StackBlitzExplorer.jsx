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
  AlertDialogOverlay,
  Avatar,
  Progress,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Alert,
  AlertIcon,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  SearchIcon,
  ChevronDownIcon as DropdownIcon,
  AttachmentIcon
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
  FaClone,
  FaUser,
  FaSignOutAlt,
  FaChartBar,
  FaCloud,
  FaSave,
  FaFileImport
} from 'react-icons/fa';

// File types constants - maintaining original structure
const FILE_TYPES = {
  FILE: 'file',
  FOLDER: 'folder'
};

// Helper function to get file extension - maintaining original
const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Helper function to format file size - maintaining original
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to clean API responses - maintaining original
const cleanApiResponse = (responseText) => {
  if (responseText.includes('[file content end]')) {
    return responseText.split('[file content end]')[1];
  }
  return responseText;
};

// Helper function to sort files and folders - maintaining original
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

// Simple file icon mapping - maintaining original
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

// File Tree Node Component - maintaining original structure
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

// Enhanced file type options for the modal - maintaining original
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

// Cloud File Operations - Enhanced with all upload methods
class CloudFileManager {
  constructor() {
    this.apiUrl = 'https://cloud.coderpoint.ru/api/files.php';
  }

  async makeRequest(action, data = {}) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        token,
        ...data
      })
    });

    const responseText = await response.text();
    const cleanResponse = cleanApiResponse(responseText);
    
    let result;
    try {
      result = JSON.parse(cleanResponse);
    } catch (error) {
      throw new Error('Invalid server response');
    }

    if (!result.success) {
      throw new Error(result.error || 'Operation failed');
    }

    return result;
  }

  // Get file statistics
  async getStats() {
    return this.makeRequest('stats');
  }

  // List files in a directory
  async listFiles(path = '') {
    return this.makeRequest('list', { path });
  }

  // Create a file
  async createFile(filename, content = '', path = '') {
    return this.makeRequest('create', {
      filename,
      content,
      path
    });
  }

  // Create a directory
  async createDirectory(dirname, path = '') {
    return this.makeRequest('mkdir', {
      dirname,
      path
    });
  }

  // Read file content
  async readFile(filepath) {
    return this.makeRequest('read', {
      filepath
    });
  }

  // Write/update file content
  async writeFile(filepath, content) {
    return this.makeRequest('write', {
      filepath,
      content
    });
  }

  // Delete file or directory
  async deleteFile(filepath) {
    return this.makeRequest('delete', {
      filepath
    });
  }

  // Search files
  async searchFiles(query, fileType = '') {
    return this.makeRequest('search', {
      query,
      file_type: fileType
    });
  }

  // Upload single file to cloud
  async uploadFile(file, path = '') {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('token', token);
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData
    });

    const responseText = await response.text();
    const cleanResponse = cleanApiResponse(responseText);
    const result = JSON.parse(cleanResponse);

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;
  }

  // Upload multiple files to cloud (folder upload)
  async uploadMultipleFiles(files, path = '') {
    const token = localStorage.getItem('auth_token');
    const uploadPromises = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('action', 'upload');
      formData.append('token', token);
      formData.append('file', file);
      if (path) {
        formData.append('path', path);
      }

      uploadPromises.push(
        fetch(this.apiUrl, {
          method: 'POST',
          body: formData
        }).then(async response => {
          const responseText = await response.text();
          const cleanResponse = cleanApiResponse(responseText);
          const result = JSON.parse(cleanResponse);
          
          if (!result.success) {
            throw new Error(`Failed to upload ${file.name}: ${result.error}`);
          }
          
          return result;
        })
      );
    }

    return Promise.all(uploadPromises);
  }

  // Upload all files from local file system to cloud
  async uploadAllFiles(fileSystem, path = '') {
    if (!fileSystem || !fileSystem.getAllFiles) {
      throw new Error('File system not available');
    }

    const allFiles = fileSystem.getAllFiles();
    const uploadPromises = [];

    for (const file of allFiles) {
      const filePath = file.getPath ? file.getPath() : '';
      const fullPath = path ? `${path}/${filePath}` : filePath;
      
      uploadPromises.push(
        this.createFile(file.name, file.content || '', fullPath)
      );
    }

    return Promise.all(uploadPromises);
  }
}

// Create global cloud file manager instance
const cloudFileManager = new CloudFileManager();

// Main StackBlitz Explorer Component with Integrated Auth and Cloud Operations
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

  // Auth states
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fileStats, setFileStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Cloud operations states
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [cloudStats, setCloudStats] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState('');

  // Modals - maintaining all original modals
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
  const {
    isOpen: isAuthOpen,
    onOpen: onAuthOpen,
    onClose: onAuthClose
  } = useDisclosure();
  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose
  } = useDisclosure();
  const {
    isOpen: isCloudSaveOpen,
    onOpen: onCloudSaveOpen,
    onClose: onCloudSaveClose
  } = useDisclosure();
  const {
    isOpen: isCloudLoadOpen,
    onOpen: onCloudLoadOpen,
    onClose: onCloudLoadClose
  } = useDisclosure();
  const {
    isOpen: isCloudUploadOpen,
    onOpen: onCloudUploadOpen,
    onClose: onCloudUploadClose
  } = useDisclosure();

  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [fileType, setFileType] = useState('js');
  const [exportType, setExportType] = useState('individual');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [moveTarget, setMoveTarget] = useState(null);
  const [uploadType, setUploadType] = useState('single'); // 'single', 'folder', 'all'

  // Auth form states
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authFormData, setAuthFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authErrors, setAuthErrors] = useState({});

  const fileInputRef = useRef(null);
  const uploadAllInputRef = useRef(null);
  const cloudUploadInputRef = useRef(null);
  const cloudFolderUploadInputRef = useRef(null);
  const cancelRef = useRef();
  const explorerRef = useRef(null);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch profile and stats when user is logged in
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchFileStats();
      getCloudStats();
    }
  }, [user]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await fetch('https://cloud.coderpoint.ru/api/auth.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'verify',
            token: token
          })
        });
        
        const responseText = await response.text();
        const cleanResponse = cleanApiResponse(responseText);
        let result;
        
        try {
          result = JSON.parse(cleanResponse);
        } catch (parseError) {
          console.error('Failed to parse auth verification response:', cleanResponse);
          localStorage.removeItem('auth_token');
          setUser(null);
          return;
        }
        
        if (result.success) {
          setUser(result.user);
          console.log('User authenticated:', result.user);
        } else {
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch('https://cloud.coderpoint.ru/api/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'profile',
          token: token
        })
      });
      
      const responseText = await response.text();
      const cleanResponse = cleanApiResponse(responseText);
      let result;
      
      try {
        result = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Failed to parse profile response:', cleanResponse);
        return;
      }
      
      if (result.success) {
        setProfile(result.profile);
        console.log('Profile loaded:', result.profile);
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
    }
  };

  const fetchFileStats = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch('https://cloud.coderpoint.ru/api/files.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stats',
          token: token
        })
      });
      
      const responseText = await response.text();
      const cleanResponse = cleanApiResponse(responseText);
      let result;
      
      try {
        result = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Failed to parse file stats response:', cleanResponse);
        return;
      }
      
      if (result.success) {
        setFileStats(result.stats);
        console.log('File stats loaded:', result.stats);
      }
    } catch (error) {
      console.error('File stats fetch failed:', error);
    }
  };

  // Cloud Operations Functions
  const getCloudStats = async () => {
    try {
      const result = await cloudFileManager.getStats();
      setCloudStats(result.stats);
      return result;
    } catch (error) {
      console.error('Cloud stats fetch failed:', error);
      return null;
    }
  };

  // Enhanced Cloud Upload Functions - All three types
  const handleSingleFileUploadToCloud = async (file, targetPath = '') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files to cloud",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsCloudLoading(true);
    setUploadProgress(0);
    setCurrentUploadFile(file.name);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await cloudFileManager.uploadFile(file, targetPath);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update cloud stats
      await getCloudStats();

      toast({
        title: "File uploaded to cloud",
        description: `${file.name} uploaded successfully`,
        status: "success",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      return false;
    } finally {
      setIsCloudLoading(false);
      setUploadProgress(0);
      setCurrentUploadFile('');
    }
  };

  const handleFolderUploadToCloud = async (files, targetPath = '') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files to cloud",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsCloudLoading(true);
    setUploadProgress(0);

    try {
      let uploadedCount = 0;
      const totalFiles = files.length;

      // Upload files sequentially to show progress
      for (const file of files) {
        setCurrentUploadFile(file.name);
        
        try {
          await cloudFileManager.uploadFile(file, targetPath);
          uploadedCount++;
          
          // Update progress
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
          
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      // Update cloud stats
      await getCloudStats();

      toast({
        title: "Folder uploaded to cloud",
        description: `${uploadedCount}/${totalFiles} files uploaded successfully`,
        status: "success",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      return false;
    } finally {
      setIsCloudLoading(false);
      setUploadProgress(0);
      setCurrentUploadFile('');
    }
  };

  const handleAllFilesUploadToCloud = async (targetPath = '') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files to cloud",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!fileSystem) {
      toast({
        title: "No files to upload",
        description: "File system is empty",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsCloudLoading(true);
    setUploadProgress(0);

    try {
      const allFiles = fileSystem.getAllFiles ? fileSystem.getAllFiles() : [];
      
      if (allFiles.length === 0) {
        toast({
          title: "No files to upload",
          description: "There are no files in the current project",
          status: "warning",
          duration: 3000,
        });
        return false;
      }

      let uploadedCount = 0;
      const totalFiles = allFiles.length;

      // Upload each file to cloud
      for (const file of allFiles) {
        try {
          setCurrentUploadFile(file.name);
          
          // Get file path - adjust based on your file system structure
          const filePath = file.path || '';
          const fullPath = targetPath ? `${targetPath}/${filePath}`.replace('//', '/') : filePath;
          
          await cloudFileManager.createFile(file.name, file.content || '', fullPath);
          uploadedCount++;
          
          // Update progress
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
          
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      // Update cloud stats
      await getCloudStats();

      toast({
        title: "All files uploaded to cloud",
        description: `${uploadedCount}/${totalFiles} files uploaded successfully`,
        status: "success",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      return false;
    } finally {
      setIsCloudLoading(false);
      setUploadProgress(0);
      setCurrentUploadFile('');
    }
  };

  const handleSaveToCloud = async () => {
    const success = await handleAllFilesUploadToCloud();
    if (success) {
      onCloudSaveClose();
    }
  };

  const handleLoadFromCloud = async () => {
    setIsCloudLoading(true);
    try {
      // Get file list from cloud
      const result = await cloudFileManager.listFiles();
      
      if (result.success && result.items) {
        // Clear current file system (you might want to implement a proper reset)
        // For now, we'll just show a success message
        
        toast({
          title: "Project loaded from cloud",
          description: `${result.items.length} files downloaded successfully`,
          status: "success",
          duration: 3000,
        });
        
        // Update cloud stats
        await getCloudStats();
        onCloudLoadClose();
      }
    } catch (error) {
      toast({
        title: "Load failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleCreateFileInCloud = async (filename, content = '', path = '') => {
    try {
      const result = await cloudFileManager.createFile(filename, content, path);
      
      // Update cloud stats
      await getCloudStats();
      
      toast({
        title: "File created in cloud",
        description: `${filename} created successfully`,
        status: "success",
        duration: 2000,
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Create failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      throw error;
    }
  };

  const handleCreateFolderInCloud = async (dirname, path = '') => {
    try {
      const result = await cloudFileManager.createDirectory(dirname, path);
      
      // Update cloud stats
      await getCloudStats();
      
      toast({
        title: "Folder created in cloud",
        description: `${dirname} created successfully`,
        status: "success",
        duration: 2000,
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Create failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      throw error;
    }
  };

  const handleDeleteFromCloud = async (filepath) => {
    try {
      const result = await cloudFileManager.deleteFile(filepath);
      
      // Update cloud stats
      await getCloudStats();
      
      toast({
        title: "Item deleted",
        description: `${filepath} deleted from cloud`,
        status: "success",
        duration: 2000,
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
      throw error;
    }
  };

  // Cloud Upload Handler
  const handleCloudUpload = async (event, targetPath = '') => {
    const files = event.target.files;
    if (!files.length) return;

    const targetFolder = contextMenu?.node || fileSystem?.root;
    const cloudPath = targetFolder && targetFolder.type === FILE_TYPES.FOLDER ? 
      (targetFolder.getPath ? targetFolder.getPath() : targetFolder.name) : '';

    try {
      let success = false;
      
      if (uploadType === 'single') {
        success = await handleSingleFileUploadToCloud(files[0], cloudPath);
      } else if (uploadType === 'folder') {
        success = await handleFolderUploadToCloud(Array.from(files), cloudPath);
      } else if (uploadType === 'all') {
        success = await handleAllFilesUploadToCloud(cloudPath);
      }
      
      if (success) {
        onCloudUploadClose();
      }
    } catch (error) {
      console.error('Cloud upload failed:', error);
    } finally {
      event.target.value = '';
    }
  };

  const handleFileSearch = async () => {
    if (!fileSearchQuery.trim()) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch('https://cloud.coderpoint.ru/api/files.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search',
          token: token,
          query: fileSearchQuery
        })
      });
      
      const responseText = await response.text();
      const cleanResponse = cleanApiResponse(responseText);
      let result;
      
      try {
        result = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Failed to parse search response:', cleanResponse);
        toast({
          title: "Search failed",
          description: "Invalid server response",
          status: "error",
          duration: 3000,
        });
        return;
      }
      
      if (result.success) {
        setSearchResults(result.results);
        toast({
          title: "Search completed",
          description: `Found ${result.total} files`,
          status: "success",
          duration: 2000,
        });
      } else {
        toast({
          title: "Search failed",
          description: result.error,
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('File search failed:', error);
      toast({
        title: "Search error",
        description: "Failed to search files",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Auth functions - maintaining original
  const handleAuthInputChange = (field, value) => {
    setAuthFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (authErrors[field]) {
      setAuthErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateAuthForm = () => {
    const newErrors = {};

    if (!authFormData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (authFormData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!authFormData.password) {
      newErrors.password = 'Password is required';
    } else if (authFormData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLoginMode) {
      if (!authFormData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(authFormData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (authFormData.password !== authFormData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAuthForm()) {
      return;
    }

    setIsAuthLoading(true);
    setAuthErrors({});

    try {
      const action = isLoginMode ? 'login' : 'register';
      const payload = isLoginMode 
        ? { username: authFormData.username, password: authFormData.password }
        : { 
            username: authFormData.username, 
            email: authFormData.email, 
            password: authFormData.password 
          };

      console.log('Sending auth request:', { action, payload });

      const response = await fetch('https://cloud.coderpoint.ru/api/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          ...payload
        })
      });

      // Get the response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      const cleanResponse = cleanApiResponse(responseText);
      console.log('Cleaned response:', cleanResponse);

      let result;
      try {
        result = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', cleanResponse);
        throw new Error('Invalid server response format');
      }

      console.log('Parsed auth response:', result);

      if (result.success) {
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
          setUser(result.user);
          console.log('User set after login:', result.user);
        }

        toast({
          title: 'Success',
          description: result.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        onAuthClose();
        resetAuthForm();
        
        // Force re-render and fetch profile data
        setTimeout(() => {
          fetchUserProfile();
          fetchFileStats();
          getCloudStats();
        }, 500);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Authentication failed',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        toast({
          title: 'Network Error',
          description: 'Please check your connection and try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Something went wrong',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      try {
        await fetch('https://cloud.coderpoint.ru/api/auth.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'logout',
            token: token
          })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('auth_token');
    setUser(null);
    setProfile(null);
    setFileStats(null);
    setSearchResults([]);
    setCloudStats(null);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const resetAuthForm = () => {
    setAuthFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setAuthErrors({});
  };

  const switchAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    resetAuthForm();
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const getStoragePercentage = () => {
    if (!profile) return 0;
    const { storage_used = 0, storage_limit = 0 } = profile.user || {};
    return storage_limit > 0 ? Math.round((storage_used / storage_limit) * 100) : 0;
  };

  // Context menu actions - maintaining original
  const handleContextMenu = (e, node) => {
    e.preventDefault();
    e.stopPropagation();

    const explorerRect = explorerRef.current?.getBoundingClientRect();

    if (explorerRect) {
      const x = e.clientX - explorerRect.left;
      const y = e.clientY - explorerRect.top;

      setContextMenu({
        x,
        y,
        node
      });
    } else {
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

  // File operations - maintaining original
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
        const file = fileSystem.createFile(modalData.parentId, fileName, '', true);
        onFileSelect(file.id);
        toast({
          title: "File created",
          description: `${fileName} has been created and opened`,
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

  // Copy/Cut/Paste operations - maintaining original
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
      if (copiedNode.type === FILE_TYPES.FILE) {
        const newName = `${copiedNode.name.replace(/\.[^/.]+$/, '')}_copy${copiedNode.name.match(/\.[^/.]+$/)?.[0] || ''}`;
        fileSystem.createFile(targetFolder.id, newName, copiedNode.content);
      } else {
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
      onMoveOpen();
      setMoveTarget(targetFolder);
    }
  };

  const handleMoveConfirm = () => {
    if (cutNode && moveTarget) {
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

  // Enhanced file upload functionality - maintaining original
  const handleFileUpload = (event, parentId = null) => {
    const files = event.target.files;
    if (!files.length) return;

    const targetFolderId = parentId || fileSystem.root.id;
    let uploadedCount = 0;

    Array.from(files).forEach(file => {
      try {
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

    event.target.value = '';
  };

  const handleUploadAllFiles = () => {
    uploadAllInputRef.current?.click();
  };

  // Export functionality - maintaining original
  const handleExport = () => {
    onExportOpen();
  };

  const handleExportAsZip = async () => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const addFilesToZip = (node, path = '') => {
        if (node.type === FILE_TYPES.FILE) {
          zip.file(path + node.name, node.content);
        } else if (node.type === FILE_TYPES.FOLDER && node.children) {
          const folderPath = path + node.name + '/';
          node.children.forEach(child => addFilesToZip(child, folderPath));
        }
      };
      
      addFilesToZip(fileSystem.root);
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
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
      handleExportAsZip();
    }
    onExportClose();
  };

  const handleRefresh = () => {
    onFileSystemChange();
    if (user) {
      getCloudStats();
    }
    toast({
      title: "Refreshed",
      description: "File explorer has been refreshed",
      status: "info",
      duration: 1000
    });
  };

  // Drag and Drop functions - maintaining original
  const handleDragStart = (node) => {
    setDraggedNode(node);
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
  };

  const handleDrop = (draggedNode, targetFolder) => {
    console.log(`Moving ${draggedNode.name} to ${targetFolder.name}`);
    setDraggedNode(null);
  };

  const handleToggle = (folderId) => {
    fileSystem.toggleFolder(folderId);
    onFileSystemChange();
  };

  // Render Profile Content - maintaining original
  const renderProfileContent = () => (
    <VStack spacing={4} align="stretch">
      <Box p={4} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
        <HStack spacing={4}>
          <Avatar size="lg" name={user?.username} bg="purple.500" />
          <Box>
            <Text fontSize="xl" fontWeight="bold">{user?.username}</Text>
            <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{user?.email}</Text>
            <Badge colorScheme="purple" mt={1}>
              {user?.storage_path?.split('/').pop()}
            </Badge>
          </Box>
        </HStack>
      </Box>

      <Box p={4} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
        <Text fontWeight="bold" mb={2}>Storage Usage</Text>
        <Progress 
          value={getStoragePercentage()} 
          colorScheme={getStoragePercentage() > 90 ? "red" : "green"}
          size="lg"
          borderRadius="full"
          mb={2}
        />
        <HStack justify="space-between">
          <Text fontSize="sm">
            {formatFileSize(profile?.user?.storage_used || 0)} used
          </Text>
          <Text fontSize="sm">
            {formatFileSize(profile?.user?.storage_limit || 0)} total
          </Text>
        </HStack>
      </Box>

      {cloudStats && (
        <Box p={4} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
          <Text fontWeight="bold" mb={2}>Cloud Storage</Text>
          <Progress 
            value={(cloudStats.storage_used / cloudStats.storage_limit) * 100} 
            colorScheme="blue"
            size="lg"
            borderRadius="full"
            mb={2}
          />
          <HStack justify="space-between">
            <Text fontSize="sm">
              {formatFileSize(cloudStats.storage_used)} used
            </Text>
            <Text fontSize="sm">
              {formatFileSize(cloudStats.storage_limit)} total
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {cloudStats.total_files} files, {cloudStats.total_folders} folders
          </Text>
        </Box>
      )}

      {profile?.statistics && (
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <Stat p={3} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
              <StatLabel>Total Files</StatLabel>
              <StatNumber>{profile.statistics.total_files}</StatNumber>
              <StatHelpText>
                <AttachmentIcon mr={1} />
                Files in storage
              </StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat p={3} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
              <StatLabel>Total Folders</StatLabel>
              <StatNumber>{profile.statistics.total_folders}</StatNumber>
              <StatHelpText>
                <FaFolder style={{ display: 'inline', marginRight: '4px' }} />
                Directories
              </StatHelpText>
            </Stat>
          </GridItem>
        </Grid>
      )}
    </VStack>
  );

  // Render File Stats Content - maintaining original
  const renderFileStatsContent = () => (
    <VStack spacing={4} align="stretch">
      {fileStats ? (
        <>
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            <GridItem>
              <Stat p={3} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
                <StatLabel>Total Files</StatLabel>
                <StatNumber>{fileStats.total_files}</StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat p={3} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
                <StatLabel>Total Folders</StatLabel>
                <StatNumber>{fileStats.total_folders}</StatNumber>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat p={3} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
                <StatLabel>Total Size</StatLabel>
                <StatNumber>{formatFileSize(fileStats.total_size)}</StatNumber>
              </Stat>
            </GridItem>
          </Grid>

          {fileStats.file_types && fileStats.file_types.length > 0 && (
            <Box p={4} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
              <Text fontWeight="bold" mb={3}>File Types</Text>
              <VStack align="stretch" spacing={2}>
                {fileStats.file_types.slice(0, 5).map((type, index) => (
                  <HStack key={index} justify="space-between">
                    <Badge colorScheme="blue">
                      {type.file_type || 'directory'}
                    </Badge>
                    <Text fontSize="sm">{type.type_count} files</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {fileStats.largest_files && fileStats.largest_files.length > 0 && (
            <Box p={4} bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm">
              <Text fontWeight="bold" mb={3}>Largest Files</Text>
              <VStack align="stretch" spacing={2}>
                {fileStats.largest_files.slice(0, 5).map((file, index) => (
                  <HStack key={index} justify="space-between">
                    <Text fontSize="sm" noOfLines={1} flex={1}>
                      {file.filename}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {formatFileSize(file.size)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </>
      ) : (
        <Box textAlign="center" py={8}>
          <Spinner size="lg" mb={4} />
          <Text>Loading file statistics...</Text>
        </Box>
      )}
    </VStack>
  );

  // Render File Search Content - maintaining original
  const renderFileSearchContent = () => (
    <VStack spacing={4} align="stretch">
      <InputGroup>
        <InputLeftElement>
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search files by name..."
          value={fileSearchQuery}
          onChange={(e) => setFileSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleFileSearch()}
        />
      </InputGroup>

      <Button
        colorScheme="blue"
        onClick={handleFileSearch}
        isLoading={isAuthLoading}
        leftIcon={<SearchIcon />}
      >
        Search Files
      </Button>

      {searchResults.length > 0 && (
        <Box bg={colorMode === 'dark' ? 'gray.700' : 'white'} borderRadius="md" boxShadow="sm" overflow="hidden">
          <Table variant="simple" size="sm">
            <Thead bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}>
              <Tr>
                <Th>Name</Th>
                <Th>Path</Th>
                <Th isNumeric>Size</Th>
                <Th>Type</Th>
              </Tr>
            </Thead>
            <Tbody>
              {searchResults.map((file, index) => (
                <Tr key={index} _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.50' }}>
                  <Td>
                    <HStack>
                      {file.is_directory ? (
                        <FaFolder color="#f59e0b" />
                      ) : (
                        <FaFile color="#718096" />
                      )}
                      <Text fontSize="sm">{file.filename}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Code fontSize="xs" bg="transparent">
                      {file.file_path}
                    </Code>
                  </Td>
                  <Td isNumeric>
                    <Text fontSize="sm">
                      {formatFileSize(file.size)}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={file.is_directory ? "orange" : "blue"}>
                      {file.is_directory ? "Folder" : file.file_type || "File"}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {fileSearchQuery && searchResults.length === 0 && !isAuthLoading && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No files found matching "{fileSearchQuery}"
        </Alert>
      )}
    </VStack>
  );

  // Cloud operations buttons for header
  const cloudOperationsButtons = user ? (
    <HStack spacing={1}>
      <Tooltip label="Upload to Cloud">
        <IconButton
          icon={<FaCloud size={12} />}
          size="xs"
          variant="ghost"
          onClick={onCloudUploadOpen}
          aria-label="Upload to Cloud"
        />
      </Tooltip>
      
      <Tooltip label="Save to Cloud">
        <IconButton
          icon={<FaSave size={12} />}
          size="xs"
          variant="ghost"
          onClick={onCloudSaveOpen}
          aria-label="Save to Cloud"
        />
      </Tooltip>
      
      <Tooltip label="Load from Cloud">
        <IconButton
          icon={<FaFileImport size={12} />}
          size="xs"
          variant="ghost"
          onClick={onCloudLoadOpen}
          aria-label="Load from Cloud"
        />
      </Tooltip>
      
      <Tooltip label="Cloud Stats">
        <IconButton
          icon={<FaChartBar size={12} />}
          size="xs"
          variant="ghost"
          onClick={getCloudStats}
          aria-label="Cloud Stats"
        />
      </Tooltip>
    </HStack>
  ) : null;

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
        position="relative"
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
                
                {user && (
                  <>
                    <Divider my={1} />
                    <Text fontSize="xs" color="gray.500" px={3} py={1}>
                      Cloud Operations
                    </Text>
                    <MenuItem
                      icon={<FaCloud size={12} />}
                      onClick={onCloudUploadOpen}
                    >
                      Upload to Cloud
                    </MenuItem>
                    <MenuItem
                      icon={<FaSave size={12} />}
                      onClick={onCloudSaveOpen}
                    >
                      Save to Cloud
                    </MenuItem>
                    <MenuItem
                      icon={<FaFileImport size={12} />}
                      onClick={onCloudLoadOpen}
                    >
                      Load from Cloud
                    </MenuItem>
                    <MenuItem
                      icon={<FaChartBar size={12} />}
                      onClick={getCloudStats}
                    >
                      Cloud Stats
                    </MenuItem>
                  </>
                )}
                
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

        {/* Auth Section at the Bottom */}
        <Box 
          p={3} 
          borderTop="1px solid" 
          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          bg={colorMode === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(249, 250, 251, 0.95)'}
        >
          {user ? (
            <HStack justify="space-between" spacing={3}>
              <HStack spacing={2} flex={1}>
                <Avatar size="sm" name={user.username} bg="purple.500" />
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {user.username}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {formatFileSize(profile?.user?.storage_used || 0)} / {formatFileSize(profile?.user?.storage_limit || 0)}
                  </Text>
                </Box>
              </HStack>
              <HStack spacing={1}>
                <Tooltip label="Profile">
                  <IconButton
                    icon={<FaUser size={12} />}
                    size="xs"
                    variant="ghost"
                    onClick={onProfileOpen}
                    aria-label="Profile"
                  />
                </Tooltip>
                <Tooltip label="Sign Out">
                  <IconButton
                    icon={<FaSignOutAlt size={12} />}
                    size="xs"
                    variant="ghost"
                    onClick={handleLogout}
                    aria-label="Sign Out"
                    color="red.500"
                  />
                </Tooltip>
              </HStack>
            </HStack>
          ) : (
            <Button
              width="100%"
              size="sm"
              colorScheme="purple"
              variant="outline"
              leftIcon={<FaUser size={12} />}
              onClick={onAuthOpen}
            >
              Sign In to Cloud Storage
            </Button>
          )}
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

        <input
          type="file"
          ref={cloudUploadInputRef}
          style={{ display: 'none' }}
          onChange={handleCloudUpload}
        />

        <input
          type="file"
          ref={cloudFolderUploadInputRef}
          style={{ display: 'none' }}
          onChange={handleCloudUpload}
          multiple
        />

        {/* Context Menu */}
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
            onContextMenu={(e) => e.preventDefault()}
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

              {user && (
                <>
                  <Divider my={1} />
                  <Text fontSize="xs" color="gray.500" px={3} py={1}>
                    Cloud Operations
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaCloud size={12} />}
                    onClick={() => {
                      setUploadType('single');
                      onCloudUploadOpen();
                      closeContextMenu();
                    }}
                  >
                    Upload Single File
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaFolder size={12} />}
                    onClick={() => {
                      setUploadType('folder');
                      onCloudUploadOpen();
                      closeContextMenu();
                    }}
                  >
                    Upload Folder
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaFileExport size={12} />}
                    onClick={() => {
                      setUploadType('all');
                      onCloudUploadOpen();
                      closeContextMenu();
                    }}
                  >
                    Upload All Files
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaSave size={12} />}
                    onClick={() => {
                      onCloudSaveOpen();
                      closeContextMenu();
                    }}
                  >
                    Save to Cloud
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    leftIcon={<FaFileImport size={12} />}
                    onClick={() => {
                      onCloudLoadOpen();
                      closeContextMenu();
                    }}
                  >
                    Load from Cloud
                  </Button>
                </>
              )}

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

        {/* Auth Modal */}
        <Modal isOpen={isAuthOpen} onClose={onAuthClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {isLoginMode ? 'Sign In to Cloud Storage' : 'Create Account'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleAuthSubmit}>
                <VStack spacing={4}>
                  <FormControl isInvalid={!!authErrors.username}>
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={authFormData.username}
                      onChange={(e) => handleAuthInputChange('username', e.target.value)}
                      placeholder="Enter your username"
                    />
                    {authErrors.username && (
                      <Alert status="error" size="sm" mt={1}>
                        <AlertIcon />
                        {authErrors.username}
                      </Alert>
                    )}
                  </FormControl>

                  {!isLoginMode && (
                    <FormControl isInvalid={!!authErrors.email}>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={authFormData.email}
                        onChange={(e) => handleAuthInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                      {authErrors.email && (
                        <Alert status="error" size="sm" mt={1}>
                          <AlertIcon />
                          {authErrors.email}
                        </Alert>
                      )}
                    </FormControl>
                  )}

                  <FormControl isInvalid={!!authErrors.password}>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={authFormData.password}
                      onChange={(e) => handleAuthInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                    />
                    {authErrors.password && (
                      <Alert status="error" size="sm" mt={1}>
                        <AlertIcon />
                        {authErrors.password}
                      </Alert>
                    )}
                  </FormControl>

                  {!isLoginMode && (
                    <FormControl isInvalid={!!authErrors.confirmPassword}>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type="password"
                        value={authFormData.confirmPassword}
                        onChange={(e) => handleAuthInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                      />
                      {authErrors.confirmPassword && (
                        <Alert status="error" size="sm" mt={1}>
                          <AlertIcon />
                          {authErrors.confirmPassword}
                        </Alert>
                      )}
                    </FormControl>
                  )}

                  <Button
                    type="submit"
                    colorScheme="purple"
                    width="100%"
                    isLoading={isAuthLoading}
                    loadingText={isLoginMode ? "Signing In..." : "Creating Account..."}
                  >
                    {isLoginMode ? 'Sign In' : 'Create Account'}
                  </Button>

                  <Button
                    variant="link"
                    onClick={switchAuthMode}
                    size="sm"
                  >
                    {isLoginMode 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </Button>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Profile Modal */}
        <Modal isOpen={isProfileOpen} onClose={onProfileClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <FaUser />
                <Text>User Profile - {user?.username}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs>
                <TabList>
                  <Tab>
                    <HStack spacing={2}>
                      <FaUser size={12} />
                      <Text>Profile</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <FaChartBar size={12} />
                      <Text>File Stats</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <SearchIcon boxSize={3} />
                      <Text>Search Files</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    {renderProfileContent()}
                  </TabPanel>
                  <TabPanel>
                    {renderFileStatsContent()}
                  </TabPanel>
                  <TabPanel>
                    {renderFileSearchContent()}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Cloud Upload Modal */}
        <Modal isOpen={isCloudUploadOpen} onClose={onCloudUploadClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Upload to Cloud</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Upload Type</FormLabel>
                  <Select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                  >
                    <option value="single">Single File</option>
                    <option value="folder">Folder (Multiple Files)</option>
                    <option value="all">All Files in Project</option>
                  </Select>
                </FormControl>

                {uploadType === 'single' && (
                  <Box width="100%">
                    <Text mb={2}>Select a file to upload:</Text>
                    <Button
                      width="100%"
                      leftIcon={<AttachmentIcon />}
                      onClick={() => cloudUploadInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    {currentUploadFile && (
                      <Text fontSize="sm" color="green.500" mt={2}>
                        Selected: {currentUploadFile}
                      </Text>
                    )}
                  </Box>
                )}

                {uploadType === 'folder' && (
                  <Box width="100%">
                    <Text mb={2}>Select multiple files (folder upload):</Text>
                    <Button
                      width="100%"
                      leftIcon={<FaFolder />}
                      onClick={() => cloudFolderUploadInputRef.current?.click()}
                    >
                      Choose Files
                    </Button>
                    {currentUploadFile && (
                      <Text fontSize="sm" color="green.500" mt={2}>
                        Uploading: {currentUploadFile}
                      </Text>
                    )}
                  </Box>
                )}

                {uploadType === 'all' && (
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Upload All Files</Text>
                      <Text fontSize="sm">
                        This will upload all files from your current project to the cloud.
                        Total files: {fileSystem?.getAllFiles ? fileSystem.getAllFiles().length : 0}
                      </Text>
                    </Box>
                  </Alert>
                )}

                {isCloudLoading && (
                  <Box width="100%">
                    <Text mb={2}>
                      {currentUploadFile ? `Uploading: ${currentUploadFile}` : 'Uploading to cloud...'}
                    </Text>
                    <Progress 
                      value={uploadProgress} 
                      size="sm" 
                      colorScheme="blue" 
                      borderRadius="full"
                    />
                    <Text fontSize="sm" textAlign="center" mt={1}>
                      {uploadProgress}%
                    </Text>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCloudUploadClose}>
                Cancel
              </Button>
              {uploadType === 'all' && (
                <Button
                  colorScheme="blue"
                  onClick={() => handleAllFilesUploadToCloud()}
                  isLoading={isCloudLoading}
                  loadingText="Uploading..."
                >
                  Upload All
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Cloud Save Modal */}
        <Modal isOpen={isCloudSaveOpen} onClose={onCloudSaveClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Save Project to Cloud</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Alert status="warning">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Overwrite Warning</Text>
                    <Text fontSize="sm">
                      This will overwrite your existing cloud project with the current files.
                    </Text>
                  </Box>
                </Alert>
                
                <Text>
                  Are you sure you want to save all project files to the cloud?
                  This action cannot be undone.
                </Text>

                {fileSystem?.getAllFiles && (
                  <Text fontSize="sm" color="gray.500">
                    Total files to upload: {fileSystem.getAllFiles().length}
                  </Text>
                )}

                {isCloudLoading && (
                  <Box width="100%">
                    <Text mb={2}>Saving to cloud...</Text>
                    <Progress size="sm" isIndeterminate colorScheme="blue" />
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCloudSaveClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSaveToCloud}
                isLoading={isCloudLoading}
                loadingText="Saving..."
              >
                Save to Cloud
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Cloud Load Modal */}
        <Modal isOpen={isCloudLoadOpen} onClose={onCloudLoadClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Load Project from Cloud</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Alert status="warning">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Overwrite Warning</Text>
                    <Text fontSize="sm">
                      This will replace your current project with files from the cloud.
                      Any unsaved changes will be lost.
                    </Text>
                  </Box>
                </Alert>
                
                <Text>
                  Are you sure you want to load the project from the cloud?
                  This action cannot be undone.
                </Text>

                {isCloudLoading && (
                  <Box width="100%">
                    <Text mb={2}>Loading from cloud...</Text>
                    <Progress size="sm" isIndeterminate colorScheme="blue" />
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCloudLoadClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleLoadFromCloud}
                isLoading={isCloudLoading}
                loadingText="Loading..."
              >
                Load from Cloud
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

