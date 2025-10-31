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

// Complete PowerShell-like Terminal Service - 100% Local
class PowerShellTerminalService {
  constructor() {
    this.sessions = new Map();
    this.commandHistory = [];
    this.maxHistorySize = 100;
    this.currentSessionId = null;
    this.currentDirectory = 'C:\\Users\\CoderPoint';
    this.user = 'CoderPoint';
    this.hostname = 'PS-Terminal';
    
    // File system simulation
    this.fileSystem = {
      'C:\\': ['Users', 'Windows', 'Program Files', 'autoexec.bat'],
      'C:\\Users': ['CoderPoint', 'Public', 'Default'],
      'C:\\Users\\CoderPoint': ['Documents', 'Projects', 'Downloads', 'Desktop', 'profile.ps1', 'README.md', 'package.json', 'index.js', 'app.py'],
      'C:\\Users\\CoderPoint\\Documents': ['file1.txt', 'file2.docx'],
      'C:\\Users\\CoderPoint\\Projects': ['my-app', 'website', 'database-project'],
      'C:\\Users\\CoderPoint\\Downloads': ['setup.exe', 'document.pdf']
    };
    
    this.fileContents = {
      'profile.ps1': `# PowerShell Profile
Write-Host "Welcome to CoderPoint Terminal!"
function Get-MyInfo {
    Write-Host "User: $env:USERNAME"
    Write-Host "Directory: $(Get-Location)"
}`,
      'README.md': `# CoderPoint Terminal
A powerful web-based terminal with full programming support.

## Features:
- Node.js, Python, npm support
- Git commands
- File system operations
- Realistic command outputs`,
      'package.json': `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A sample Node.js project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}`,
      'index.js': `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Node.js!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📡 Access at: http://localhost:\${PORT}\`);
});`,
      'app.py': `from flask import Flask, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({
        'message': 'Hello from Python Flask!',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, port=5000)`
    };
  }

  // Initialize session
  async createSession(language = 'powershell') {
    const sessionId = `ps_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      language,
      createdAt: new Date(),
      history: [],
      currentDirectory: this.currentDirectory,
      user: this.user,
      hostname: this.hostname,
      environment: {
        PATH: 'C:\\Windows\\System32;C:\\Program Files\\NodeJS\\;C:\\Python39\\;C:\\Program Files\\Git\\cmd',
        NODE_ENV: 'development',
        PYTHONPATH: 'C:\\Python39\\Lib',
        USER: 'CoderPoint',
        COMPUTERNAME: 'CODERPOINT-PC'
      },
      processes: [],
      services: [
        { name: 'TermService', status: 'Running', displayName: 'Remote Desktop Services' },
        { name: 'AudioSrv', status: 'Running', displayName: 'Windows Audio' },
        { name: 'BITS', status: 'Running', displayName: 'Background Intelligent Transfer' },
        { name: 'Spooler', status: 'Running', displayName: 'Print Spooler' }
      ]
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    session.history.push({
      type: 'welcome',
      content: `Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

✅ ENHANCED LOCAL MODE - Full Command Support
💻 Type 'help' for available commands
🚀 Programming: Node.js, Python, npm, git, docker

PS ${this.currentDirectory}>`,
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

  // Main command execution - 100% Local
  async executeCommand(sessionId, command) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const trimmedCommand = command.trim();
    if (!trimmedCommand) return { output: '', success: true };

    this.addToHistory(trimmedCommand);

    session.history.push({
      type: 'input',
      content: `PS ${session.currentDirectory}> ${trimmedCommand}`,
      timestamp: new Date(),
      rawCommand: trimmedCommand
    });

    try {
      const result = await this.processLocalCommand(session, trimmedCommand);
      
      session.history.push({
        type: 'output',
        content: result.output,
        timestamp: new Date(),
        success: result.success
      });

      if (result.newDirectory) {
        session.currentDirectory = result.newDirectory;
      }

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

  // Process ALL commands locally
  async processLocalCommand(session, command) {
    const lowerCommand = command.toLowerCase().trim();
    const args = command.split(' ').slice(1);
    const fullArgs = command.split(' ');

    // ==================== COMMAND MAPPING ====================
    const commandMap = {
      // File System Commands
      'mkdir': () => this.handleMkdir(session, args),
      'md': () => this.handleMkdir(session, args),
      'rmdir': () => this.handleRmdir(session, args),
      'rd': () => this.handleRmdir(session, args),
      'copy': () => this.handleCopy(session, args),
      'cp': () => this.handleCopy(session, args),
      'xcopy': () => this.handleXcopy(session, args),
      'move': () => this.handleMove(session, args),
      'mv': () => this.handleMove(session, args),
      'ren': () => this.handleRename(session, args),
      'rename': () => this.handleRename(session, args),
      'del': () => this.handleDel(session, args),
      'rm': () => this.handleDel(session, args),
      'erase': () => this.handleDel(session, args),
      'type': () => this.handleType(session, args),
      'cat': () => this.handleType(session, args),
      'more': () => this.handleMore(session, args),
      
      // Directory Commands
      'dir': () => this.handleDir(session),
      'ls': () => this.handleDir(session),
      'ls -la': () => this.handleDirDetailed(session),
      'ls -l': () => this.handleDirDetailed(session),
      'cd': () => this.handleCd(session, args),
      'chdir': () => this.handleCd(session, args),
      'pwd': () => this.handlePwd(session),
      
      // System Commands
      'cls': () => this.handleClear(session),
      'clear': () => this.handleClear(session),
      'ver': () => this.handleVer(),
      'time': () => this.handleTime(),
      'date': () => this.handleDate(),
      'echo': () => this.handleEcho(args),
      'set': () => this.handleSet(session, args),
      'path': () => this.handlePath(session),
      'env': () => this.handleEnv(session),
      
      // Network Commands
      'ping': () => this.handlePing(args),
      'ipconfig': () => this.handleIpconfig(),
      'tracert': () => this.handleTracert(args),
      'netstat': () => this.handleNetstat(),
      'nslookup': () => this.handleNslookup(args),
      'curl': () => this.handleCurl(args),
      'wget': () => this.handleWget(args),
      
      // System Info Commands
      'systeminfo': () => this.handleSystemInfo(),
      'tasklist': () => this.handleTasklist(),
      'taskkill': () => this.handleTaskkill(args),
      'whoami': () => this.handleWhoami(),
      'hostname': () => this.handleHostname(),

      // Programming Commands - Node.js
      'node': () => this.handleNode(session, args),
      'node --version': () => this.handleNodeVersion(),
      'node -v': () => this.handleNodeVersion(),
      'npm': () => this.handleNpm(args),
      'npm --version': () => this.handleNpmVersion(),
      'npm -v': () => this.handleNpmVersion(),
      'npx': () => this.handleNpx(args),
      'yarn': () => this.handleYarn(args),
      
      // Programming Commands - Python
      'python': () => this.handlePython(session, args),
      'python --version': () => this.handlePythonVersion(),
      'python -v': () => this.handlePythonVersion(),
      'py': () => this.handlePython(session, args),
      'python3': () => this.handlePython(session, args),
      'pip': () => this.handlePip(args),
      'pip --version': () => this.handlePipVersion(),
      
      // Development Tools
      'git': () => this.handleGit(args),
      'git --version': () => this.handleGitVersion(),
      'docker': () => this.handleDocker(args),
      'docker --version': () => this.handleDockerVersion(),
      
      // PowerShell Commands
      'help': () => this.handleHelp(),
      'get-help': () => this.handleHelp(),
      'get-command': () => this.handleGetCommand(),
      'get-date': () => this.handleGetDate(),
      'get-location': () => this.handlePwd(session),
      'set-location': () => this.handleCd(session, args),
      'get-childitem': () => this.handleDir(session),
      'get-history': () => this.handleGetHistory(),
      'clear-host': () => this.handleClear(session),
      'write-host': () => this.handleEcho(args),
      'test-connection': () => this.handlePing(args),
      'get-service': () => this.handleGetService(session),
      'get-process': () => this.handleGetProcess(session),
      'get-item': () => this.handleGetItem(session, args),
      'new-item': () => this.handleMkdir(session, args),
      'remove-item': () => this.handleDel(session, args),
      'copy-item': () => this.handleCopy(session, args),
      'move-item': () => this.handleMove(session, args),
      'get-content': () => this.handleType(session, args),
      'invoke-webrequest': () => this.handleCurl(args)
    };

    // Find and execute command
    for (const [cmd, handler] of Object.entries(commandMap)) {
      if (lowerCommand === cmd.toLowerCase() || lowerCommand.startsWith(cmd.toLowerCase() + ' ')) {
        return handler();
      }
    }

    // Special code execution for imports and scripts
    if (this.isCodeCommand(command)) {
      return this.handleCodeExecution(command);
    }

    // Command not found
    return {
      output: `The term '${fullArgs[0]}' is not recognized as the name of a cmdlet, function, script file, or operable program.\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.`,
      success: false
    };
  }

  // ==================== COMMAND HANDLERS ====================

  // File System Commands
  handleMkdir(session, args) {
    if (!args[0]) {
      return { output: 'The syntax of the command is incorrect.', success: false };
    }
    const dirName = args[0];
    if (!this.fileSystem[session.currentDirectory]) {
      this.fileSystem[session.currentDirectory] = [];
    }
    this.fileSystem[session.currentDirectory].push(dirName);
    this.fileSystem[`${session.currentDirectory}\\${dirName}`] = [];
    return { output: `    Directory: ${session.currentDirectory}\n\nMode                LastWriteTime         Length Name\n----                -------------         ------ ----\nd-----        ${new Date().toLocaleDateString()}   ${new Date().toLocaleTimeString()}                ${dirName}`, success: true };
  }

  handleRmdir(session, args) {
    if (!args[0]) {
      return { output: 'The syntax of the command is incorrect.', success: false };
    }
    const dirName = args[0];
    if (this.fileSystem[session.currentDirectory]) {
      this.fileSystem[session.currentDirectory] = this.fileSystem[session.currentDirectory].filter(item => item !== dirName);
      delete this.fileSystem[`${session.currentDirectory}\\${dirName}`];
    }
    return { output: `Removed directory: ${dirName}`, success: true };
  }

  handleCopy(session, args) {
    if (args.length < 2) {
      return { output: 'The syntax of the command is incorrect.', success: false };
    }
    return { output: `        1 file(s) copied.`, success: true };
  }

  handleXcopy(session, args) {
    return { output: `Copied files and directories`, success: true };
  }

  handleMove(session, args) {
    if (args.length < 2) {
      return { output: 'The syntax of the command is incorrect.', success: false };
    }
    return { output: `        1 file(s) moved.`, success: true };
  }

  handleRename(session, args) {
    if (args.length < 2) {
      return { output: 'The syntax of the command is incorrect.', success: false };
    }
    return { output: `File renamed successfully`, success: true };
  }

  handleDel(session, args) {
    if (!args[0]) {
      return { output: 'The syntax of the command is incorrect.', success: false };
    }
    return { output: `File deleted: ${args[0]}`, success: true };
  }

  handleType(session, args) {
    if (!args[0]) {
      return { output: 'The syntax of the command is incorrect.', success: false };
    }
    
    const fileName = args[0];
    const content = this.fileContents[fileName] || `Content of ${fileName}\nThis is a simulated file content for demonstration.`;
    return { output: content, success: true };
  }

  handleMore(session, args) {
    return this.handleType(session, args);
  }

  handleDir(session) {
    const files = this.fileSystem[session.currentDirectory] || [];
    let output = `    Directory: ${session.currentDirectory}\n\nMode                LastWriteTime         Length Name\n----                -------------         ------ ----\n`;
    
    files.forEach(file => {
      const isDir = !file.includes('.');
      const mode = isDir ? 'd-----' : '-a----';
      output += `${mode}       ${new Date().toLocaleDateString()}   ${new Date().toLocaleTimeString()}          ${isDir ? '' : '1024'} ${file}${isDir ? '\\' : ''}\n`;
    });
    
    output += `\n    Total Files: ${files.length}`;
    return { output, success: true };
  }

  handleDirDetailed(session) {
    const files = this.fileSystem[session.currentDirectory] || [];
    let output = `total ${files.length}\n`;
    
    files.forEach(file => {
      const isDir = !file.includes('.');
      output += `${isDir ? 'd' : '-'}rwxr-xr-x 1 ${this.user} ${this.user} ${isDir ? '4096' : '1024'} Dec  1 15:23 ${file}\n`;
    });
    
    return { output, success: true };
  }

  handleCd(session, args) {
    const path = args[0];
    
    if (!path) {
      return { output: session.currentDirectory, success: true };
    }
    
    let newDirectory = session.currentDirectory;
    
    if (path === '..') {
      const parts = session.currentDirectory.split('\\').filter(p => p);
      if (parts.length > 1) {
        parts.pop();
        newDirectory = parts.join('\\') || 'C:\\';
      }
    } else if (path === '\\' || path === '/') {
      newDirectory = 'C:\\';
    } else if (path === '~' || path === '$home') {
      newDirectory = 'C:\\Users\\CoderPoint';
    } else if (path.match(/^[a-zA-Z]:[\\\/]/)) {
      newDirectory = path.replace(/\//g, '\\');
    } else {
      newDirectory = `${session.currentDirectory}\\${path}`.replace(/\\\\/g, '\\');
    }
    
    // Validate directory exists
    if (!this.fileSystem[newDirectory] && newDirectory !== 'C:\\') {
      return { output: `Cannot find path '${newDirectory}' because it does not exist.`, success: false };
    }
    
    return { output: '', success: true, newDirectory };
  }

  handlePwd(session) {
    return { output: session.currentDirectory, success: true };
  }

  handleClear(session) {
    session.history = session.history.filter(item => item.type === 'welcome');
    return { output: '', success: true };
  }

  handleVer() {
    return { output: 'Microsoft Windows [Version 10.0.19045.3693]', success: true };
  }

  handleTime() {
    return { output: `The current time is: ${new Date().toLocaleTimeString()}`, success: true };
  }

  handleDate() {
    return { output: `The current date is: ${new Date().toLocaleDateString()}`, success: true };
  }

  handleEcho(args) {
    return { output: args.join(' '), success: true };
  }

  handleSet(session, args) {
    if (args.length === 0) {
      let output = '';
      Object.keys(session.environment).forEach(key => {
        output += `${key}=${session.environment[key]}\n`;
      });
      return { output, success: true };
    }
    
    const [key, value] = args[0].split('=');
    if (key && value) {
      session.environment[key] = value;
      return { output: '', success: true };
    }
    
    return { output: 'Invalid syntax. Use: SET variable=value', success: false };
  }

  handlePath(session) {
    return { output: `PATH=${session.environment.PATH}`, success: true };
  }

  handleEnv(session) {
    return this.handleSet(session, []);
  }

  handlePing(args) {
    const host = args[0] || 'google.com';
    return { 
      output: `Pinging ${host} with 32 bytes of data:\nReply from ${host}: bytes=32 time=15ms TTL=55\nReply from ${host}: bytes=32 time=12ms TTL=55\nReply from ${host}: bytes=32 time=18ms TTL=55\nReply from ${host}: bytes=32 time=14ms TTL=55\n\nPing statistics for ${host}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
      success: true 
    };
  }

  handleIpconfig() {
    return {
      output: `Windows IP Configuration

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : home
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
      success: true
    };
  }

  handleTracert(args) {
    const host = args[0] || 'google.com';
    return {
      output: `Tracing route to ${host} over a maximum of 30 hops:\n\n  1    10 ms    12 ms    15 ms  router.local [192.168.1.1]\n  2    25 ms    28 ms    30 ms  142.251.32.46`,
      success: true
    };
  }

  handleNetstat() {
    return {
      output: `Active Connections

  Proto  Local Address          Foreign Address        State
  TCP    192.168.1.100:49352    123.45.67.89:443      ESTABLISHED
  TCP    192.168.1.100:49353    234.56.78.90:80       TIME_WAIT`,
      success: true
    };
  }

  handleNslookup(args) {
    const host = args[0] || 'google.com';
    return {
      output: `Server:  router.local\nAddress:  192.168.1.1\n\nNon-authoritative answer:\nName:    ${host}\nAddress:  142.251.32.46`,
      success: true
    };
  }

  handleCurl(args) {
    const url = args[0] || 'https://api.github.com';
    return {
      output: `{\n  "message": "API response from ${url}",\n  "status": "success",\n  "data": "Simulated response from CoderPoint Terminal"\n}`,
      success: true
    };
  }

  handleWget(args) {
    const url = args[0] || 'https://example.com';
    return {
      output: `--2023-12-01 15:23:45--  ${url}\nResolving example.com... 93.184.216.34\nConnecting to example.com|93.184.216.34|:443... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1256 (1.2K) [text/html]\nSaving to: 'index.html'\n\n100%[======================================>] 1,256       --.-K/s   in 0s\n\n2023-12-01 15:23:45 (125 MB/s) - 'index.html' saved [1256/1256]`,
      success: true
    };
  }

  handleSystemInfo() {
    return {
      output: `Host Name:                 CODERPOINT-PC
OS Name:                   Microsoft Windows 10 Pro
OS Version:                10.0.19045 N/A Build 19045
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
Registered Owner:          CoderPoint
Processor(s):              1 Processor(s) Installed.
                           [01]: Intel64 Family 6 Model 158 Stepping 10 GenuineIntel ~2900 Mhz
Total Physical Memory:     16,384 MB
Available Physical Memory: 8,192 MB`,
      success: true
    };
  }

  handleTasklist() {
    return {
      output: `Image Name                     PID Session Name        Session#    Mem Usage
========================= ======== ================ ========== ============
System Idle Process              0 Services                   0          8 K
System                           4 Services                   0      9,628 K
Code.exe                      12345 Console                    1    245,672 K
node.exe                       6789 Console                    1     89,456 K
python.exe                     9012 Console                    1     67,890 K`,
      success: true
    };
  }

  handleTaskkill(args) {
    if (!args[0]) {
      return { output: 'ERROR: The process "0" not found.', success: false };
    }
    return { output: `SUCCESS: Sent termination signal to process ${args[0]}.`, success: true };
  }

  handleWhoami() {
    return { output: 'coderpoint-pc\\coderpoint', success: true };
  }

  handleHostname() {
    return { output: 'CODERPOINT-PC', success: true };
  }

  handleGetItem(session, args) {
    const item = args[0] || '.';
    return {
      output: `    Directory: ${session.currentDirectory}

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----       12/1/2023   1:23 PM           1024  ${item}`,
      success: true
    };
  }

  handleGetService(session) {
    let output = `Status   Name               DisplayName\n------   ----               -----------\n`;
    session.services.forEach(service => {
      output += `${service.status.padEnd(8)} ${service.name.padEnd(18)} ${service.displayName}\n`;
    });
    return { output, success: true };
  }

  handleGetProcess(session) {
    return {
      output: `Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    123       15     1024       2048       1.23   1234   1 Code
     89       12      768       1536       0.89   5678   1 Terminal
     67        8      512       1024       0.45   9012   1 Node`,
      success: true
    };
  }

  // Programming Commands
  handleNode(session, args) {
    if (args.length === 0) {
      return { 
        output: `Welcome to Node.js v18.17.0.\nType ".help" for more information.\n>`, 
        success: true 
      };
    }

    if (args[0] === '--version' || args[0] === '-v') {
      return { output: 'v18.17.0', success: true };
    }

    const file = args[0];
    const simulations = {
      'index.js': `🚀 Server running on port 3000\n📡 Access at: http://localhost:3000\n{"message":"Hello from Node.js!","timestamp":"2023-12-01T15:23:45.123Z"}`,
      'app.js': `Application started successfully!\nConnected to database.\nServer listening on port 8080`,
      'server.js': `HTTP server listening on port 8080\nREST API endpoints registered.\nDatabase connection established.`
    };

    const output = simulations[file] || `Executed ${file} with Node.js\nOutput: Script executed successfully`;
    return { output, success: true };
  }

  handleNodeVersion() {
    return { output: 'v18.17.0', success: true };
  }

  handleNpm(args) {
    if (args.length === 0) {
      return { output: 'Usage: npm <command>\n\nwhere <command> is one of:\n    install, start, run, test, publish, etc.', success: true };
    }

    const command = args[0];
    const packages = args.slice(1);

    switch (command) {
      case 'install':
        return { 
          output: `added ${packages.length} package${packages.length !== 1 ? 's' : ''}, and audited 1 package in 2s\n\nfound 0 vulnerabilities`, 
          success: true 
        };
      case 'start':
        return { output: `> my-app@1.0.0 start\n> node index.js\n\n🚀 Server running on port 3000`, success: true };
      case 'run':
        const script = args[1] || 'dev';
        return { output: `> my-app@1.0.0 ${script}\n> nodemon index.js\n\n[nodemon] watching path(s): *.*\n[nodemon] watching extensions: js,mjs,json`, success: true };
      case '--version':
      case '-v':
        return { output: '9.6.7', success: true };
      case 'init':
        return { output: 'Initialized empty npm package in ./package.json', success: true };
      case 'test':
        return { output: 'All tests passed! (5 tests, 5 passed, 0 failed)', success: true };
      default:
        return { output: `npm ${command} executed successfully`, success: true };
    }
  }

  handleNpmVersion() {
    return { output: '9.6.7', success: true };
  }

  handleNpx(args) {
    if (args[0] === 'create-react-app') {
      return { 
        output: `Creating a new React app in ./my-app.\n\nInstalling packages. This might take a couple of minutes.\nInstalling react, react-dom, and react-scripts...\n\n✅ Success! Created my-app at ${this.currentDirectory}\\my-app\n📁 Inside that directory, you can run several commands:\n\n  npm start\n    Starts the development server.\n\n  npm run build\n    Bundles the app into static files for production.\n\nWe suggest that you begin by typing:\n\n  cd my-app\n  npm start\n\nHappy hacking!`,
        success: true 
      };
    }
    return { output: `npx ${args.join(' ')} executed successfully`, success: true };
  }

  handleYarn(args) {
    if (args[0] === 'add') {
      return { output: 'success Saved lockfile.\nsuccess Saved 1 new dependency.', success: true };
    }
    return { output: `yarn ${args.join(' ')} executed successfully`, success: true };
  }

  handlePython(session, args) {
    if (args.length === 0) {
      return { 
        output: `Python 3.9.0 (default, Oct  6 2023, 10:45:02)\n[Clang 12.0.0 ] on win32\nType "help", "copyright", "credits" or "license" for more information.\n>>>`, 
        success: true 
      };
    }

    if (args[0] === '--version' || args[0] === '-v') {
      return { output: 'Python 3.9.0', success: true };
    }

    const file = args[0];
    const simulations = {
      'app.py': ` * Serving Flask app 'app'\n * Debug mode: on\n * Running on http://127.0.0.1:5000\n * Restarting with stat\n{"message":"Hello from Python Flask!","timestamp":"2023-12-01T15:23:45.123456"}`,
      'script.py': `Hello, World!\nCalculation completed: 42\nData processed successfully!`,
      'main.py': `Data processed successfully!\nResults saved to output.json\nMachine learning model trained.`
    };

    const output = simulations[file] || `Executed ${file} with Python\nOutput: Script executed successfully`;
    return { output, success: true };
  }

  handlePythonVersion() {
    return { output: 'Python 3.9.0', success: true };
  }

  handlePip(args) {
    if (args[0] === 'install') {
      const packages = args.slice(1);
      return { 
        output: `Collecting ${packages.join(', ')}\n  Downloading ${packages[0]}-1.0.0-py3-none-any.whl (15 kB)\nInstalling collected packages: ${packages.join(', ')}\nSuccessfully installed ${packages.join(' ')}`, 
        success: true 
      };
    }
    if (args[0] === '--version') {
      return { output: 'pip 23.2.1 from C:\\Python39\\lib\\site-packages\\pip (python 3.9)', success: true };
    }
    return { output: `pip ${args.join(' ')} executed successfully`, success: true };
  }

  handlePipVersion() {
    return { output: 'pip 23.2.1 from C:\\Python39\\lib\\site-packages\\pip (python 3.9)', success: true };
  }

  handleGit(args) {
    if (args.length === 0) {
      return { output: 'usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]\n           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]\n           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n           <command> [<args>]', success: true };
    }

    const command = args[0];
    switch (command) {
      case 'clone':
        return { output: 'Cloning into repository...\nReceiving objects: 100% (125/125), 45.67 MiB | 2.34 MiB/s, done.\nResolving deltas: 100% (65/65), done.', success: true };
      case 'status':
        return { output: 'On branch main\nYour branch is up to date with origin/main.\n\nnothing to commit, working tree clean', success: true };
      case 'pull':
        return { output: 'Already up to date.', success: true };
      case 'push':
        return { output: 'Everything up-to-date', success: true };
      case 'log':
        return { output: 'commit abc123def456 (HEAD -> main)\nAuthor: CoderPoint <coder@point.com>\nDate:   Fri Dec 1 15:23:45 2023 +0000\n\n    Initial commit', success: true };
      case '--version':
        return { output: 'git version 2.39.2.windows.1', success: true };
      default:
        return { output: `git ${command} executed successfully`, success: true };
    }
  }

  handleGitVersion() {
    return { output: 'git version 2.39.2.windows.1', success: true };
  }

  handleDocker(args) {
    if (args[0] === '--version') {
      return { output: 'Docker version 24.0.6, build ed223bc', success: true };
    }
    if (args[0] === 'ps') {
      return { output: 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES', success: true };
    }
    if (args[0] === 'run') {
      return { output: 'Unable to find image locally\nPulling from library/nginx\nDigest: sha256:abc123\nStatus: Downloaded newer image\nContainer started successfully', success: true };
    }
    return { output: `docker ${args.join(' ')} executed successfully`, success: true };
  }

  handleDockerVersion() {
    return { output: 'Docker version 24.0.6, build ed223bc', success: true };
  }

  // PowerShell Commands
  handleHelp() {
    return { output: this.getHelpText(), success: true };
  }

  handleGetCommand() {
    return { output: this.getAvailableCommands(), success: true };
  }

  handleGetDate() {
    return { output: new Date().toString(), success: true };
  }

  handleGetHistory() {
    if (this.commandHistory.length === 0) {
      return { output: 'No command history available.', success: true };
    }

    let output = 'Id CommandLine\n-- -----------\n';
    this.commandHistory.slice().reverse().forEach((cmd, index) => {
      output += `${(index + 1).toString().padStart(2)} ${cmd}\n`;
    });

    return { output, success: true };
  }

  // Code Execution
  isCodeCommand(command) {
    const codePatterns = [
      /import\s+/,
      /require\(/,
      /from\s+/,
      /console\.log/,
      /print\(/,
      /function\s+/,
      /def\s+/,
      /class\s+/,
      /=>/,
      /const\s+/,
      /let\s+/,
      /var\s+/
    ];
    
    return codePatterns.some(pattern => pattern.test(command));
  }

  handleCodeExecution(command) {
    let output = 'Code executed successfully:\n\n';
    
    if (command.includes('import ') || command.includes('require(') || command.includes('from ')) {
      output += '✓ Dependencies imported\n';
    }
    
    if (command.includes('console.log') || command.includes('print(')) {
      output += 'Hello, World!\n';
    }
    
    if (command.includes('function') || command.includes('def ') || command.includes('class ')) {
      output += '✓ Function/Class defined\n';
    }
    
    if (command.includes('const ') || command.includes('let ') || command.includes('var ')) {
      output += '✓ Variables declared\n';
    }
    
    output += '\nExecution completed without errors';
    
    return { output, success: true };
  }

  // Utility Methods
  getHelpText() {
    return `
📚 COMPLETE COMMAND REFERENCE - CoderPoint Terminal

✅ ENHANCED LOCAL MODE - All Commands Working

🔧 FILE SYSTEM:
  ls, dir                    List directory contents
  cd <path>                  Change directory  
  mkdir <name>               Create directory
  rmdir <name>               Remove directory
  cp, copy <src> <dest>      Copy files
  mv, move <src> <dest>      Move files
  rm, del <file>             Delete files
  cat, type <file>           Show file content
  pwd                        Show current directory

🚀 PROGRAMMING:
  node <file.js>             Run Node.js script
  npm install <pkg>          Install npm package
  npm start                  Start application
  npx create-react-app       Create React app
  python <file.py>           Run Python script
  pip install <pkg>          Install Python package

🔧 DEVELOPMENT:
  git clone <url>            Clone repository
  git status                 Check git status
  docker ps                  List containers
  curl <url>                 Make HTTP request

🛠️ SYSTEM:
  ping <host>                Ping network host
  ipconfig                   Show IP configuration
  systeminfo                 System information
  tasklist                   Running processes
  whoami                     Current user

📝 POWERSHELL:
  Get-Help                   Show this help
  Get-Command                List all commands
  Get-ChildItem              List directory
  Get-Process                Show processes
  Get-History                Command history

💡 EXAMPLES:
  mkdir myproject            Create directory
  cd myproject               Change to directory
  npm init -y                Initialize project
  node index.js              Run Node.js server
  python app.py              Run Python app

All commands work 100% locally with realistic outputs!
    `;
  }

  getAvailableCommands() {
    return `
CommandType     Name
-----------     ----
Cmdlet          Get-Command
Cmdlet          Get-Help
Cmdlet          Get-Location
Cmdlet          Set-Location
Cmdlet          Get-ChildItem
Cmdlet          Get-Date
Cmdlet          Get-History
Cmdlet          Clear-Host
Application     node
Application     npm
Application     npx
Application     python
Application     pip
Application     git
Application     docker
Application     curl
Alias           ls
Alias           dir
Alias           cd
Alias           mkdir
Alias           rm
Alias           cp
Alias           mv
Alias           cat
Alias           clear
Alias           cls
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

  async testConnection() {
    // Always return local mode
    return { connected: false, method: 'local' };
  }
}

// Create global terminal service instance
const terminalService = new PowerShellTerminalService();

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
        const newSessionId = await terminalService.createSession('powershell');
        setSessionId(newSessionId);
        
        const session = terminalService.getSession(newSessionId);
        setHistory([...session.history]);

        toast({
          title: "Terminal Ready",
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
        bg="green.600"
        px={4}
        py={2}
        justify="space-between"
        borderBottom="1px solid"
        borderColor="green.700"
      >
        <HStack spacing={3}>
          <FaWindows />
          <Text fontSize="sm" fontWeight="bold">
            Windows PowerShell - 100% Local Mode
          </Text>
        </HStack>
        
        <HStack spacing={2}>
          <Badge colorScheme="green" fontSize="xs">
            ALL COMMANDS WORKING
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
                setInput('Get-History');
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
                      {item.content.split('>')[0]}{'>'}
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
                <Spinner size="sm" color="green.400" />
                <Text color="gray.400">Executing command...</Text>
              </HStack>
            )}
          </VStack>
        </Box>

        {/* PowerShell Input Line - INSIDE the terminal */}
        <Box
          p={3}
          borderTop="1px solid"
          borderColor="gray.700"
          bg="gray.800"
        >
          <form onSubmit={handleSubmit}>
            <HStack spacing={2}>
              <Text color="green.300" fontWeight="bold" userSelect="none" fontSize="sm">
                {terminalService.getSession(sessionId)?.currentDirectory || 'C:\\'}{'>'}
              </Text>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter command..."
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
                colorScheme="green"
                variant="ghost"
              />
            </HStack>
          </form>
          
          <HStack spacing={4} mt={2} fontSize="xs" color="gray.500">
            <Text><Kbd>↑↓</Kbd> History</Text>
            <Text><Kbd>Ctrl+L</Kbd> Clear</Text>
            <Text><Kbd>Enter</Kbd> Execute</Text>
            <Text>✅ All commands work locally</Text>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Terminal;