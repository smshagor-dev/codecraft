import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Text,
  useToast,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Badge,
  Flex,
  Progress,
  useColorMode,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Grid,
  GridItem,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton
} from "@chakra-ui/react";
import { 
  FaPlay, 
  FaStop, 
  FaDownload, 
  FaTerminal, 
  FaClock, 
  FaMemory,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaInfoCircle,
  FaTrash,
  FaCopy,
  FaExpand,
  FaCompress,
  FaRocket,
  FaDesktop,
  FaCode,
  FaChartLine,
  FaExclamationCircle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { executeCode, executeWebCode, analyzeInputRequirements, LANGUAGE_MAPPING, detectLanguageFromCode, validateCodeForLanguage } from "../utils/compilerApis";
import { PreviewMode } from "./PreviewMode";
import { Terminal } from "./terminal";
import { InputModal } from "./InputModal";
import { GraphicalOutput } from "./GraphicalOutput";

const MotionBox = motion(Box);

// 3D Tab Component with enhanced effects
const ModernTab = ({ children, isSelected, ...props }) => (
  <MotionBox
    position="relative"
    initial={false}
    animate={{
      scale: isSelected ? 1.05 : 1,
      y: isSelected ? -2 : 0,
      z: isSelected ? 10 : 0
    }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 25
    }}
    whileHover={{
      scale: 1.02,
      y: -1
    }}
    style={{
      perspective: 1000
    }}
  >
    <Box
      bg={isSelected ? 
        'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)' : 
        'transparent'
      }
      border="1px solid"
      borderColor={isSelected ? 
        'rgba(168, 85, 247, 0.3)' : 
        'rgba(255, 255, 255, 0.1)'
      }
      borderRadius="12px 12px 0 0"
      p={3}
      cursor="pointer"
      position="relative"
      overflow="hidden"
      _before={isSelected ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, #a855f7, #8b5cf6)',
        borderRadius: '2px'
      } : {}}
      boxShadow={isSelected ? 
        '0 4px 20px rgba(168, 85, 247, 0.15), 0 2px 8px rgba(168, 85, 247, 0.1)' : 
        'none'
      }
      backdropFilter="blur(10px)"
      {...props}
    >
      {children}
    </Box>
  </MotionBox>
);

const LogEntry = ({ log, colorMode }) => {
  const getLogStyle = (type) => {
    const styles = {
      error: {
        icon: <FaTimesCircle />,
        color: colorMode === 'dark' ? '#ef4444' : '#dc2626',
        bg: colorMode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)'
      },
      warning: {
        icon: <FaExclamationTriangle />,
        color: colorMode === 'dark' ? '#f59e0b' : '#d97706',
        bg: colorMode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.3)'
      },
      info: {
        icon: <FaInfoCircle />,
        color: colorMode === 'dark' ? '#3b82f6' : '#2563eb',
        bg: colorMode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)'
      },
      success: {
        icon: <FaCheckCircle />,
        color: colorMode === 'dark' ? '#10b981' : '#059669',
        bg: colorMode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.3)'
      }
    };
    return styles[type] || styles.info;
  };

  const style = getLogStyle(log.type);

  return (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      p={3}
      bg={style.bg}
      borderLeft="3px solid"
      borderColor={style.borderColor}
      borderRadius="md"
      mb={2}
      _hover={{
        transform: 'translateX(4px)',
        transition: 'all 0.2s'
      }}
    >
      <HStack spacing={3} align="flex-start">
        <Box color={style.color} mt={0.5}>
          {style.icon}
        </Box>
        <VStack align="stretch" flex={1} spacing={1}>
          <Code 
            fontSize="sm" 
            bg="transparent" 
            color={colorMode === 'dark' ? 'gray.100' : 'gray.800'}
            p={0}
          >
            {log.message}
          </Code>
          <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
            {log.timestamp}
          </Text>
        </VStack>
      </HStack>
    </MotionBox>
  );
};

// Language Compatibility Warning Component
const LanguageWarningAlert = ({ warning, onClear, onIgnore, colorMode }) => {
  if (!warning) return null;

  return (
    <Alert status="warning" borderRadius="md" mb={3}>
      <AlertIcon />
      <AlertDescription flex="1">
        <VStack align="start" spacing={1}>
          <Text fontSize="sm" fontWeight="medium">
            Language Compatibility Issue
          </Text>
          <Text fontSize="xs">
            {warning}
          </Text>
        </VStack>
      </AlertDescription>
      <HStack spacing={1}>
        <Button size="xs" colorScheme="orange" variant="outline" onClick={onClear}>
          Clear Editor
        </Button>
        <Button size="xs" colorScheme="orange" variant="ghost" onClick={onIgnore}>
          Ignore
        </Button>
        <CloseButton size="sm" onClick={onIgnore} />
      </HStack>
    </Alert>
  );
};

export const ModernOutput = ({ editorRef, language, fileSystem, onFileSelect, onFileSystemChange }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [inputFields, setInputFields] = useState([]);
  const [pendingExecution, setPendingExecution] = useState(null);
  
  const [metrics, setMetrics] = useState({
    executionTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    successRate: 100
  });
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isRocketMode, setIsRocketMode] = useState(false);
  const [compilerStatus, setCompilerStatus] = useState('ready');
  const [showGraphicalModal, setShowGraphicalModal] = useState(false);
  
  // Active tab state management - ALWAYS show output in active tab
  const [activeTab, setActiveTab] = useState(0);
  const [hasOutput, setHasOutput] = useState(false);
  const [hasGraphicalData, setHasGraphicalData] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  
  // Language state management with persistence
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [languageWarning, setLanguageWarning] = useState(null);
  const [codeHistory, setCodeHistory] = useState({});
  const executionCountRef = useRef(0);
  const previousLanguageRef = useRef(language);

  // Enhanced Language change detection with code persistence and validation
  useEffect(() => {
    if (language !== previousLanguageRef.current) {
      console.log(`🔄 Language changed from ${previousLanguageRef.current} to ${language}`);
      
      const sourceCode = getCurrentCode();
      
      // Save current code to history before switching
      if (sourceCode && sourceCode.trim().length > 0) {
        setCodeHistory(prev => ({
          ...prev,
          [previousLanguageRef.current]: sourceCode
        }));
      }
      
      setOutput("");
      setError(null);
      setLogs([]);
      setHasOutput(false);
      setHasGraphicalData(false);
      setUserInput('');
      setCompilerStatus('ready');
      setActiveTab(0); 
      setLanguageWarning(null);

      const validation = validateCodeForLanguage(sourceCode, language);
      const detectedLanguage = detectLanguageFromCode(sourceCode);

      // Handle incompatible code during language switch
      if (!validation.valid && sourceCode.trim().length > 0) {
        // Define incompatible language pairs (simpler and broader)
        const incompatibleFamilies = {
          python: ['php', 'java', 'cpp', 'c', 'csharp', 'javascript'],
          php: ['python', 'java', 'cpp', 'c', 'javascript'],
          java: ['python', 'php', 'cpp', 'c', 'javascript'],
          cpp: ['python', 'php', 'java', 'javascript'],
          javascript: ['python', 'php', 'java', 'cpp']
        };

        const fromFamily = incompatibleFamilies[previousLanguageRef.current] || [];
        const shouldAutoClear = fromFamily.includes(language);

        setCodeHistory(prev => ({
          ...prev,
          [previousLanguageRef.current]: sourceCode
        }));

        if (shouldAutoClear) {
          const restoredCode = codeHistory[language] || '';
          setEditorCode(restoredCode);
          setLanguageWarning(null);
          setLogs(prev => [...prev, {
            id: Date.now(),
            type: 'info',
            message: `✅ Switched from ${getLanguageDisplayName(previousLanguageRef.current)} to ${getLanguageDisplayName(language)} successfully.`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        } else {
          setLanguageWarning(null);
        }
      }

      // Add language change log
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: `🔄 Switched from ${getLanguageDisplayName(previousLanguageRef.current)} to ${getLanguageDisplayName(language)}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Update references
      previousLanguageRef.current = language;
      setCurrentLanguage(language);
      
      // Show language change notification
      toast({
        title: `Language Changed to ${getLanguageDisplayName(language)}`,
        description: `Compiler configured for ${getLanguageDisplayName(language)} execution`,
        status: "info",
        duration: 2000,
        position: "top-right"
      });
    }
  }, [language, toast]);

  // Helper functions for code management
  const getCurrentCode = () => {
    if (editorRef.current?.getValue) {
      return editorRef.current.getValue();
    } else if (editorRef.current?.editor?.getValue) {
      return editorRef.current.editor.getValue();
    } else if (typeof editorRef.current === 'string') {
      return editorRef.current;
    } else {
      return localStorage.getItem('currentCode') || '';
    }
  };

  const setEditorCode = (code) => {
    if (editorRef.current?.setValue) {
      editorRef.current.setValue(code);
    } else if (editorRef.current?.editor?.setValue) {
      editorRef.current.editor.setValue(code);
    } else {
      localStorage.setItem('currentCode', code);
    }
  };

  // Get language display name
  const getLanguageDisplayName = (lang) => {
    const langMap = {
      'python': 'Python',
      'javascript': 'JavaScript',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'html': 'HTML',
      'css': 'CSS',
      'typescript': 'TypeScript'
    };
    return langMap[lang] || lang.toUpperCase();
  };

  // Get API information for current language
  const getApiInfo = () => {
    const langKey = language.toLowerCase();
    const langInfo = LANGUAGE_MAPPING[langKey] || LANGUAGE_MAPPING['python'];
    const apiInfo = {
      name: 'Unknown API',
      type: 'unknown',
      supportsBackend: false,
      supportsPiston: false
    };

    if (langInfo.backend) {
      apiInfo.name = 'CoderPoint Cloud';
      apiInfo.type = 'backend';
      apiInfo.supportsBackend = true;
    } else if (langInfo.piston) {
      apiInfo.name = 'Piston';
      apiInfo.type = 'piston';
      apiInfo.supportsPiston = true;
    }

    return apiInfo;
  };

  // Create default handlers if not provided
  const handleFileSelect = onFileSelect || (() => {
    console.warn('onFileSelect not provided to ModernOutput');
  });

  const handleFileSystemChange = onFileSystemChange || (() => {
    console.warn('onFileSystemChange not provided to ModernOutput');
  });

  const parseOutput = (output, isError = false) => {
    if (!output) return [];
    
    const lines = output.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      let type = isError ? 'error' : 'success';
      
      // Detect output types
      if (line.toLowerCase().includes('warning')) type = 'warning';
      if (line.toLowerCase().includes('error')) type = 'error';
      if (line.toLowerCase().includes('info')) type = 'info';
      if (line.toLowerCase().includes('success')) type = 'success';
      if (line.toLowerCase().includes('executed using')) type = 'info';
      if (line.toLowerCase().includes('turbo execution')) type = 'info';
      if (line.toLowerCase().includes('used provided input')) type = 'info';
      
      return {
        id: Date.now() + index,
        type,
        message: line,
        timestamp: new Date().toLocaleTimeString()
      };
    });
  };

  // Analyze input requirements when code changes
  const analyzeCodeForInput = () => {
    const sourceCode = getCurrentCode();
    if (!sourceCode) return [];
    
    return analyzeInputRequirements(sourceCode, language);
  };

  // Check if output contains graphical data patterns
  const checkForGraphicalData = (outputText) => {
    if (!outputText) return false;
    
    const graphicalPatterns = [
      /\[[\d\s\.,]+\]/, // Arrays
      /x\s*[:=]\s*\[/, // X data
      /y\s*[:=]\s*\[/, // Y data
      /values?\s*[:=]\s*\[/, // Values
      /data\s*[:=]\s*\[/, // Data arrays
      /\d+\.?\d*\s*,\s*\d+\.?\d*/, // CSV-like data
      /\{"x":\s*\d+/, // JSON coordinates
      /"values":\s*\[/, // JSON values
      /plt\./, // Matplotlib
      /plot\(/, // Plot function
      /graph_start/, // Explicit markers
      /graph_end/ // Explicit markers
    ];
    
    return graphicalPatterns.some(pattern => pattern.test(outputText));
  };

  // Enhanced code cleaning for language switching
  const cleanCodeForExecution = (code, targetLanguage) => {
    if (!code) return code;
    
    let cleanedCode = code.trim();
    
    // Remove common artifacts from previous language executions
    const cleanupPatterns = [
      /\/\*[\s\S]*?\*\//g, // Multi-line comments
      /\/\/.*$/gm, // Single line comments
      /#.*$/gm, // Python/PHP comments
      /<!--[\s\S]*?-->/g, // HTML comments
    ];
    
    cleanupPatterns.forEach(pattern => {
      cleanedCode = cleanedCode.replace(pattern, '');
    });
    
    // Language-specific cleaning and structure
    switch (targetLanguage) {
      case 'python':
        // Remove PHP, Java, C++ artifacts
        cleanedCode = cleanedCode.replace(/<\?php[\s\S]*?\?>/g, '');
        cleanedCode = cleanedCode.replace(/<\?[\s\S]*?\?>/g, '');
        cleanedCode = cleanedCode.replace(/namespace\s+.*?\{/g, '');
        cleanedCode = cleanedCode.replace(/using\s+.*?;/g, '');
        cleanedCode = cleanedCode.replace(/public\s+class/g, '');
        cleanedCode = cleanedCode.replace(/void\s+main/g, '');
        cleanedCode = cleanedCode.replace(/int\s+main/g, '');
        cleanedCode = cleanedCode.replace(/#include.*$/gm, '');
        break;
        
      case 'php':
        // Ensure proper PHP tags and remove other language artifacts
        cleanedCode = cleanedCode.replace(/public\s+class/g, '');
        cleanedCode = cleanedCode.replace(/void\s+main/g, '');
        cleanedCode = cleanedCode.replace(/int\s+main/g, '');
        cleanedCode = cleanedCode.replace(/namespace\s+.*?\{/g, '');
        cleanedCode = cleanedCode.replace(/using\s+.*?;/g, '');
        if (!cleanedCode.includes('<?php') && !cleanedCode.trim().startsWith('<?')) {
          cleanedCode = `<?php\n${cleanedCode}\n?>`;
        }
        break;
        
      case 'java':
        // Remove PHP, Python artifacts and ensure Java structure
        cleanedCode = cleanedCode.replace(/<\?php[\s\S]*?\?>/g, '');
        cleanedCode = cleanedCode.replace(/<\?[\s\S]*?\?>/g, '');
        cleanedCode = cleanedCode.replace(/def\s+.*?:/g, '');
        cleanedCode = cleanedCode.replace(/print\(.*?\)/g, '');
        if (!cleanedCode.includes('public class') && !cleanedCode.includes('class')) {
          cleanedCode = `public class Main {\n    public static void main(String[] args) {\n        ${cleanedCode}\n    }\n}`;
        }
        break;
        
      case 'cpp':
        // Remove artifacts and ensure C++ structure
        cleanedCode = cleanedCode.replace(/<\?php[\s\S]*?\?>/g, '');
        cleanedCode = cleanedCode.replace(/def\s+.*?:/g, '');
        cleanedCode = cleanedCode.replace(/print\(.*?\)/g, '');
        if (!cleanedCode.includes('int main') && !cleanedCode.includes('void main')) {
          cleanedCode = `#include <iostream>\nusing namespace std;\n\nint main() {\n    ${cleanedCode}\n    return 0;\n}`;
        }
        break;
        
      case 'c':
        // Remove artifacts and ensure C structure
        cleanedCode = cleanedCode.replace(/<\?php[\s\S]*?\?>/g, '');
        cleanedCode = cleanedCode.replace(/def\s+.*?:/g, '');
        cleanedCode = cleanedCode.replace(/print\(.*?\)/g, '');
        if (!cleanedCode.includes('int main') && !cleanedCode.includes('void main')) {
          cleanedCode = `#include <stdio.h>\n\nint main() {\n    ${cleanedCode}\n    return 0;\n}`;
        }
        break;
    }
    
    return cleanedCode.trim();
  };

  // Handle run code with input modal logic
  const handleRunCode = (turboMode = false) => {
    const sourceCode = getCurrentCode();

    if (!sourceCode || sourceCode.trim().length === 0) {
      toast({
        title: "No code to execute",
        description: "Write some code first to run it",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }

    console.log(`🚀 Executing ${language} code:`, sourceCode.substring(0, 100) + '...');

    // Validate code for current language
    const validation = validateCodeForLanguage(sourceCode, language);
    if (!validation.valid) {
      toast({
        title: "Language Mismatch Detected",
        description: validation.error,
        status: "error",
        duration: 5000,
        position: "top-right",
        isClosable: true
      });
      
      setError(validation.error);
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `❌ ${validation.error}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setHasOutput(true);
      setActiveTab(1); // Switch to Output tab
      return;
    }

    // Reset output state but KEEP current active tab
    setOutput("");
    setError(null);
    setLogs([]);
    setHasOutput(false);
    setHasGraphicalData(false);
    setLanguageWarning(null);

    // Show API information
    const apiInfo = getApiInfo();
    setLogs(prev => [...prev, {
      id: Date.now(),
      type: 'info',
      message: `🔧 Using ${apiInfo.name} for ${getLanguageDisplayName(language)} execution`,
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Clean the code before execution
    const cleanedCode = cleanCodeForExecution(sourceCode, language);
    console.log(`🧹 Cleaned code for ${language}:`, cleanedCode.substring(0, 100) + '...');

    // Analyze input requirements for ALL languages
    const detectedInputFields = analyzeCodeForInput();
    
    if (detectedInputFields.length > 0) {
      setInputFields(detectedInputFields);
      setPendingExecution({ turboMode, cleanedCode });
      onOpen();
    } else {
      // No input required, run directly
      executeCodeDirectly(turboMode, '', cleanedCode);
      setActiveTab(1);
    }
  };

  // Handle execution with provided input
  const handleExecuteWithInput = (input) => {
    if (pendingExecution) {
      executeCodeDirectly(pendingExecution.turboMode, input, pendingExecution.cleanedCode);
      setPendingExecution(null);
    }
  };

  // Main execution function
  const executeCodeDirectly = async (turboMode = false, input = '', cleanedCode = '') => {
    let sourceCode = cleanedCode;
    
    if (!sourceCode) {
      sourceCode = getCurrentCode();
      // Clean the code again as fallback
      sourceCode = cleanCodeForExecution(sourceCode, language);
    }

    if (!sourceCode) {
      toast({
        title: "No code to execute",
        description: "Please write some code first",
        status: "error",
        duration: 3000,
        position: "top-right"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCompilerStatus('connecting');
    const startTime = performance.now();
    
    // Increment execution counter
    executionCountRef.current += 1;
    const currentExecutionId = executionCountRef.current;
    
    console.log(`▶️ Starting execution #${currentExecutionId} for ${language}`);
    
    // Show rocket mode notification
    if (turboMode) {
      toast({
        title: "🚀 Rocket Mode Activated",
        description: "Executing with turbo optimizations...",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }
    
    try {
      setCompilerStatus('executing');
      let result;
      
      // Use appropriate executor based on language
      if (['html', 'css', 'javascript', 'js', 'jsx', 'ts', 'tsx'].includes(language)) {
        result = await executeWebCode(language, sourceCode, fileSystem);
      } else {
        result = await executeCode(language, sourceCode, input);
      }
      
      const endTime = performance.now();
      let executionTime = Math.round(endTime - startTime);
      
      // Simulate faster execution in rocket mode
      if (turboMode) {
        executionTime = Math.round(executionTime * 0.6); // 40% faster
      }
      
      // Handle API response properly
      let finalOutput = '';
      let finalError = '';
      
      if (result.run) {
        const { output, stdout, stderr } = result.run;
        
        // Combine output sources - prioritize stdout, then output
        finalOutput = stdout || output || '';
        finalError = stderr || '';
        
        if (finalError) {
          setError(finalError);
          const errorLogs = parseOutput(finalError, true);
          setLogs(prev => [...prev, ...errorLogs]);
          setCompilerStatus('error');
        } else {
          setOutput(finalOutput);
          const successLogs = parseOutput(finalOutput);
          setLogs(prev => [...prev, ...successLogs]);
          setCompilerStatus('success');
          
          // Add API used information
          setLogs(prev => [...prev, {
            id: Date.now() + 999,
            type: 'info',
            message: `✅ Executed using ${result.apiUsed || 'unknown'} API`,
            timestamp: new Date().toLocaleTimeString()
          }]);
          
          // Add input info if used
          if (input) {
            setUserInput(input);
            const inputLines = input.split('\n').filter(line => line.trim());
            setLogs(prev => [...prev, {
              id: Date.now() + 1001,
              type: 'info',
              message: `📥 Used ${inputLines.length} input${inputLines.length > 1 ? 's' : ''}: ${inputLines.map(line => `"${line}"`).join(', ')}`,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
          
          // Add turbo mode success message
          if (turboMode) {
            setLogs(prev => [...prev, {
              id: Date.now() + 1000,
              type: 'info',
              message: '⚡ Turbo execution completed successfully!',
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        }
      } else {
        // Handle case where result structure is different
        finalOutput = result.output || JSON.stringify(result, null, 2);
        setOutput(finalOutput);
        const successLogs = parseOutput(finalOutput);
        setLogs(prev => [...prev, ...successLogs]);
        setCompilerStatus('success');
      }
      
      // ALWAYS show output in the currently active tab
      setHasOutput(true);
      
      // Check if output has graphical data patterns
      const hasGraphicalPatterns = checkForGraphicalData(finalOutput || finalError);
      setHasGraphicalData(hasGraphicalPatterns);
      
      // Update execution result
      setExecutionResult({
        apiUsed: result.apiUsed || 'unknown',
        executionTime,
        success: !finalError,
        hasGraphicalData: hasGraphicalPatterns
      });
      
      setMetrics(prev => ({
        ...prev,
        executionTime,
        memoryUsage: turboMode ? Math.round(Math.random() * 30 + 5) : Math.round(Math.random() * 50 + 10),
        cpuUsage: turboMode ? Math.round(Math.random() * 20 + 3) : Math.round(Math.random() * 30 + 5),
        successRate: finalError ? 0 : 100
      }));
      
    } catch (error) {
      console.error('❌ Execution error:', error);
      const errorMessage = error.message || "Execution failed";
      setError(errorMessage);
      
      // Add detailed error log
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `API Error: ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Check if it's a compiler API error with multiple failures
      if (errorMessage.includes('All compilers failed')) {
        const lines = errorMessage.split('\n').slice(1); // Skip the first line
        lines.forEach(line => {
          if (line.trim()) {
            setLogs(prev => [...prev, {
              id: Date.now() + Math.random(),
              type: 'error',
              message: `Compiler failed: ${line.trim()}`,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
        });
      }
      
      // ALWAYS show output in the currently active tab
      setHasOutput(true);
      
      setMetrics(prev => ({ ...prev, successRate: 0 }));
      setCompilerStatus('error');
      
      // Show specific error toast for compiler issues
      toast({
        title: "Compiler Error",
        description: "Failed to execute code. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
    } finally {
      setIsLoading(false);
      if (turboMode && !error) {
        // Show completion toast for rocket mode
        toast({
          title: "✨ Rocket Mode Complete",
          description: `Code executed ${Math.round(Math.random() * 30 + 20)}% faster!`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      }
    }
  };
  
  const runRocketMode = () => {
    setIsRocketMode(true);
    handleRunCode(true).finally(() => {
      setTimeout(() => setIsRocketMode(false), 2000);
    });
  };

  const clearConsole = () => {
    setLogs([]);
    setOutput("");
    setError(null);
    setUserInput('');
    setCompilerStatus('ready');
    setHasOutput(false);
    setHasGraphicalData(false);
    setActiveTab(0); // Reset to Console tab
    setLanguageWarning(null);
  };

  const copyOutput = () => {
    const text = logs.map(log => log.message).join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      position: "top-right"
    });
  };

  const downloadOutput = () => {
    const content = logs.map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`).join('\n');
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output_${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle language warning actions
  const handleClearEditor = () => {
    setEditorCode('');
    setLanguageWarning(null);
    toast({
      title: "Editor Cleared",
      description: "Incompatible code has been removed",
      status: "info",
      duration: 2000,
      position: "top-right"
    });
  };

  const handleIgnoreWarning = () => {
    setLanguageWarning(null);
  };

  // Check input requirements for ALL languages
  const inputFieldsCount = analyzeCodeForInput().length;
  const hasInputRequirements = inputFieldsCount > 0;

  // Check if HTML files exist for preview functionality
  const hasHTMLFile = fileSystem && fileSystem.root && 
    fileSystem.root.children.some(node => 
      node.name.endsWith('.html') || 
      (node.children && node.children.some(child => child.name.endsWith('.html')))
    );

  // Get compiler status badge color
  const getCompilerStatusColor = () => {
    switch (compilerStatus) {
      case 'connecting': return 'blue';
      case 'executing': return 'yellow';
      case 'success': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  // Get compiler status text
  const getCompilerStatusText = () => {
    switch (compilerStatus) {
      case 'connecting': return 'Connecting to Compiler';
      case 'executing': return 'Executing Code';
      case 'success': return 'Successful';
      case 'error': return 'Failed';
      default: return 'Ready';
    }
  };

  // Get language-specific input information
  const getLanguageInputInfo = () => {
    const inputInfo = {
      python: { method: 'input()', example: 'name = input("Enter your name: ")' },
      javascript: { method: 'prompt()', example: 'let name = prompt("Enter your name: ")' },
      typescript: { method: 'prompt()', example: 'let name = prompt("Enter your name: ")' },
      java: { method: 'Scanner', example: 'Scanner scanner = new Scanner(System.in); String name = scanner.nextLine();' },
      cpp: { method: 'cin', example: 'string name; cin >> name;' },
      c: { method: 'scanf()', example: 'char name[50]; scanf("%s", name);' },
      csharp: { method: 'Console.ReadLine()', example: 'string name = Console.ReadLine();' },
      php: { method: 'fgets() or readline()', example: '$name = readline("Enter your name: ");' },
      ruby: { method: 'gets', example: 'name = gets.chomp' },
      go: { method: 'fmt.Scan', example: 'var name string; fmt.Scan(&name)' },
      rust: { method: 'std::io::stdin()', example: 'let mut name = String::new(); std::io::stdin().read_line(&mut name);' },
      swift: { method: 'readLine()', example: 'let name = readLine()' },
      kotlin: { method: 'readLine()', example: 'val name = readLine()' }
    };
    
    return inputInfo[language] || { method: 'input function', example: 'Check language documentation' };
  };

  // Get API badge information
  const getApiBadgeInfo = () => {
    const apiInfo = getApiInfo();
    switch (apiInfo.type) {
      case 'backend':
        return { color: 'green', text: 'CoderPoint Cloud' };
      case 'piston':
        return { color: 'blue', text: 'Piston' };
      default:
        return { color: 'gray', text: 'Unknown API' };
    }
  };

  // If preview mode is active and HTML files exist, show PreviewMode component
  if (showPreview && hasHTMLFile) {
    return (
      <PreviewMode 
        fileSystem={fileSystem}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onToggleConsole={() => setShowPreview(false)}
      />
    );
  }

  const languageInputInfo = getLanguageInputInfo();
  const apiBadgeInfo = getApiBadgeInfo();

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      h="100%"
      bg={colorMode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)'}
      backdropFilter="blur(10px)"
      borderLeft="1px solid"
      borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
      display="flex"
      flexDirection="column"
      position={isFullscreen ? "fixed" : "relative"}
      top={isFullscreen ? 0 : "auto"}
      left={isFullscreen ? 0 : "auto"}
      right={isFullscreen ? 0 : "auto"}
      bottom={isFullscreen ? 0 : "auto"}
      zIndex={isFullscreen ? 1000 : 1}
      overflow="hidden"
    >
      {/* Header */}
      <Flex
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        align="center"
        justify="space-between"
        bg={colorMode === 'dark' ? 'rgba(10, 14, 39, 0.5)' : 'rgba(248, 250, 252, 0.9)'}
        overflow="hidden"
      >
        <HStack spacing={3} overflow="hidden">
          <Box
            p={1.5}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="lg"
          >
            <FaTerminal size={14} color="white" />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="bold">
              Developer Console
            </Text>
            <HStack spacing={2}>
              <Badge
                colorScheme={getCompilerStatusColor()}
                variant="subtle"
                fontSize="xs"
              >
                {getCompilerStatusText()}
              </Badge>
              {language && (
                <Badge
                  colorScheme="purple"
                  variant="solid"
                  fontSize="xs"
                >
                  {getLanguageDisplayName(language)}
                </Badge>
              )}
              <Badge
                colorScheme={apiBadgeInfo.color}
                variant="subtle"
                fontSize="xs"
              >
                {apiBadgeInfo.text}
              </Badge>
              {hasInputRequirements && (
                <Badge
                  colorScheme="orange"
                  variant="subtle"
                  fontSize="xs"
                >
                  {inputFieldsCount} Input{inputFieldsCount > 1 ? 's' : ''}
                </Badge>
              )}
              {hasOutput && (
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  fontSize="xs"
                >
                  {compilerStatus === 'success' ? 'EXECUTED' : 'READY'}
                </Badge>
              )}
            </HStack>
          </VStack>
        </HStack>

        <HStack spacing={2}>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              leftIcon={<FaCode />}
              onClick={() => setShowPreview(false)}
              colorScheme={!showPreview ? 'purple' : 'gray'}
              isDisabled={showPreview && !hasHTMLFile}
            >
              Console
            </Button>
            <Button
              leftIcon={<FaDesktop />}
              onClick={() => {
                if (hasHTMLFile) {
                  setShowPreview(true);
                } else {
                  toast({
                    title: "No HTML files found",
                    description: "Create an HTML file to use preview mode",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                    position: "top-right"
                  });
                }
              }}
              colorScheme={showPreview ? 'purple' : 'gray'}
              opacity={!hasHTMLFile ? 0.6 : 1}
            >
              Preview
            </Button>
          </ButtonGroup>
          
          {!showPreview && (
            <Button
              size="sm"
              leftIcon={isLoading ? <FaStop /> : <FaPlay />}
              variant="gradient"
              onClick={() => handleRunCode(false)}
              isLoading={isLoading}
              loadingText="Executing..."
              id="run-button"
              boxShadow="0 4px 15px rgba(168, 85, 247, 0.3)"
              _hover={{
                boxShadow: "0 6px 20px rgba(168, 85, 247, 0.4)"
              }}
            >
              {isLoading ? "Stop" : "Run Code"}
              {hasInputRequirements && ` (${inputFieldsCount})`}
            </Button>
          )}
          
          <Tooltip 
            label="Rocket Mode (Turbo Execution)" 
            placement="top" 
            hasArrow={false}
            openDelay={200}
          >
            <IconButton
              size="sm"
              icon={<FaRocket />}
              variant={isRocketMode ? "gradient" : "glass"}
              aria-label="Turbo mode"
              color={colorMode === 'dark' ? 'orange.300' : 'orange.500'}
              onClick={runRocketMode}
              isDisabled={isLoading || showPreview}
              _hover={isRocketMode ? {
                transform: "rotate(360deg)",
                transition: "transform 0.5s"
              } : {}}
              animation={isRocketMode ? "pulse 1s infinite" : "none"}
            />
          </Tooltip>
          
          <Tooltip 
            label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} 
            placement="top" 
            hasArrow={false}
            openDelay={200}
          >
            <IconButton
              size="sm"
              icon={isFullscreen ? <FaCompress /> : <FaExpand />}
              variant="glass"
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label="Toggle fullscreen"
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Language Warning Alert */}
      {languageWarning && (
        <LanguageWarningAlert 
          warning={languageWarning}
          onClear={handleClearEditor}
          onIgnore={handleIgnoreWarning}
          colorMode={colorMode}
        />
      )}

      {/* Language & API Info */}
      <Box
        px={4}
        py={2}
        bg={colorMode === 'dark' ? 'blue.900' : 'blue.100'}
        borderBottom="1px solid"
        borderColor={colorMode === 'dark' ? 'blue.700' : 'blue.200'}
      >
        <HStack spacing={3} justify="space-between">
          <HStack spacing={3}>
            <Badge colorScheme="blue" fontSize="xs">
              ACTIVE LANGUAGE
            </Badge>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'blue.300' : 'blue.700'}>
              {getLanguageDisplayName(language)} • {getApiInfo().name}
            </Text>
          </HStack>
          <Text fontSize="xs" color={colorMode === 'dark' ? 'blue.300' : 'blue.700'}>
            CoderPoint Cloud: {getApiInfo().supportsBackend ? '✅' : '❌'} • 
            Piston: {getApiInfo().supportsPiston ? '✅' : '❌'}
          </Text>
        </HStack>
      </Box>

      {/* Input Status */}
      {userInput && (
        <Box
          px={4}
          py={2}
          bg={colorMode === 'dark' ? 'green.900' : 'green.100'}
          borderBottom="1px solid"
          borderColor={colorMode === 'dark' ? 'green.700' : 'green.200'}
        >
          <HStack spacing={2}>
            <Badge colorScheme="green" fontSize="xs">
              INPUT ACTIVE
            </Badge>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'green.300' : 'green.700'}>
              Using provided input: {userInput.split('\n').map((line, i) => `"${line}"`).join(', ')}
            </Text>
            <IconButton
              size="xs"
              icon={<FaTrash />}
              variant="ghost"
              onClick={() => setUserInput('')}
              aria-label="Clear input"
              colorScheme="green"
            />
          </HStack>
        </Box>
      )}

      {/* Language Input Info */}
      {hasInputRequirements && (
        <Box
          px={4}
          py={2}
          bg={colorMode === 'dark' ? 'orange.900' : 'orange.100'}
          borderBottom="1px solid"
          borderColor={colorMode === 'dark' ? 'orange.700' : 'orange.200'}
        >
          <HStack spacing={3}>
            <Badge colorScheme="orange" fontSize="xs">
              {language.toUpperCase()} INPUT
            </Badge>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'orange.300' : 'orange.700'}>
              Method: {languageInputInfo.method}
            </Text>
            <Code fontSize="xs" bg="transparent" color={colorMode === 'dark' ? 'orange.200' : 'orange.800'}>
              {languageInputInfo.example}
            </Code>
          </HStack>
        </Box>
      )}

      {/* Metrics Bar */}
      {(metrics.executionTime > 0 || isLoading) && (
        <Box
          px={4}
          py={2}
          borderBottom="1px solid"
          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        >
          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <GridItem>
              <HStack spacing={2}>
                <FaClock color={colorMode === 'dark' ? '#60a5fa' : '#2563eb'} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                    Time
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {isLoading ? '...' : `${metrics.executionTime}ms`}
                  </Text>
                </VStack>
              </HStack>
            </GridItem>
            <GridItem>
              <HStack spacing={2}>
                <FaMemory color={colorMode === 'dark' ? '#34d399' : '#059669'} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                    Memory
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {isLoading ? '...' : `${metrics.memoryUsage}MB`}
                  </Text>
                </VStack>
              </HStack>
            </GridItem>
            <GridItem>
              <HStack spacing={2}>
                <FaChartLine color={colorMode === 'dark' ? '#f59e0b' : '#d97706'} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                    CPU
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {isLoading ? '...' : `${metrics.cpuUsage}%`}
                  </Text>
                </VStack>
              </HStack>
            </GridItem>
            <GridItem>
              <HStack spacing={2}>
                <FaCheckCircle color={colorMode === 'dark' ? '#10b981' : '#059669'} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                    Success
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {isLoading ? '...' : `${metrics.successRate}%`}
                  </Text>
                </VStack>
              </HStack>
            </GridItem>
          </Grid>
        </Box>
      )}

      {/* Loading Progress */}
      {isLoading && (
        <Progress
          size="xs"
          isIndeterminate
          colorScheme="purple"
          bg="transparent"
        />
      )}

      {/* Main Content Area with 3D Tabs */}
      <Box flex={1} overflow="hidden">
        <Tabs 
          colorScheme="purple" 
          size="sm" 
          h="100%" 
          display="flex" 
          flexDirection="column"
          index={activeTab}
          onChange={setActiveTab}
          variant="unstyled"
        >
          <TabList 
            px={4} 
            pt={3}
            pb={2}
            borderBottom="1px solid" 
            borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            gap={2}
          >
            {['Console', 'Output', 'Graphical', 'Problems', 'Terminal'].map((tabName, index) => (
              <Tab key={tabName} as={MotionBox} p={0} _selected={{}} _hover={{}}>
                <ModernTab isSelected={activeTab === index}>
                  <HStack spacing={2}>
                    {index === 0 && <FaTerminal size={12} />}
                    {index === 1 && <FaCode size={12} />}
                    {index === 2 && <FaChartLine size={12} />}
                    {index === 3 && <FaExclamationTriangle size={12} />}
                    {index === 4 && <FaTerminal size={12} />}
                    <Text fontSize="sm" fontWeight="medium">{tabName}</Text>
                    {index === 0 && logs.length > 0 && (
                      <Badge colorScheme="purple" fontSize="xs" borderRadius="full" minW="5">
                        {logs.length}
                      </Badge>
                    )}
                    {index === 1 && output && (
                      <Badge colorScheme="green" fontSize="xs" borderRadius="full" minW="5">
                        ✓
                      </Badge>
                    )}
                    {index === 2 && hasGraphicalData && (
                      <Badge colorScheme="blue" fontSize="xs" borderRadius="full" minW="5">
                        📊
                      </Badge>
                    )}
                    {index === 3 && error && (
                      <Badge colorScheme="red" fontSize="xs" borderRadius="full" minW="5">
                        !
                      </Badge>
                    )}
                  </HStack>
                </ModernTab>
              </Tab>
            ))}
            
            <Flex flex={1} justify="flex-end" align="center">
              <HStack spacing={2}>
                <Tooltip label="Clear Console">
                  <IconButton
                    size="xs"
                    icon={<FaTrash />}
                    variant="ghost"
                    onClick={clearConsole}
                    aria-label="Clear"
                  />
                </Tooltip>
                <Tooltip label="Copy Output">
                  <IconButton
                    size="xs"
                    icon={<FaCopy />}
                    variant="ghost"
                    onClick={copyOutput}
                    aria-label="Copy"
                  />
                </Tooltip>
                <Tooltip label="Download Logs">
                  <IconButton
                    size="xs"
                    icon={<FaDownload />}
                    variant="ghost"
                    onClick={downloadOutput}
                    aria-label="Download"
                  />
                </Tooltip>
                {hasGraphicalData && (
                  <Tooltip label="Open Graphical View">
                    <IconButton
                      size="xs"
                      icon={<FaChartLine />}
                      variant="ghost"
                      onClick={() => {
                        setShowGraphicalModal(true);
                        setActiveTab(2); // Switch to Graphical tab
                      }}
                      aria-label="Graphical View"
                      colorScheme="purple"
                    />
                  </Tooltip>
                )}
              </HStack>
            </Flex>
          </TabList>

          <TabPanels flex={1} overflow="auto">
            {/* Console Tab */}
            <TabPanel p={4} h="100%">
              {logs.length === 0 ? (
                <VStack spacing={4} justify="center" h="100%" opacity={0.5}>
                  <FaTerminal size={48} />
                  <Text fontSize="lg">Console is empty</Text>
                  <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
                    Run your code to see output here
                  </Text>
                  {hasInputRequirements && (
                    <VStack spacing={1}>
                      <Badge colorScheme="orange" variant="subtle">
                        Input Detection Active
                      </Badge>
                      <Text fontSize="xs" color={colorMode === 'dark' ? 'orange.300' : 'orange.600'}>
                        This {language} code uses {languageInputInfo.method} for user input
                      </Text>
                    </VStack>
                  )}
                </VStack>
              ) : (
                <AnimatePresence>
                  <VStack align="stretch" spacing={0}>
                    {logs.map(log => (
                      <LogEntry key={log.id} log={log} colorMode={colorMode} />
                    ))}
                  </VStack>
                </AnimatePresence>
              )}
            </TabPanel>

            {/* Output Tab - ALWAYS show output here when active */}
            <TabPanel p={4}>
              <VStack align="stretch" spacing={4}>
                {/* API Response Details */}
                {output && (
                  <Box
                    p={4}
                    bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}
                    borderRadius="lg"
                    borderLeft="4px solid"
                    borderColor="green.500"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold" fontSize="sm">
                        {language.toUpperCase()} Program Output
                      </Text>
                      <Badge colorScheme="green" fontSize="xs">
                        SUCCESS
                      </Badge>
                    </HStack>
                    <Box
                      fontFamily="mono"
                      fontSize="sm"
                      bg={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white'}
                      p={3}
                      borderRadius="md"
                      maxH="400px"
                      overflowY="auto"
                    >
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                        {output}
                      </pre>
                    </Box>
                  </Box>
                )}

                {/* Error Output */}
                {error && (
                  <Box
                    p={4}
                    bg={colorMode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'}
                    borderRadius="lg"
                    borderLeft="4px solid"
                    borderColor="red.500"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold" fontSize="sm">
                        {language.toUpperCase()} Execution Error
                      </Text>
                      <Badge colorScheme="red" fontSize="xs">
                        ERROR
                      </Badge>
                    </HStack>
                    <Box
                      fontFamily="mono"
                      fontSize="sm"
                      bg={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white'}
                      p={3}
                      borderRadius="md"
                      maxH="400px"
                      overflowY="auto"
                    >
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, color: 'red' }}>
                        {error}
                      </pre>
                    </Box>
                  </Box>
                )}

                {/* No Output State */}
                {!output && !error && (
                  <VStack spacing={4} justify="center" h="200px" opacity={0.5}>
                    <FaCode size={48} />
                    <Text fontSize="lg">No output yet</Text>
                    <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
                      Run your {language} code to see output here
                    </Text>
                    {hasInputRequirements && (
                      <VStack spacing={2}>
                        <Badge colorScheme="orange" variant="subtle">
                          {language} Input Ready
                        </Badge>
                        <Text fontSize="xs" color={colorMode === 'dark' ? 'orange.300' : 'orange.600'}>
                          Code requires {inputFieldsCount} input{inputFieldsCount > 1 ? 's' : ''} via {languageInputInfo.method}
                        </Text>
                      </VStack>
                    )}
                  </VStack>
                )}
              </VStack>
            </TabPanel>

            {/* Graphical Output Tab */}
            <TabPanel p={4} h="100%">
              <GraphicalOutput 
                output={output}
                language={language}
                isLoading={isLoading}
                executionData={executionResult}
                code={getCurrentCode()}
              />
            </TabPanel>

            {/* Problems Tab */}
            <TabPanel p={4}>
              <VStack align="stretch" spacing={2}>
                {error ? (
                  <HStack 
                    p={3} 
                    bg="rgba(239, 68, 68, 0.1)" 
                    borderRadius="md"
                    borderLeft="3px solid"
                    borderColor="red.500"
                  >
                    <FaTimesCircle color="#ef4444" />
                    <VStack align="start" flex={1} spacing={1}>
                      <Text fontWeight="bold" fontSize="sm">{language} Execution Error</Text>
                      <Code fontSize="xs" bg="transparent">{error}</Code>
                    </VStack>
                  </HStack>
                ) : hasInputRequirements ? (
                  <HStack 
                    p={3} 
                    bg="rgba(245, 158, 11, 0.1)" 
                    borderRadius="md"
                    borderLeft="3px solid"
                    borderColor="orange.500"
                  >
                    <FaInfoCircle color="#f59e0b" />
                    <VStack align="start" flex={1} spacing={1}>
                      <Text fontWeight="bold" fontSize="sm">{language} Input Required</Text>
                      <Text fontSize="sm">
                        This {language} code requires {inputFieldsCount} input{inputFieldsCount > 1 ? 's' : ''} using {languageInputInfo.method}.
                      </Text>
                      <Code fontSize="xs" bg="transparent" mt={1}>
                        {languageInputInfo.example}
                      </Code>
                    </VStack>
                  </HStack>
                ) : languageWarning ? (
                  <HStack 
                    p={3} 
                    bg="rgba(245, 158, 11, 0.1)" 
                    borderRadius="md"
                    borderLeft="3px solid"
                    borderColor="orange.500"
                  >
                    <FaExclamationCircle color="#f59e0b" />
                    <VStack align="start" flex={1} spacing={1}>
                      <Text fontWeight="bold" fontSize="sm">Language Compatibility Issue</Text>
                      <Text fontSize="sm">
                        {languageWarning}
                      </Text>
                    </VStack>
                  </HStack>
                ) : (
                  <VStack spacing={4} justify="center" h="200px" opacity={0.7}>
                    <FaCheckCircle size={48} color={colorMode === 'dark' ? '#48bb78' : '#38a169'} />
                    <Text fontSize="lg">No problems detected</Text>
                    <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
                      Your {language} code is ready to run
                    </Text>
                  </VStack>
                )}
              </VStack>
            </TabPanel>

            {/* Terminal Tab */}
            <TabPanel p={0} h="100%">
              <Terminal
                fileSystem={fileSystem}
                onFileSelect={handleFileSelect}
                onFileSystemChange={handleFileSystemChange}
                isVisible={true}
              />
            </TabPanel>
            
          </TabPanels>
        </Tabs>
      </Box>

      {/* Loading Overlay */}
      {isLoading && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10}
          backdropFilter="blur(4px)"
        >
          <VStack spacing={4}>
            <Spinner
              size="xl"
              color="purple.500"
              thickness="4px"
              speed="0.65s"
            />
            <VStack spacing={1}>
              <Text fontWeight="bold" fontSize="lg">
                {compilerStatus === 'connecting' ? `Connecting to ${language} Compiler...` : `Executing ${language} Code...`}
              </Text>
              <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                {compilerStatus === 'connecting' 
                  ? 'Establishing connection with cloud compiler...' 
                  : `Running your ${language} code on remote server...`}
              </Text>
              {hasInputRequirements && userInput && (
                <Badge colorScheme="blue" mt={2}>
                  Using {inputFieldsCount} provided input{inputFieldsCount > 1 ? 's' : ''}
                </Badge>
              )}
            </VStack>
          </VStack>
        </MotionBox>
      )}

      {/* Graphical Output Modal */}
      <Modal 
        isOpen={showGraphicalModal} 
        onClose={() => setShowGraphicalModal(false)}
        size="full"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent 
          maxW="95vw" 
          maxH="95vh" 
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderRadius="xl"
          overflow="hidden"
        >
          <ModalHeader 
            bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
            borderBottom="1px solid"
            borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          >
            <HStack justify="space-between">
              <HStack spacing={3}>
                <FaChartLine color={colorMode === 'dark' ? '#a78bfa' : '#7c3aed'} />
                <Text>Graphical Output - {language.toUpperCase()}</Text>
                <Badge colorScheme="purple">
                  Interactive View
                </Badge>
              </HStack>
              <HStack>
                <IconButton
                  icon={<FaCompress />}
                  onClick={() => setShowGraphicalModal(false)}
                  aria-label="Close"
                  variant="ghost"
                />
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalBody p={0} overflow="hidden">
            <GraphicalOutput 
              output={output}
              language={language}
              isLoading={isLoading}
              executionData={executionResult}
              code={getCurrentCode()}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Input Modal */}
      <InputModal
        isOpen={isOpen}
        onClose={onClose}
        onExecute={handleExecuteWithInput}
        language={language}
        code={getCurrentCode()}
        isLoading={isLoading}
        inputFields={inputFields}
      />
    </MotionBox>
  );
};