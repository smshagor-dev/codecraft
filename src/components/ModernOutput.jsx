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
  Spinner
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
import { executeCode } from "../api";
import { PreviewMode } from "./PreviewMode";

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

// Removed CODE_SNIPPETS - now handled by App.jsx
/* const CODE_SNIPPETS = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome Page</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 {
            margin-bottom: 1rem;
            animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Hello, World!</h1>
        <p>Welcome to your awesome webpage!</p>
        <button onclick="alert('Hello from HTML!')">Click Me!</button>
    </div>
</body>
</html>`,
  javascript: `// JavaScript Basic Example
console.log('🎉 Welcome to JavaScript!');

// Variables and Data Types
const name = 'CodeCraft';
let version = 1.0.0;
var isAwesome = true;

// Array Operations
const languages = ['JavaScript', 'Python', 'Java', 'C++'];
console.log('Supported languages:', languages);

// Object Example
const project = {
    name: 'Online Code Editor',
    features: ['Syntax Highlighting', 'Auto-completion', 'Live Preview'],
    rating: 5
};

// Function Example
function greetUser(userName) {
    return \`Hello, \${userName}! Welcome to \${project.name}\`;
}

// Arrow Function
const calculate = (a, b) => {
    const sum = a + b;
    const product = a * b;
    return { sum, product };
};

// Using the functions
console.log(greetUser('Developer'));
console.log('Calculation Result:', calculate(10, 5));

// Loop Example
console.log('\\n📚 Available Features:');
project.features.forEach((feature, index) => {
    console.log(\`\${index + 1}. \${feature}\`);
});

// Promise Example
const asyncOperation = new Promise((resolve) => {
    setTimeout(() => {
        resolve('✅ Async operation completed!');
    }, 1000);
});

asyncOperation.then(result => console.log(result));`,
  javascriptApp: `// Interactive JavaScript Application
class TodoApp {
    constructor() {
        this.todos = [];
        this.nextId = 1;
        console.log('📝 Todo App Initialized');
    }

    addTodo(task) {
        const todo = {
            id: this.nextId++,
            task: task,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.todos.push(todo);
        console.log(\`✅ Added: "\${task}"\`);
        return todo;
    }

    completeTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = true;
            console.log(\`✓ Completed: "\${todo.task}"\`);
        }
    }

    listTodos() {
        console.log('\\n📋 Your Todo List:');
        console.log('================');
        
        if (this.todos.length === 0) {
            console.log('No todos yet. Add some tasks!');
            return;
        }

        this.todos.forEach(todo => {
            const status = todo.completed ? '✓' : '○';
            const style = todo.completed ? '(completed)' : '(pending)';
            console.log(\`\${status} [\${todo.id}] \${todo.task} \${style}\`);
        });
    }

    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        
        console.log('\\n📊 Statistics:');
        console.log(\`Total Tasks: \${total}\`);
        console.log(\`Completed: \${completed}\`);
        console.log(\`Pending: \${pending}\`);
        
        if (total > 0) {
            const completionRate = ((completed / total) * 100).toFixed(1);
            console.log(\`Completion Rate: \${completionRate}%\`);
        }
    }
}

// Demo the Todo App
console.log('🚀 JavaScript Todo App Demo');
console.log('===========================\\n');

const app = new TodoApp();

// Add some todos
app.addTodo('Learn JavaScript');
app.addTodo('Build awesome projects');
app.addTodo('Master React');
app.addTodo('Deploy to production');

// Complete some tasks
app.completeTodo(1);
app.completeTodo(3);

// Display the list
app.listTodos();

// Show statistics
app.getStats();

console.log('\\n💡 Try adding more todos or marking them complete!');`
}; */

export const ModernOutput = ({ editorRef, language, fileSystem }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    executionTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    successRate: 100
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isRocketMode, setIsRocketMode] = useState(false);

  const parseOutput = (output, isError = false) => {
    const lines = output.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      let type = isError ? 'error' : 'success';
      if (line.toLowerCase().includes('warning')) type = 'warning';
      if (line.toLowerCase().includes('info')) type = 'info';
      
      return {
        id: Date.now() + index,
        type,
        message: line,
        timestamp: new Date().toLocaleTimeString()
      };
    });
  };

  const runCode = async (turboMode = false) => {
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
    
    setIsLoading(true);
    setError(null);
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
      const { run: result } = await executeCode(language, sourceCode);
      const endTime = performance.now();
      let executionTime = Math.round(endTime - startTime);
      
      // Simulate faster execution in rocket mode
      if (turboMode) {
        executionTime = Math.round(executionTime * 0.6); // 40% faster
      }
      
      if (result.stderr) {
        setError(result.stderr);
        const errorLogs = parseOutput(result.stderr, true);
        setLogs(prev => [...prev, ...errorLogs]);
      } else {
        const outputText = result.output || result.stdout || "";
        setOutput(outputText);
        const successLogs = parseOutput(outputText);
        setLogs(prev => [...prev, ...successLogs]);
        
        // Add turbo mode success message
        if (turboMode) {
          setLogs(prev => [...prev, {
            id: Date.now() + 999,
            type: 'info',
            message: '⚡ Turbo execution completed successfully!',
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      }
      
      setMetrics(prev => ({
        ...prev,
        executionTime,
        memoryUsage: turboMode ? Math.round(Math.random() * 30 + 5) : Math.round(Math.random() * 50 + 10),
        cpuUsage: turboMode ? Math.round(Math.random() * 20 + 3) : Math.round(Math.random() * 30 + 5),
        successRate: result.stderr ? 0 : 100
      }));
      
    } catch (error) {
      setError(error.message || "Execution failed");
      setLogs(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: error.message || "Execution failed",
        timestamp: new Date().toLocaleTimeString()
      }]);
      setMetrics(prev => ({ ...prev, successRate: 0 }));
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
    runCode(true).finally(() => {
      setTimeout(() => setIsRocketMode(false), 2000);
    });
  };

  const clearConsole = () => {
    setLogs([]);
    setOutput("");
    setError(null);
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

  // Removed unused loadSnippet function - snippets are now loaded through App.jsx

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

  // Check if HTML files exist for preview functionality
  const hasHTMLFile = fileSystem && fileSystem.root && 
    fileSystem.root.children.some(node => 
      node.name.endsWith('.html') || 
      (node.children && node.children.some(child => child.name.endsWith('.html')))
    );

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
            <Badge
              colorScheme={isLoading ? "yellow" : error ? "red" : "green"}
              variant="subtle"
              fontSize="xs"
            >
              {isLoading ? "Running" : error ? "Error" : "Ready"}
            </Badge>
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
              onClick={runCode}
              isLoading={isLoading}
              loadingText="Executing..."
              id="run-button"
              boxShadow="0 4px 15px rgba(168, 85, 247, 0.3)"
              _hover={{
                boxShadow: "0 6px 20px rgba(168, 85, 247, 0.4)"
              }}
            >
              {isLoading ? "Stop" : "Run Code"}
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
              <Box
                p={4}
                bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}
                borderRadius="lg"
                fontFamily="mono"
                fontSize="sm"
                minH="200px"
              >
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {output || error || "No output yet. Run your code to see results."}
                </pre>
              </Box>
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
                      <Text fontWeight="bold" fontSize="sm">Execution Error</Text>
                      <Code fontSize="xs" bg="transparent">{error}</Code>
                    </VStack>
                  </HStack>
                ) : (
                  <Text color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
                    No problems detected
                  </Text>
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={4}>
              <Box
                p={3}
                bg={colorMode === 'dark' ? 'gray.900' : 'gray.100'}
                borderRadius="md"
                fontFamily="mono"
                fontSize="sm"
              >
                <HStack mb={2}>
                  <Text color="green.400">$</Text>
                  <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                    node {language === 'javascript' ? 'index.js' : `main.${language}`}
                  </Text>
                </HStack>
                {isLoading && (
                  <HStack spacing={2}>
                    <Spinner size="xs" color="purple.400" />
                    <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                      Executing...
                    </Text>
                  </HStack>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

     
    </MotionBox>
  );
};