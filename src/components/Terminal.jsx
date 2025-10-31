import { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  useColorMode,
  IconButton,
  Tooltip,
  useToast,
  Spinner,
  Badge,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Alert,
  AlertIcon,
  AlertDescription,
  Code,
  Progress,
  Kbd
} from '@chakra-ui/react';
import {
  FaTerminal,
  FaTrash,
  FaCog,
  FaPython,
  FaNodeJs,
  FaNpm,
  FaGitAlt,
  FaDocker,
  FaSync,
  FaNetworkWired,
  FaWindows,
  FaHistory,
  FaPowerOff,
  FaBolt,
  FaChevronRight,
  FaUser,
  FaFolder,
  FaExclamationTriangle,
  FaCode,
  FaDatabase,
  FaServer
} from 'react-icons/fa';

// Piston API-based Terminal Service
class PistonTerminalService {
  constructor() {
    this.sessions = new Map();
    this.commandHistory = [];
    this.maxHistorySize = 100;
    this.currentSessionId = null;
    this.currentDirectory = '~/coderpoint';
    this.user = 'coderpoint';
    this.hostname = 'piston-terminal';
    
    // Piston API configuration
    this.pistonUrl = 'https://emkc.org/api/v2/piston';
    
    // Supported languages and their Piston mappings
    this.supportedLanguages = {
      'javascript': { name: 'javascript', version: '18.15.0' },
      'python': { name: 'python', version: '3.10.0' },
      'python3': { name: 'python', version: '3.10.0' },
      'node': { name: 'javascript', version: '18.15.0' },
      'nodejs': { name: 'javascript', version: '18.15.0' },
      'js': { name: 'javascript', version: '18.15.0' },
      'java': { name: 'java', version: '15.0.2' },
      'cpp': { name: 'cpp', version: '10.2.0' },
      'c++': { name: 'cpp', version: '10.2.0' },
      'c': { name: 'c', version: '10.2.0' },
      'go': { name: 'go', version: '1.16.2' },
      'rust': { name: 'rust', version: '1.68.2' },
      'php': { name: 'php', version: '8.2.3' },
      'ruby': { name: 'ruby', version: '3.0.1' },
      'typescript': { name: 'typescript', version: '5.0.3' },
      'ts': { name: 'typescript', version: '5.0.3' },
      'bash': { name: 'bash', version: '5.2.0' },
      'shell': { name: 'bash', version: '5.2.0' }
    };
  }

  // Initialize session
  async createSession(language = 'bash') {
    const sessionId = `piston_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      language,
      createdAt: new Date(),
      history: [],
      currentDirectory: this.currentDirectory,
      user: this.user,
      hostname: this.hostname,
      environment: {
        PATH: '/usr/local/bin:/usr/bin:/bin',
        HOME: '/home/coderpoint',
        USER: 'coderpoint',
        LANG: 'en_US.UTF-8'
      },
      files: {
        'README.md': '# Welcome to Piston Terminal\nA web-based terminal with Code execution via Cloud API.',
        'hello.js': 'console.log("Hello from Node.js!");',
        'hello.py': 'print("Hello from Python!")',
        'hello.java': 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
        'example.cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}'
      }
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    session.history.push({
      type: 'welcome',
      content: `🚀 Cloud Terminal
      
✅ Connected With Cloud

Type 'help' for available commands
Type 'languages' to see supported languages

${this.user}@${this.hostname}:${this.currentDirectory}$`,
      timestamp: new Date()
    });

    return sessionId;
  }

  // Add to command history
  addToHistory(command) {
    if (command && command.trim() && command !== this.commandHistory[0]) {
      this.commandHistory.unshift(command.trim());
      if (this.commandHistory.length > this.maxHistorySize) {
        this.commandHistory.pop();
      }
    }
  }

  // Execute code via Piston API
  async executeCode(language, code, args = []) {
    try {
      const langConfig = this.supportedLanguages[language];
      if (!langConfig) {
        throw new Error(`Language '${language}' not supported`);
      }

      const response = await fetch(`${this.pistonUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: langConfig.name,
          version: langConfig.version,
          files: [{ content: code }],
          args: args
        })
      });

      if (!response.ok) {
        throw new Error(`Cloud API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        output: data.run.stdout || data.run.stderr || '(No output)',
        success: !data.run.stderr,
        exitCode: data.run.code
      };
    } catch (error) {
      throw new Error(`Execution failed: ${error.message}`);
    }
  }

  // Get supported languages from Piston
  async getAvailableLanguages() {
    try {
      const response = await fetch(`${this.pistonUrl}/runtimes`);
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback to known languages if API fails
      return Object.values(this.supportedLanguages).map(lang => ({
        language: lang.name,
        version: lang.version
      }));
    }
  }

  // Main command execution
  async executeCommand(sessionId, command) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const trimmedCommand = command.trim();
    if (!trimmedCommand) return { output: '', success: true };

    this.addToHistory(trimmedCommand);

    session.history.push({
      type: 'input',
      content: `${session.user}@${session.hostname}:${session.currentDirectory}$ ${trimmedCommand}`,
      timestamp: new Date(),
      rawCommand: trimmedCommand
    });

    try {
      const result = await this.processCommand(session, trimmedCommand);
      
      session.history.push({
        type: 'output',
        content: result.output,
        timestamp: new Date(),
        success: result.success
      });

      return result;
    } catch (error) {
      const errorOutput = {
        type: 'error',
        content: `ERROR: ${error.message}`,
        timestamp: new Date(),
        success: false
      };
      
      session.history.push(errorOutput);
      return { output: errorOutput.content, success: false };
    }
  }

  // Process commands
  async processCommand(session, command) {
    const lowerCommand = command.toLowerCase().trim();
    const args = command.split(' ').slice(1);
    const fullArgs = command.split(' ');

    // Built-in commands
    if (lowerCommand === 'help' || lowerCommand === '--help') {
      return { output: this.getHelpText(), success: true };
    }

    if (lowerCommand === 'languages' || lowerCommand === 'langs') {
      const languages = await this.getAvailableLanguages();
      let output = 'Available languages:\n\n';
      languages.forEach(lang => {
        output += `  ${lang.language} (${lang.version})\n`;
      });
      output += '\nUsage: node <file.js> | python <file.py> | java <file.java> | etc.';
      return { output, success: true };
    }

    if (lowerCommand === 'clear' || lowerCommand === 'cls') {
      session.history = session.history.filter(item => item.type === 'welcome');
      return { output: '', success: true };
    }

    if (lowerCommand === 'pwd') {
      return { output: session.currentDirectory, success: true };
    }

    if (lowerCommand === 'whoami') {
      return { output: session.user, success: true };
    }

    if (lowerCommand === 'hostname') {
      return { output: session.hostname, success: true };
    }

    if (lowerCommand === 'ls' || lowerCommand === 'dir') {
      const files = Object.keys(session.files);
      let output = 'Files in current directory:\n\n';
      files.forEach(file => {
        output += `  ${file}\n`;
      });
      output += `\nTotal: ${files.length} files`;
      return { output, success: true };
    }

    if (lowerCommand === 'history') {
      if (this.commandHistory.length === 0) {
        return { output: 'No command history', success: true };
      }
      let output = 'Command history:\n\n';
      this.commandHistory.slice().reverse().forEach((cmd, index) => {
        output += `  ${(index + 1).toString().padStart(3)}  ${cmd}\n`;
      });
      return { output, success: true };
    }

    // Code execution commands
    const executionMatch = command.match(/^(node|python|python3|js|java|cpp|g\+\+|gcc|go|rust|php|ruby|typescript|ts)\s+(.+)$/);
    if (executionMatch) {
      const language = executionMatch[1];
      const codeOrFile = executionMatch[2];
      
      // Check if it's a file in session
      if (session.files[codeOrFile]) {
        return await this.executeCode(language, session.files[codeOrFile]);
      } else {
        // Treat as inline code
        return await this.executeCode(language, codeOrFile);
      }
    }

    // Direct file execution
    const fileMatch = command.match(/^\.\/(\S+)$/);
    if (fileMatch) {
      const filename = fileMatch[1];
      if (session.files[filename]) {
        const fileContent = session.files[filename];
        const fileExt = filename.split('.').pop();
        const langMap = {
          'js': 'javascript',
          'py': 'python',
          'java': 'java',
          'cpp': 'cpp',
          'c': 'c',
          'go': 'go',
          'rs': 'rust',
          'php': 'php',
          'rb': 'ruby',
          'ts': 'typescript'
        };
        
        const language = langMap[fileExt];
        if (language) {
          return await this.executeCode(language, fileContent);
        } else {
          return { output: `Cannot execute ${filename}: Unsupported file type`, success: false };
        }
      } else {
        return { output: `File not found: ${filename}`, success: false };
      }
    }

    // Cat command to show file content
    if (command.startsWith('cat ')) {
      const filename = args[0];
      if (session.files[filename]) {
        return { output: session.files[filename], success: true };
      } else {
        return { output: `File not found: ${filename}`, success: false };
      }
    }

    // Echo command
    if (command.startsWith('echo ')) {
      return { output: args.join(' '), success: true };
    }

    // If no built-in command matches, try to execute as bash script
    if (!command.includes(' ')) {
      // Single word commands that might be bash scripts
      return await this.executeCode('bash', command);
    }

    // Default: command not found
    return {
      output: `Command not found: ${fullArgs[0]}\nType 'help' for available commands.`,
      success: false
    };
  }

  // Utility Methods
  getHelpText() {
    return `
🚀 Cloud Terminal Help

REAL CODE EXECUTION via Cloud API!

📝 BASIC COMMANDS:
  help                    Show this help message
  languages               Show supported programming languages
  clear, cls              Clear terminal
  pwd                     Show current directory
  whoami                  Show current user
  hostname                Show system hostname
  ls, dir                 List files
  history                 Show command history
  cat <file>              Show file content
  echo <text>             Print text

💻 CODE EXECUTION:
  node <file.js>          Run JavaScript/Node.js code
  node <code>             Execute inline JavaScript
  python <file.py>        Run Python code
  python <code>           Execute inline Python
  java <file.java>        Run Java code
  cpp <file.cpp>          Run C++ code
  go <file.go>            Run Go code
  rust <file.rs>          Run Rust code
  php <file.php>          Run PHP code
  ruby <file.rb>          Run Ruby code
  ./<file>                Execute file (auto-detect language)

📚 EXAMPLES:
  node hello.js           Run JavaScript file
  python hello.py         Run Python file
  java hello.java         Run Java file
  node "console.log(1+2)" Execute inline JavaScript
  python "print(3*4)"     Execute inline Python

🌐 SUPPORTED LANGUAGES:
  JavaScript, Python, Java, C++, C, Go, Rust, PHP, Ruby, TypeScript, Bash

All code is executed in real-time via Cloud API!
    `;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  destroySession(sessionId) {
    this.sessions.delete(sessionId);
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }
}

// Create global terminal service instance
const terminalService = new PistonTerminalService();

export const Terminal = ({ isVisible = true }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  const [sessionId, setSessionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize terminal
  useEffect(() => {
    const initializeTerminal = async () => {
      try {
        const newSessionId = await terminalService.createSession('bash');
        setSessionId(newSessionId);
        
        const session = terminalService.getSession(newSessionId);
        setHistory([...session.history]);

        toast({
          title: "Cloud Terminal Ready",
          description: "Code execution via Cloud API",
          status: "success",
          duration: 3000,
          isClosable: true
        });
      } catch (error) {
        toast({
          title: "Terminal Initialization Failed",
          description: error.message,
          status: "error",
          duration: 3000
        });
      }
    };

    if (isVisible) {
      initializeTerminal();
    }

    return () => {
      if (sessionId) {
        terminalService.destroySession(sessionId);
      }
    };
  }, [isVisible, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        handleClear();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateHistory(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateHistory(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateHistory = (direction) => {
    if (terminalService.commandHistory.length === 0) return;
    
    let newIndex = historyIndex + direction;
    if (newIndex < -1) newIndex = -1;
    if (newIndex >= terminalService.commandHistory.length) newIndex = terminalService.commandHistory.length - 1;
    
    setHistoryIndex(newIndex);
    setInput(newIndex === -1 ? '' : terminalService.commandHistory[newIndex]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isLoading) return;

    const command = input;
    setInput('');
    setHistoryIndex(-1);
    setIsLoading(true);

    try {
      await terminalService.executeCommand(sessionId, command);
      const session = terminalService.getSession(sessionId);
      setHistory([...session.history]);
    } catch (error) {
      toast({
        title: "Command Failed",
        description: error.message,
        status: "error",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (sessionId) {
      const session = terminalService.getSession(sessionId);
      if (session) {
        session.history = session.history.filter(item => item.type === 'welcome');
        setHistory([...session.history]);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <Box
      h="100%"
      bg="gray.900"
      color="white"
      fontFamily="'Cascadia Code', 'Consolas', monospace"
      borderRadius="md"
      overflow="hidden"
      boxShadow="2xl"
      border="1px solid"
      borderColor="gray.700"
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <HStack
        bg="blue.600"
        px={4}
        py={2}
        justify="space-between"
        borderBottom="1px solid"
        borderColor="blue.700"
      >
        <HStack spacing={3}>
          <FaCode />
          <Text fontSize="sm" fontWeight="bold">
            Cloud Terminal
          </Text>
        </HStack>
        
        <HStack spacing={2}>
          <Badge colorScheme="blue" fontSize="xs">
            Connected
          </Badge>
          
          <Tooltip label="Clear (Ctrl+L)">
            <IconButton
              icon={<FaTrash />}
              size="xs"
              variant="ghost"
              color="white"
              onClick={handleClear}
              aria-label="Clear terminal"
            />
          </Tooltip>

          <Tooltip label="Command History">
            <IconButton
              icon={<FaHistory />}
              size="xs"
              variant="ghost"
              color="white"
              onClick={() => {
                setInput('history');
                inputRef.current?.focus();
              }}
              aria-label="Command history"
            />
          </Tooltip>
        </HStack>
      </HStack>

      {/* Terminal Content */}
      <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
        {/* Terminal Output */}
        <Box
          ref={terminalRef}
          flex={1}
          overflowY="auto"
          p={4}
          fontSize="13px"
          lineHeight="1.4"
          bg="gray.900"
          css={{
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }
          }}
        >
          <VStack align="stretch" spacing={2}>
            {history.map((item, index) => (
              <Box key={index}>
                {item.type === 'input' && (
                  <HStack spacing={2} align="flex-start">
                    <Text color="green.300" fontWeight="bold" userSelect="none">
                      {item.content.split('$')[0]}{'$'}
                    </Text>
                    <Text color="white">{item.rawCommand}</Text>
                  </HStack>
                )}
                
                {(item.type === 'output' || item.type === 'welcome') && (
                  <Text whiteSpace="pre-wrap" color="gray.100" fontFamily="'Cascadia Code', monospace">
                    {item.content}
                  </Text>
                )}
                
                {item.type === 'error' && (
                  <Text color="red.300" fontFamily="'Cascadia Code', monospace">{item.content}</Text>
                )}
              </Box>
            ))}
            
            {isLoading && (
              <HStack spacing={2}>
                <Spinner size="sm" color="blue.400" />
                <Text color="gray.400">Executing via Cloud API...</Text>
              </HStack>
            )}
          </VStack>
        </Box>

        {/* Input Line */}
        <Box
          p={3}
          borderTop="1px solid"
          borderColor="gray.700"
          bg="gray.800"
        >
          <form onSubmit={handleSubmit}>
            <HStack spacing={2}>
              <Text color="green.300" fontWeight="bold" userSelect="none" fontSize="sm">
                {terminalService.getSession(sessionId)?.user || 'user'}@
                {terminalService.getSession(sessionId)?.hostname || 'terminal'}:
                {terminalService.getSession(sessionId)?.currentDirectory || '~'}$
              </Text>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter command or code..."
                variant="unstyled"
                color="white"
                fontSize="13px"
                fontFamily="'Cascadia Code', monospace"
                isDisabled={isLoading}
                autoComplete="off"
                _placeholder={{ color: 'gray.500' }}
              />
              <IconButton
                icon={<FaChevronRight />}
                size="sm"
                type="submit"
                isLoading={isLoading}
                isDisabled={!input.trim()}
                aria-label="Execute command"
                colorScheme="blue"
                variant="ghost"
              />
            </HStack>
          </form>
          
          <HStack spacing={4} mt={2} fontSize="xs" color="gray.500">
            <Text><Kbd>↑↓</Kbd> History</Text>
            <Text><Kbd>Ctrl+L</Kbd> Clear</Text>
            <Text><Kbd>Enter</Kbd> Execute</Text>
            <Text>🚀 Code execution via Cloud</Text>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Terminal;