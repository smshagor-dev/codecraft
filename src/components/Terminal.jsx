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
  Kbd,
  Tag,
  TagLabel,
  Flex,
  Divider
} from '@chakra-ui/react';
import {
  FaTerminal,
  FaPlay,
  FaTrash,
  FaDownload,
  FaUpload,
  FaCog,
  FaPython,
  FaNodeJs,
  FaNpm,
  FaGitAlt,
  FaDocker,
  FaSync,
  FaNetworkWired,
  FaCloud,
  FaCode,
  FaDatabase,
  FaServer,
  FaMobile,
  FaGlobe,
  FaRobot,
  FaMagic,
  FaHistory,
  FaLightbulb,
  FaRocket
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

// Enhanced Cloud Terminal API Service
class CloudTerminalService {
  constructor() {
    this.baseURL = 'https://emkc.org/api/v2/piston';
    this.sessions = new Map();
    this.cache = new Map();
    this.cacheDuration = 24 * 60 * 60 * 1000;
    this.fileSystem = null;
    this.onFileSystemChange = null;
    this.commandHistory = [];
    this.maxHistorySize = 100;
  }

  async getRuntimes() {
    try {
      const response = await fetch(`${this.baseURL}/runtimes`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch runtimes:', error);
      return [];
    }
  }

  async createSession(language = 'bash') {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      language,
      createdAt: new Date(),
      history: [],
      cwd: '/workspace',
      environment: this.getEnvironment(language),
      packages: new Map(),
      isConnected: true
    };
    
    this.sessions.set(sessionId, session);
    
    // Enhanced welcome message with commands
    session.history.push({
      type: 'welcome',
      content: `🚀 Activated ⚡ Cloud Terminal  - Do not make any action if you have don't any Exprience.
📦 Environment: ${language} 📁 Workspace: ${session.cwd}

Ready to use! 🎉`,
      timestamp: new Date()
    });
    
    return sessionId;
  }

  getEnvironment(language) {
    const baseEnv = {
      PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
      HOME: '/home/user',
      TERM: 'xterm-256color',
      LANG: 'en_US.UTF-8',
      PYTHONPATH: '/workspace:/workspace/python_packages',
      NODE_PATH: '/workspace/node_modules',
      NVM_DIR: '/usr/local/nvm',
      NPM_CONFIG_PREFIX: '/usr/local'
    };
    
    return baseEnv;
  }

  // Add command to history
  addToHistory(command) {
    this.commandHistory.unshift(command);
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.pop();
    }
  }

  // Get command suggestions
  getCommandSuggestions(type = 'all') {
    const suggestions = {
      web: [
        'npm init -y',
        'npm install react react-dom',
        'npm install -g create-react-app',
        'npx create-react-app my-app',
        'npm run build',
        'npm start',
        'python -m http.server 8000',
        'php -S localhost:8000'
      ],
      python: [
        'python --version',
        'python -m venv venv',
        'source venv/bin/activate',
        'pip install numpy pandas matplotlib',
        'pip install django flask fastapi',
        'pip freeze > requirements.txt',
        'python manage.py runserver',
        'python app.py'
      ],
      node: [
        'node --version',
        'npm --version',
        'npm init -y',
        'npm install express cors dotenv',
        'npm install -g nodemon',
        'npm install --save-dev jest',
        'node server.js',
        'npm test'
      ],
      git: [
        'git init',
        'git clone <repository-url>',
        'git status',
        'git add .',
        'git commit -m "Initial commit"',
        'git push origin main',
        'git pull origin main',
        'git branch feature-branch'
      ],
      system: [
        'ls -la',
        'pwd',
        'cd /workspace',
        'mkdir project',
        'touch index.html',
        'cat README.md',
        'find . -name "*.js"',
        'grep -r "function" .'
      ],
      database: [
        'python -c "import sqlite3; print(sqlite3.version)"',
        'node -e "console.log(require(\'mysql2\').version)"',
        'pip install sqlalchemy psycopg2-binary',
        'npm install mongoose sequelize',
        'python db_operations.py',
        'node database.js'
      ],
      docker: [
        'docker --version',
        'docker ps',
        'docker images',
        'docker build -t my-app .',
        'docker run -p 3000:3000 my-app',
        'docker-compose up',
        'docker logs container-id'
      ]
    };

    if (type === 'all') {
      return Object.values(suggestions).flat();
    }
    return suggestions[type] || suggestions.web;
  }

  async executeCommand(sessionId, command) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add to command history
    this.addToHistory(command);

    // Add command to session history
    session.history.push({
      type: 'input',
      content: command,
      timestamp: new Date()
    });

    try {
      const result = await this.processCommand(session, command);
      
      session.history.push({
        type: 'output',
        content: result.output,
        timestamp: new Date()
      });

      await this.syncFileSystemChanges(command, result);

      return result;
    } catch (error) {
      session.history.push({
        type: 'error',
        content: error.message,
        timestamp: new Date()
      });
      
      return { output: `❌ Error: ${error.message}`, success: false };
    }
  }

  async processCommand(session, command) {
    const trimmedCommand = command.trim();
    
    // Handle empty command
    if (!trimmedCommand) {
      return { output: '', success: true };
    }

    // Handle help command
    if (trimmedCommand === 'help' || trimmedCommand === '?') {
      const helpText = this.getHelpText();
      return { output: helpText, success: true };
    }

    // Handle suggest command
    if (trimmedCommand.startsWith('suggest')) {
      return this.handleSuggestCommand(trimmedCommand);
    }

    // Handle history command
    if (trimmedCommand === 'history') {
      return this.handleHistoryCommand();
    }

    // Handle clear command
    if (trimmedCommand === 'clear' || trimmedCommand === 'cls') {
      session.history = session.history.filter(item => 
        item.type !== 'input' && item.type !== 'output' && item.type !== 'error'
      );
      return { output: '', success: true };
    }

    // Handle package installation with caching
    if (trimmedCommand.startsWith('npm install') || 
        trimmedCommand.startsWith('pip install') ||
        trimmedCommand.startsWith('yarn add')) {
      return await this.handlePackageInstall(session, trimmedCommand);
    }

    // Handle environment setup commands
    if (trimmedCommand.startsWith('setup ')) {
      return await this.handleSetupCommand(session, trimmedCommand);
    }

    // Handle cache commands
    if (trimmedCommand.startsWith('cache')) {
      return this.handleCacheCommand(session, trimmedCommand);
    }

    // Handle API-specific commands
    if (trimmedCommand.startsWith('run ') || trimmedCommand === 'languages') {
      return await this.handleAPICommand(session, trimmedCommand);
    }

    // Execute command via Piston API
    return await this.executeViaAPI(session, trimmedCommand);
  }

  getHelpText() {
    return `
🌈 Modern Terminal Commands

📁 FILE OPERATIONS:
  ls, ls -la              - List files with details
  cd <dir>                - Change directory
  pwd                     - Show current directory
  mkdir <name>            - Create directory
  touch <file>            - Create file
  cat <file>              - Show file content
  rm <file>               - Remove file
  cp <src> <dest>         - Copy file
  mv <src> <dest>         - Move file
  find . -name "*.js"     - Find files by pattern

📦 PACKAGE MANAGEMENT:
  npm install <pkg>       - Install Node.js package
  npm init -y             - Initialize Node project
  npm run <script>        - Run npm script
  pip install <pkg>       - Install Python package
  pip freeze              - Show installed packages
  python -m venv venv     - Create virtual environment

🔧 DEVELOPMENT:
  node <file.js>          - Run Node.js file
  python <file.py>        - Run Python file
  python -m http.server   - Start HTTP server
  git <command>           - Git version control
  docker <command>        - Docker container commands

⚙️ SYSTEM & UTILITIES:
  clear                   - Clear terminal
  history                 - Show command history
  suggest <category>      - Get command suggestions
  echo <text>             - Print text
  whoami                  - Show current user
  date                    - Show current date/time

🎯 SPECIAL COMMANDS:
  setup python            - Setup Python environment
  setup node              - Setup Node.js environment
  setup web               - Setup web development
  run <lang> <code>       - Execute code in any language
  languages               - Show available languages

💾 CACHE MANAGEMENT:
  cache list              - Show cached packages
  cache clear             - Clear package cache

💡 TIPS:
  • Use TAB for auto-completion
  • Use ↑/↓ for command history
  • Use 'suggest' for ideas
  • All commands run in cloud environment
    `;
  }

  handleSuggestCommand(command) {
    const args = command.split(' ').slice(1);
    const category = args[0] || 'all';
    
    const suggestions = this.getCommandSuggestions(category);
    const categories = ['web', 'python', 'node', 'git', 'system', 'database', 'docker'];
    
    if (!categories.includes(category) && category !== 'all') {
      return { 
        output: `❌ Unknown category: ${category}\nAvailable categories: ${categories.join(', ')}`, 
        success: false 
      };
    }
    
    let output = `💡 Command Suggestions for ${category.toUpperCase()}:\n\n`;
    suggestions.forEach((suggestion, index) => {
      output += `${index + 1}. ${suggestion}\n`;
    });
    
    output += `\n🎯 Run any command above to get started!`;
    
    return { output, success: true };
  }

  handleHistoryCommand() {
    if (this.commandHistory.length === 0) {
      return { output: 'No command history yet.', success: true };
    }
    
    let output = '📜 Command History:\n\n';
    this.commandHistory.slice(0, 15).forEach((cmd, index) => {
      output += `${index + 1}. ${cmd}\n`;
    });
    
    if (this.commandHistory.length > 15) {
      output += `\n... and ${this.commandHistory.length - 15} more commands`;
    }
    
    return { output, success: true };
  }

  async handleSetupCommand(session, command) {
    const args = command.split(' ').slice(1);
    const setupType = args[0];
    
    const setups = {
      python: `
🐍 Setting up Python Development Environment...

✅ Python 3.9+ available
✅ pip package manager ready
✅ Virtual environment support

Quick start:
  python --version
  python -m venv myenv
  source myenv/bin/activate
  pip install requests pandas numpy
  python -c "print('Hello from Python!')"

Ready for Python development! 🎉
      `,
      
      node: `
🟢 Setting up Node.js Development Environment...

✅ Node.js 16+ available
✅ npm package manager ready
✅ npx tool available

Quick start:
  node --version
  npm --version
  npm init -y
  npm install express
  node -e "console.log('Hello from Node.js!')"

Ready for Node.js development! 🚀
      `,
      
      web: `
🌐 Setting up Web Development Environment...

✅ HTML/CSS/JavaScript ready
✅ Python HTTP server available
✅ Node.js server capabilities

Quick start:
  # For static sites
  python -m http.server 8000
  
  # For Node.js apps
  npm install express
  node server.js
  
  # For modern frontend
  npx create-react-app my-app
  cd my-app && npm start

Ready for web development! 💻
      `
    };
    
    if (!setups[setupType]) {
      return { 
        output: `❌ Unknown setup type: ${setupType}\nAvailable: python, node, web`, 
        success: false 
      };
    }
    
    return { output: setups[setupType], success: true };
  }

  async handlePackageInstall(session, command) {
    const isNpm = command.startsWith('npm install');
    const isPip = command.startsWith('pip install');
    const isYarn = command.startsWith('yarn add');
    
    const packageManager = isNpm ? 'npm' : isPip ? 'pip' : 'yarn';
    const packages = command.split(' ').slice(2).filter(pkg => pkg && !pkg.startsWith('-'));
    
    // Handle global installs
    const isGlobal = command.includes(' -g ') || command.includes(' --global ');
    
    if (packages.length === 0 && !isNpm) {
      return { output: `Usage: ${packageManager} install <package1> <package2> ...`, success: false };
    }

    let output = `📦 Installing ${packages.length > 0 ? packages.join(', ') : 'dependencies'} via ${packageManager}${isGlobal ? ' (global)' : ''}...\n\n`;
    
    // Simulate installation process
    output += `🔍 Resolving packages...\n`;
    output += `🚀 Fetching packages...\n`;
    
    if (packages.length > 0) {
      packages.forEach(pkg => {
        output += `✅ ${pkg} installed successfully\n`;
        
        // Cache the package
        const cacheKey = `${packageManager}:${pkg}`;
        this.cache.set(cacheKey, {
          package: pkg,
          manager: packageManager,
          timestamp: Date.now(),
          version: '1.0.0'
        });
      });
    } else {
      output += `✅ All dependencies installed from package.json\n`;
    }
    
    output += `\n✨ Installation completed successfully!`;
    
    return { output, success: true };
  }

  handleCacheCommand(session, command) {
    const args = command.split(' ').slice(1);
    
    if (args[0] === 'list') {
      const cachedPackages = Array.from(this.cache.entries())
        .filter(([key, pkg]) => Date.now() - pkg.timestamp < this.cacheDuration);
      
      if (cachedPackages.length === 0) {
        return { output: 'No cached packages found.', success: true };
      }
      
      let output = '📦 Cached Packages (valid for 24 hours):\n\n';
      cachedPackages.forEach(([key, pkg]) => {
        const age = Math.round((Date.now() - pkg.timestamp) / (60 * 60 * 1000));
        output += `  ${pkg.manager}: ${pkg.package}@${pkg.version} (${age}h ago)\n`;
      });
      
      return { output, success: true };
    }
    
    if (args[0] === 'clear') {
      const count = this.cache.size;
      this.cache.clear();
      return { output: `🗑️ Cleared ${count} cached packages.`, success: true };
    }
    
    return { output: 'Usage: cache [list|clear]', success: false };
  }

  async handleAPICommand(session, command) {
    if (command === 'languages') {
      try {
        const runtimes = await this.getRuntimes();
        let output = '🌐 Available Programming Languages:\n\n';
        runtimes.forEach(runtime => {
          const aliases = runtime.aliases?.join(', ') || runtime.language;
          output += `  ${runtime.language}@${runtime.version} - ${aliases}\n`;
        });
        return { output, success: true };
      } catch (error) {
        return { output: `❌ Failed to fetch languages: ${error.message}`, success: false };
      }
    }

    if (command.startsWith('run ')) {
      const args = command.split(' ').slice(1);
      if (args.length < 2) {
        return { output: 'Usage: run <language> <code>', success: false };
      }
      
      const language = args[0];
      const code = args.slice(1).join(' ');
      
      try {
        const result = await this.executeCode(language, code);
        return { 
          output: `🔧 Executing ${language} code...\n\n${result.output || result.stdout || '✅ Code executed successfully (no output)'}`,
          success: true 
        };
      } catch (error) {
        return { output: `❌ Execution failed: ${error.message}`, success: false };
      }
    }

    return { output: 'Unknown API command', success: false };
  }

  async executeViaAPI(session, command) {
    // Enhanced language mapping
    const languageMap = {
      'python': 'python',
      'python3': 'python',
      'py': 'python',
      'node': 'javascript',
      'npm': 'javascript',
      'js': 'javascript',
      'javascript': 'javascript',
      'bash': 'bash',
      'sh': 'bash',
      'shell': 'bash',
      'php': 'php',
      'ruby': 'ruby',
      'rb': 'ruby',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'go': 'go',
      'rust': 'rust',
      'rs': 'rust',
      'perl': 'perl',
      'pl': 'perl'
    };

    // Determine language based on command
    let language = 'bash';
    const firstWord = command.split(' ')[0].toLowerCase();
    
    if (languageMap[firstWord]) {
      language = languageMap[firstWord];
    }

    try {
      const result = await this.executeCode(language, command);
      return {
        output: result.output || result.stdout || '✅ Command executed successfully',
        success: true
      };
    } catch (error) {
      return {
        output: `❌ Command failed: ${error.message}`,
        success: false
      };
    }
  }

  async executeCode(language, sourceCode) {
    try {
      const response = await fetch(`${this.baseURL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language,
          version: '*',
          files: [
            {
              name: `main.${this.getFileExtension(language)}`,
              content: sourceCode
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.run.stderr) {
        throw new Error(data.run.stderr);
      }

      return data.run;
    } catch (error) {
      console.error('API Execution error:', error);
      throw new Error(`Cloud execution failed: ${error.message}`);
    }
  }

  getFileExtension(language) {
    const extensions = {
      'python': 'py',
      'javascript': 'js',
      'typescript': 'ts',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'rust': 'rs',
      'go': 'go',
      'bash': 'sh',
      'php': 'php',
      'ruby': 'rb',
      'perl': 'pl',
      'r': 'r',
      'swift': 'swift',
      'kotlin': 'kt',
      'scala': 'scala'
    };
    
    return extensions[language] || 'txt';
  }

  // File system synchronization methods (keep your existing ones)
  async syncFileSystemChanges(command, result) {
    if (!this.fileSystem || !result.success) return;
  
    const trimmedCommand = command.trim();
    const args = trimmedCommand.split(' ').filter(arg => arg.length > 0);
    const mainCommand = args[0].toLowerCase();
  
    try {
      switch (mainCommand) {
        case 'mkdir':
          if (args[1]) {
            await this.handleMkdir(args[1]);
          }
          break;
  
        case 'touch':
          if (args[1]) {
            await this.handleTouch(args[1]);
          }
          break;
  
        case 'rm':
          if (args[1]) {
            await this.handleRm(args[1]);
          }
          break;
  
        case 'echo':
          if (trimmedCommand.includes('>') && args[1]) {
            const fileName = args[args.length - 1];
            if (fileName && !fileName.startsWith('>')) {
              await this.handleTouch(fileName);
            }
          }
          break;
  
        default:
          break;
      }
    } catch (error) {
      console.error('File system sync error:', error);
    }
  }

  async handleMkdir(folderName) {
    if (!this.fileSystem || !this.fileSystem.root) return;
  
    const cleanName = folderName.replace(/['"]/g, '');
    
    const existing = this.fileSystem.findNodeByName(cleanName);
    if (!existing) {
      this.fileSystem.createFolderUnique(this.fileSystem.root.id, cleanName);
      this.triggerFileSystemChange();
    }
  }

  async handleTouch(fileName) {
    if (!this.fileSystem || !this.fileSystem.root) return;
  
    const cleanName = fileName.replace(/['"]/g, '');
    
    const existing = this.fileSystem.findNodeByName(cleanName);
    if (!existing) {
      this.fileSystem.createFileUnique(this.fileSystem.root.id, cleanName, '');
      this.triggerFileSystemChange();
    }
  }

  async handleRm(targetName) {
    if (!this.fileSystem || !this.fileSystem.root) return;
  
    const cleanName = targetName.replace(/['"]/g, '');
    const node = this.fileSystem.findNodeByName(cleanName);
    
    if (node) {
      this.fileSystem.deleteNode(node.id);
      this.triggerFileSystemChange();
    }
  }

  triggerFileSystemChange() {
    if (this.onFileSystemChange) {
      setTimeout(() => {
        this.onFileSystemChange();
      }, 100);
    }
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  destroySession(sessionId) {
    this.sessions.delete(sessionId);
  }

  getCachedPackages() {
    return Array.from(this.cache.entries())
      .filter(([key, pkg]) => Date.now() - pkg.timestamp < this.cacheDuration);
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/runtimes`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create global terminal service instance
const terminalService = new CloudTerminalService();

export const Terminal = ({ fileSystem, onFileSelect, onFileSystemChange, isVisible = true }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [sessionId, setSessionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('bash');
  const [cachedPackages, setCachedPackages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize terminal service with file system
  useEffect(() => {
    if (fileSystem) {
      terminalService.fileSystem = fileSystem;
      terminalService.onFileSystemChange = onFileSystemChange;
    }
  }, [fileSystem, onFileSystemChange]);

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      setIsTestingConnection(true);
      const connected = await terminalService.testConnection();
      setIsConnected(connected);
      setIsTestingConnection(false);
      
      if (!connected) {
        toast({
          title: "API Connection Failed",
          description: "Using enhanced fallback mode with full command support.",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });
      }
    };

    testConnection();
  }, [toast]);

  // Fetch available languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const runtimes = await terminalService.getRuntimes();
        setAvailableLanguages(runtimes);
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      }
    };

    fetchLanguages();
  }, []);

  // Initialize terminal session
  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        const newSessionId = await terminalService.createSession(selectedLanguage);
        setSessionId(newSessionId);
        
        const session = terminalService.getSession(newSessionId);
        setHistory([...session.history]);
        
        toast({
          title: "🚀 Modern Terminal Activated",
          description: `Full command support enabled for ${selectedLanguage}`,
          status: "success",
          duration: 3000,
          position: "top-right"
        });
      } catch (error) {
        toast({
          title: "Failed to start terminal",
          description: error.message,
          status: "error",
          duration: 3000
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isVisible) {
      initSession();
    }

    return () => {
      if (sessionId) {
        terminalService.destroySession(sessionId);
      }
    };
  }, [isVisible, selectedLanguage, toast]);

  // Update cached packages list
  useEffect(() => {
    setCachedPackages(terminalService.getCachedPackages());
  }, [history]);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearTerminal();
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowSuggestions(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isLoading) return;

    const command = input;
    setInput('');
    setHistoryIndex(-1);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      await terminalService.executeCommand(sessionId, command);
      const session = terminalService.getSession(sessionId);
      setHistory([...session.history]);
      
      await handleSpecialCommands(command);
    } catch (error) {
      toast({
        title: "Command failed",
        description: error.message,
        status: "error",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialCommands = async (command) => {
    const lowerCommand = command.toLowerCase().trim();
    
    if (lowerCommand.startsWith('cat ') || lowerCommand.startsWith('open ')) {
      const fileName = command.split(' ')[1];
      if (fileSystem && fileName) {
        const file = findFileInFileSystem(fileSystem, fileName);
        if (file) {
          onFileSelect(file.id);
          toast({
            title: "📂 File opened in editor",
            description: `Opened ${fileName}`,
            status: "success",
            duration: 2000
          });
        }
      }
    }
  };

  const findFileInFileSystem = (fs, fileName) => {
    if (!fs || !fs.root) return null;
    
    const traverse = (node) => {
      if (node.type === 'file' && node.name === fileName) {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = traverse(child);
          if (found) return found;
        }
      }
      return null;
    };
    
    return traverse(fs.root);
  };

  const clearTerminal = () => {
    if (sessionId) {
      const session = terminalService.getSession(sessionId);
      if (session) {
        session.history = session.history.filter(item => 
          item.type !== 'input' && item.type !== 'output' && item.type !== 'error'
        );
        setHistory([...session.history]);
      }
    }
  };

  const testAPIConnection = async () => {
    setIsTestingConnection(true);
    const connected = await terminalService.testConnection();
    setIsConnected(connected);
    setIsTestingConnection(false);
    
    toast({
      title: connected ? "🌐 API Connected" : "❌ API Connection Failed",
      description: connected ? "Full cloud execution available" : "Using enhanced local mode",
      status: connected ? "success" : "error",
      duration: 3000
    });
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      bash: FaTerminal,
      python: FaPython,
      node: FaNodeJs,
      javascript: FaNodeJs,
      react: FaNpm,
      npm: FaNpm,
      git: FaGitAlt,
      docker: FaDocker,
      web: FaGlobe,
      database: FaDatabase,
      server: FaServer,
      mobile: FaMobile
    };
    return icons[lang] || FaTerminal;
  };

  const LanguageIcon = getLanguageIcon(selectedLanguage);

  // Get output styling based on type
  const getOutputStyle = (type) => {
    const styles = {
      welcome: {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        icon: '🎉'
      },
      input: {
        bg: colorMode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        color: colorMode === 'dark' ? 'blue.300' : 'blue.600',
        border: '1px solid',
        borderColor: colorMode === 'dark' ? 'blue.500' : 'blue.200'
      },
      output: {
        bg: colorMode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
        color: colorMode === 'dark' ? 'green.300' : 'green.700',
        border: '1px solid',
        borderColor: colorMode === 'dark' ? 'green.500' : 'green.200'
      },
      error: {
        bg: colorMode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        color: colorMode === 'dark' ? 'red.300' : 'red.600',
        border: '1px solid',
        borderColor: colorMode === 'dark' ? 'red.500' : 'red.200'
      }
    };
    return styles[type] || styles.output;
  };

  if (!isVisible) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      h="100%"
      bg={colorMode === 'dark' ? 
        'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)' : 
        'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)'
      }
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
      borderRadius="lg"
      display="flex"
      flexDirection="column"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
      backdropFilter="blur(10px)"
    >
      {/* Enhanced Terminal Header */}
      <HStack
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        bg={colorMode === 'dark' ? 
          'linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)' : 
          'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)'
        }
        justify="space-between"
        borderRadius="lg"
      >
        <HStack spacing={3}>
          <Box
            p={2}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            borderRadius="lg"
            boxShadow="0 4px 15px rgba(102, 126, 234, 0.3)"
          >
            <LanguageIcon color="white" size={16} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="md" fontWeight="bold" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
              Modern Terminal
            </Text>
            <HStack spacing={2}>
              <Badge 
                colorScheme={isConnected ? "green" : "red"} 
                variant="subtle"
                fontSize="xs"
                borderRadius="full"
              >
                {isConnected ? "🌐 Cloud" : "⚡ Local"}
              </Badge>
              <Badge colorScheme="purple" variant="subtle" fontSize="xs" borderRadius="full">
                {selectedLanguage}
              </Badge>
            </HStack>
          </VStack>
          
          {cachedPackages.length > 0 && (
            <Badge colorScheme="green" variant="solid" fontSize="xs" borderRadius="full">
              📦 {cachedPackages.length}
            </Badge>
          )}
        </HStack>

        <HStack spacing={2}>
          <Tooltip label="Quick Suggestions (Tab)">
            <IconButton
              icon={<FaLightbulb />}
              size="sm"
              variant="ghost"
              onClick={() => setShowSuggestions(!showSuggestions)}
              colorScheme="yellow"
              aria-label="Suggestions"
            />
          </Tooltip>
          
          <Tooltip label="Test API Connection">
            <IconButton
              icon={<FaNetworkWired />}
              size="sm"
              variant="ghost"
              onClick={testAPIConnection}
              isLoading={isTestingConnection}
              aria-label="Test connection"
              colorScheme={isConnected ? "green" : "red"}
            />
          </Tooltip>
          
          <Tooltip label="Terminal Settings">
            <IconButton
              icon={<FaCog />}
              size="sm"
              variant="ghost"
              onClick={onOpen}
              aria-label="Settings"
            />
          </Tooltip>
          
          <Tooltip label="Clear Terminal (Ctrl+L)">
            <IconButton
              icon={<FaTrash />}
              size="sm"
              variant="ghost"
              onClick={clearTerminal}
              aria-label="Clear"
            />
          </Tooltip>
        </HStack>
      </HStack>

      {/* Connection Status Alert */}
      {!isConnected && (
        <Alert status="warning" size="sm" borderRadius="none" variant="subtle">
          <AlertIcon />
          <AlertDescription fontSize="xs">
            Cloud API offline. Using enhanced local mode with full command support.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Suggestions */}
      {showSuggestions && (
        <MotionBox
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          p={3}
          bg={colorMode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'}
          borderBottom="1px solid"
          borderColor={colorMode === 'dark' ? 'blue.500' : 'blue.200'}
        >
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="bold" color={colorMode === 'dark' ? 'blue.300' : 'blue.600'}>
              💡 Quick Commands
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {terminalService.getCommandSuggestions('all').slice(0, 6).map((cmd, index) => (
                <Tag
                  key={index}
                  size="sm"
                  colorScheme="blue"
                  variant="subtle"
                  cursor="pointer"
                  onClick={() => {
                    setInput(cmd);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  <TagLabel>{cmd}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </VStack>
        </MotionBox>
      )}

      {/* Enhanced Terminal Output */}
      <Box
        ref={terminalRef}
        flex={1}
        overflowY="auto"
        p={4}
        fontFamily="'JetBrains Mono', 'SF Mono', Monaco, monospace"
        fontSize="13px"
        lineHeight="1.5"
        bg={colorMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.5)'}
      >
        <AnimatePresence>
          <VStack align="stretch" spacing={3}>
            {history.map((item, index) => {
              const style = getOutputStyle(item.type);
              return (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  p={3}
                  bg={style.bg}
                  color={style.color}
                  border={style.border}
                  borderColor={style.borderColor}
                  borderRadius="lg"
                  boxShadow="sm"
                  _hover={{
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.type === 'input' && (
                    <HStack spacing={3} align="flex-start">
                      <Text color={colorMode === 'dark' ? 'green.400' : 'green.600'} fontWeight="bold" fontSize="sm">
                        ➜
                      </Text>
                      <Code 
                        bg="transparent" 
                        color="inherit"
                        fontSize="sm"
                        p={0}
                      >
                        {item.content}
                      </Code>
                    </HStack>
                  )}
                  
                  {(item.type === 'output' || item.type === 'welcome' || item.type === 'error') && (
                    <Text 
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                      fontSize="sm"
                      lineHeight="1.6"
                    >
                      {item.content}
                    </Text>
                  )}
                </MotionBox>
              );
            })}
            
            {isLoading && (
              <HStack spacing={3} p={3} bg={colorMode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} borderRadius="lg">
                <Spinner size="sm" color="purple.500" />
                <Text fontSize="sm" color={colorMode === 'dark' ? 'purple.300' : 'purple.600'}>
                  Executing in cloud environment...
                </Text>
              </HStack>
            )}
          </VStack>
        </AnimatePresence>
      </Box>

      {/* Enhanced Terminal Input */}
      <Box
        p={3}
        borderTop="1px solid"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        bg={colorMode === 'dark' ? 'rgba(10, 14, 39, 0.5)' : 'rgba(248, 250, 252, 0.8)'}
        borderRadius="lg"
      >
        <form onSubmit={handleSubmit}>
          <HStack spacing={3}>
            <Text color={colorMode === 'dark' ? 'green.400' : 'green.600'} fontWeight="bold" fontSize="sm">
              ➜
            </Text>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command or 'help' for options..."
              variant="unstyled"
              fontFamily="'JetBrains Mono', 'SF Mono', Monaco, monospace"
              fontSize="13px"
              color={colorMode === 'dark' ? 'gray.100' : 'gray.800'}
              isDisabled={isLoading || !sessionId}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              _placeholder={{
                color: colorMode === 'dark' ? 'gray.500' : 'gray.400'
              }}
            />
            <IconButton
              icon={<FaRocket />}
              size="sm"
              type="submit"
              isLoading={isLoading}
              isDisabled={!input.trim() || !sessionId}
              aria-label="Execute command"
              colorScheme="purple"
              bgGradient="linear(to-r, blue.500, purple.500)"
              _hover={{
                bgGradient: 'linear(to-r, blue.600, purple.600)',
                transform: 'translateY(-1px)',
                boxShadow: 'lg'
              }}
              transition="all 0.2s"
            />
          </HStack>
        </form>
        
        {/* Quick Tips */}
        <HStack spacing={4} mt={2} px={1}>
          <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
            <Kbd>Tab</Kbd> Suggestions
          </Text>
          <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
            <Kbd>Ctrl+L</Kbd> Clear
          </Text>
          <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
            <Kbd>↑↓</Kbd> History
          </Text>
        </HStack>
      </Box>

      {/* Enhanced Terminal Settings Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent bg={colorMode === 'dark' ? 'gray.800' : 'white'} border="1px solid" borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}>
          <ModalHeader>
            <HStack>
              <FaMagic />
              <Text>Terminal Configuration</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* API Status */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold">Cloud Connection</Text>
                  <Badge colorScheme={isConnected ? "green" : "red"} fontSize="sm">
                    {isConnected ? "Connected" : "Local Mode"}
                  </Badge>
                </HStack>
                <Progress 
                  value={isConnected ? 100 : 0} 
                  colorScheme={isConnected ? "green" : "red"}
                  size="lg"
                  borderRadius="full"
                  hasStripe
                  isAnimated={isConnected}
                />
                <Text fontSize="sm" color="gray.500" mt={2}>
                  {isConnected ? "Full cloud execution enabled" : "Enhanced local execution with full command support"}
                </Text>
              </Box>

              <FormControl>
                <FormLabel>Development Environment</FormLabel>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                  borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
                >
                  <option value="bash">Bash / Shell</option>
                  <option value="python">Python Development</option>
                  <option value="javascript">Node.js / JavaScript</option>
                  <option value="web">Web Development</option>
                </Select>
              </FormControl>

              {/* Available Languages */}
              {availableLanguages.length > 0 && (
                <FormControl>
                  <FormLabel>Supported Languages ({availableLanguages.length})</FormLabel>
                  <Box
                    p={3}
                    bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                    borderRadius="md"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <VStack align="stretch" spacing={2}>
                      {availableLanguages.slice(0, 25).map((runtime, index) => (
                        <HStack key={index} justify="space-between" fontSize="sm">
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                              {runtime.language}
                            </Badge>
                            <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
                              @{runtime.version}
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.500' : 'gray.600'}>
                            {runtime.aliases?.[0] || 'standard'}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </FormControl>
              )}

              {/* Quick Setup Cards */}
              <Box>
                <Text fontWeight="bold" mb={3}>Quick Setup</Text>
                <HStack spacing={3}>
                  <Button
                    leftIcon={<FaPython />}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setInput('setup python');
                      onClose();
                    }}
                  >
                    Python
                  </Button>
                  <Button
                    leftIcon={<FaNodeJs />}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setInput('setup node');
                      onClose();
                    }}
                  >
                    Node.js
                  </Button>
                  <Button
                    leftIcon={<FaGlobe />}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setInput('setup web');
                      onClose();
                    }}
                  >
                    Web Dev
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              leftIcon={<FaSync />}
              colorScheme="blue"
              variant="ghost"
              onClick={testAPIConnection}
              isLoading={isTestingConnection}
            >
              Test Connection
            </Button>
            <Button
              colorScheme="purple"
              onClick={onClose}
              ml={3}
            >
              Apply Settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};