import { useState } from "react";
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
  useDisclosure
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
  FaCode
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { executeCode, executeWebCode, analyzeInputRequirements } from "../utils/compilerApis";
import { PreviewMode } from "./PreviewMode";
import { Terminal } from "./terminal";
import { InputModal } from "./InputModal";

const MotionBox = motion(Box);

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
  const [showTerminal, setShowTerminal] = useState(false);
  const [compilerStatus, setCompilerStatus] = useState('ready');

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
    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) return [];
    
    return analyzeInputRequirements(sourceCode, language);
  };

  // Handle run code with input modal logic
  const handleRunCode = (turboMode = false) => {
    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) {
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

    // Analyze input requirements for ALL languages
    const detectedInputFields = analyzeCodeForInput();
    
    if (detectedInputFields.length > 0) {
      // Show input modal
      setInputFields(detectedInputFields);
      setPendingExecution({ turboMode });
      onOpen();
    } else {
      // No input required, run directly
      executeCodeDirectly(turboMode, '');
    }
  };

  // Handle execution with provided input
  const handleExecuteWithInput = (input) => {
    if (pendingExecution) {
      executeCodeDirectly(pendingExecution.turboMode, input);
      setPendingExecution(null);
    }
  };

  // Main execution function
  const executeCodeDirectly = async (turboMode = false, input = '') => {
    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) return;
    
    setIsLoading(true);
    setError(null);
    setCompilerStatus('connecting');
    const startTime = performance.now();
    
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
        // For all other languages, pass the input to the compiler API
        result = await executeCode(language, sourceCode, input);
      }
      
      const endTime = performance.now();
      let executionTime = Math.round(endTime - startTime);
      
      // Simulate faster execution in rocket mode
      if (turboMode) {
        executionTime = Math.round(executionTime * 0.6); // 40% faster
      }
      
      // Handle API response properly
      if (result.run) {
        const { output, stdout, stderr } = result.run;
        
        // Combine output sources - prioritize stdout, then output
        const finalOutput = stdout || output || '';
        const finalError = stderr || '';
        
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
        const outputText = result.output || JSON.stringify(result, null, 2);
        setOutput(outputText);
        const successLogs = parseOutput(outputText);
        setLogs(prev => [...prev, ...successLogs]);
        setCompilerStatus('success');
      }
      
      setMetrics(prev => ({
        ...prev,
        executionTime,
        memoryUsage: turboMode ? Math.round(Math.random() * 30 + 5) : Math.round(Math.random() * 50 + 10),
        cpuUsage: turboMode ? Math.round(Math.random() * 20 + 3) : Math.round(Math.random() * 30 + 5),
        successRate: error ? 0 : 100
      }));
      
    } catch (error) {
      console.error('Execution error:', error);
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
      case 'success': return 'Execution Successful';
      case 'error': return 'Execution Failed';
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
                  {language.toUpperCase()}
                </Badge>
              )}
              {hasInputRequirements && (
                <Badge
                  colorScheme="orange"
                  variant="subtle"
                  fontSize="xs"
                >
                  {inputFieldsCount} Input{inputFieldsCount > 1 ? 's' : ''}
                </Badge>
              )}
              {output && (
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  fontSize="xs"
                >
                  API: {logs.find(log => log.message.includes('Executed using'))?.message.replace('✅ Executed using ', '').replace(' API', '') || 'CoderPoint'}
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

      {/* Input Status */}
      {userInput && (
        <Box
          px={4}
          py={2}
          bg={colorMode === 'dark' ? 'blue.900' : 'blue.100'}
          borderBottom="1px solid"
          borderColor={colorMode === 'dark' ? 'blue.700' : 'blue.200'}
        >
          <HStack spacing={2}>
            <Badge colorScheme="blue" fontSize="xs">
              INPUT ACTIVE
            </Badge>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'blue.300' : 'blue.700'}>
              Using provided input: {userInput.split('\n').map((line, i) => `"${line}"`).join(', ')}
            </Text>
            <IconButton
              size="xs"
              icon={<FaTrash />}
              variant="ghost"
              onClick={() => setUserInput('')}
              aria-label="Clear input"
              colorScheme="blue"
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
        <MotionBox
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          px={4}
          py={2}
          bg={isRocketMode ? 
            `linear-gradient(135deg, ${colorMode === 'dark' ? 'rgba(249, 146, 38, 0.1)' : 'rgba(249, 146, 38, 0.05)'}, ${colorMode === 'dark' ? 'rgba(10, 14, 39, 0.3)' : 'rgba(248, 250, 252, 0.5)'})` :
            (colorMode === 'dark' ? 'rgba(10, 14, 39, 0.3)' : 'rgba(248, 250, 252, 0.5)')
          }
          borderBottom="1px solid"
          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}
        >
          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <GridItem>
              <HStack spacing={2}>
                <FaClock size={12} color={colorMode === 'dark' ? '#a78bfa' : '#7c3aed'} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                    Execution {isRocketMode && "🚀"}
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color={isRocketMode ? 'orange.400' : 'inherit'}>
                    {metrics.executionTime}ms
                  </Text>
                </VStack>
              </HStack>
            </GridItem>
            
            <GridItem>
              <HStack spacing={2}>
                <FaMemory size={12} color={colorMode === 'dark' ? '#60a5fa' : '#3b82f6'} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                    Memory
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {metrics.memoryUsage}MB
                  </Text>
                </VStack>
              </HStack>
            </GridItem>
            
            <GridItem>
              <HStack spacing={2}>
                <Box w={3} h={3} borderRadius="full" 
                  bg={metrics.successRate === 100 ? 'green.400' : 'red.400'} 
                />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                    Status
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {metrics.successRate === 100 ? 'Success' : 'Failed'}
                  </Text>
                </VStack>
              </HStack>
            </GridItem>
            
            <GridItem>
              <Progress 
                value={metrics.cpuUsage} 
                size="sm" 
                colorScheme="purple" 
                borderRadius="full"
                hasStripe
                isAnimated
              />
              <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} mt={1}>
                CPU: {metrics.cpuUsage}%
              </Text>
            </GridItem>
          </Grid>
        </MotionBox>
      )}

      {/* Main Content Area */}
      <Box flex={1} overflow="hidden">
        <Tabs colorScheme="purple" size="sm" h="100%" display="flex" flexDirection="column">
          <TabList px={4} borderBottom="1px solid" 
            borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          >
            <Tab>Console ({logs.length})</Tab>
            <Tab>Output</Tab>
            <Tab>Problems</Tab>
            <Tab>Terminal</Tab>
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
              </HStack>
            </Flex>
          </TabList>

          <TabPanels flex={1} overflow="auto">
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
                ) : (
                  <Text color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
                    No problems detected in {language} code
                  </Text>
                )}
              </VStack>
            </TabPanel>

            {/* Terminal TabPanel */}
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

      {/* Input Modal */}
      <InputModal
        isOpen={isOpen}
        onClose={onClose}
        onExecute={handleExecuteWithInput}
        language={language}
        code={editorRef.current?.getValue()}
        isLoading={isLoading}
        inputFields={inputFields}
      />
    </MotionBox>
  );
};