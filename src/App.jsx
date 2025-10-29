import {
  Box,
  Heading,
  HStack,
  VStack,
  IconButton,
  useColorMode,
  Tooltip,
  Badge,
  Flex,
  Button,
  Text,
  useToast
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FaGithub, FaPlay, FaCode } from "react-icons/fa";
import { ProjectEditor } from "./components/ProjectEditor";

// Code snippets with file structures
const CODE_TEMPLATES = {
  html: {
    structure: [
      {
        type: 'file',
        name: 'README.md',
        content: `# 💻 CodeCraft — Advanced Online Code Editor
    
    CodeCraft is a free, open-source, web-based code editor and IDE that runs in your browser.  
    Write and run **HTML, CSS, JavaScript, PHP, and Python** without installing anything.
    
    ## 📁 Project Structure
    
    \`\`\`
    ├── README.md                # Project documentation
    └── src/                     # Source files
        ├── index.html           # App entry (editor UI)
        ├── styles.css           # Frontend styling
        ├── script.js            # Frontend logic & editor behavior
        ├── backend/             # Server-side helpers (PHP, Python)
        │   ├── php/             # PHP execution endpoints
        │   └── python/          # Python execution endpoints
        └── assets/              # Icons, images, demos
    \`\`\`
    
    ## 🚀 What this does
    
    - Run small web projects directly in the browser and preview output instantly.  
    - Support for HTML/CSS/JS, plus server runtimes for PHP and Python.  
    - Simple, VS Code–inspired UI with file management, syntax highlighting, and live preview.  
    - Sandbox execution to isolate user code from the host environment.
    
    ## 🔑 Key Features
    
    - Multi-language editing and live preview
    - File creation, rename, delete, and in-browser file tree
    - Tabbed editor interface and resizable panels
    - Basic sandboxing for server-side code execution
    - Lightweight, dependency-free frontend (vanilla JS)
    - Open-source — extend, fork, and ship
    
    ## 🛠️ Quick start
    
    1. Clone the repo:
       \`\`\`bash
       git clone https://github.com/smshagor-dev/codecraft.git
       cd codecraft
       \`\`\`
    2. Open the frontend:
       - Open \`src/index.html\` in your browser for the UI (dev mode).
    3. (Optional) Run backend for PHP/Python features:
       - PHP: run a local server from \`src/backend/php\` (e.g., \`php -S localhost:8000\`).
       - Python: run your chosen sandbox or API in \`src/backend/python\`.
    4. Edit \`src/styles.css\` and \`src/script.js\` to customize the editor.
    
    ## 💡 Tips
    
    Here's the thing — keep the frontend and backend separated while you tinker. Use the frontend for UI-only changes; spin up the backend only when you need server execution. Use DevTools to inspect the sandboxed iframe and console for errors.
    
    ## 🧩 Extend ideas
    
    - Add theme support (dark/light and custom themes)  
    - Implement multiple tabs and persistent storage (IndexedDB)  
    - Add code completion and linting integrations  
    - Add real-time collaboration using WebSockets
    
    ## 🛡 Security notes
    
    Do not deploy server-side execution endpoints without proper sandboxing and quotas. Treat any code execution service as untrusted input and isolate it (containers, timeouts, resource limits).
    
    ## 🤝 Contributing
    
    Contributions welcome. Fork, make changes, open a PR. Keep PRs focused, add tests where possible, and describe the change clearly.
    
    ## 📝 License
    
    CodeCraft is free and open-source. Use it, adapt it, and ship it under the license in this repo.
    
    ---
    
    Happy hacking — build fast, iterate often.`    
      },
      {
        type: 'folder',
        name: 'src',
        children: [
          {
            type: 'file',
            name: 'index.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>🚀 Hello, World!</h1>
        <p>Welcome to your awesome webpage!</p>
        <button onclick="showMessage()">Click Me!</button>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`
          },
          {
            type: 'file',
            name: 'styles.css',
        content: `/* Modern CSS Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.container {
    text-align: center;
    padding: 3rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    border: 1px solid rgba(255, 255, 255, 0.18);
}

h1 {
    margin-bottom: 1.5rem;
    font-size: 3rem;
    animation: fadeInUp 1s ease-out;
}

p {
    margin-bottom: 2rem;
    font-size: 1.2rem;
    opacity: 0.9;
    animation: fadeInUp 1s ease-out 0.2s;
    animation-fill-mode: both;
}

button {
    padding: 12px 30px;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: fadeInUp 1s ease-out 0.4s;
    animation-fill-mode: both;
}

button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}`
      },
      {
        name: 'script.js',
        content: `// JavaScript for interactivity
function showMessage() {
    alert('Hello from your awesome webpage! 🎉');
    
    // Add some animation to the button
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    
    // Add mouse move effect
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        container.style.transform = \`
            perspective(1000px)
            rotateY(\${(x - 0.5) * 10}deg)
            rotateX(\${(y - 0.5) * -10}deg)
        \`;
    });
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        container.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
    });
});`
          }
        ]
      }
    ]
  },
  javascript: {
    structure: [
      {
        type: 'file',
        name: 'README.md',
        content: `# 🟨 JavaScript Project Template

A modern JavaScript project template with ES6+ features and best practices.

## 📁 Project Structure

\`\`\`
├── README.md          # Project documentation
└── src/               # Source files
    └── main.js        # Main JavaScript file
\`\`\`

## 🚀 Features

- **ES6+ Syntax**: Modern JavaScript with arrow functions, destructuring, and more
- **Object-Oriented**: Classes and objects demonstration
- **Async Programming**: Promises and async operations
- **Array Methods**: Modern array manipulation techniques

## 🛠️ Getting Started

1. Open \`src/main.js\` to view the code
2. Run the code to see the output in the console
3. Modify and experiment with different JavaScript features

## 💻 Code Examples Included

- Variable declarations (const, let, var)
- Data types and structures
- Functions (regular and arrow)
- Array operations
- Object manipulation
- Promises and async code
- ES6+ features

## 📚 Learning Resources

- **MDN Web Docs**: Comprehensive JavaScript documentation
- **JavaScript.info**: Modern JavaScript tutorial
- **You Don't Know JS**: Deep dive into JavaScript

## 🎯 Practice Ideas

- Add error handling with try-catch
- Create more complex data structures
- Implement array sorting and filtering
- Build a small utility library
- Practice with async/await

---

Happy coding! 🚀`
      },
      {
        type: 'folder',
        name: 'src',
        children: [
          {
            type: 'file',
            name: 'main.js',
            content: `// JavaScript Basic Example
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

asyncOperation.then(result => console.log(result));`
          }
        ]
      }
    ]
  },
  javascriptApp: {
    structure: [
      {
        type: 'file',
        name: 'README.md',
        content: `# 📱 JavaScript Todo App

A feature-rich Todo application demonstrating advanced JavaScript concepts and clean architecture.

## 📁 Project Structure

\`\`\`
├── README.md          # Project documentation
└── src/               # Source files
    ├── app.js         # Main application logic
    ├── utils.js       # Utility functions and helpers
    └── styles.css     # Application styling
\`\`\`

## 🚀 Features

- **Object-Oriented Design**: Clean class-based architecture
- **CRUD Operations**: Create, Read, Update, Delete todos
- **Statistics Tracking**: Real-time metrics and analytics
- **Priority Levels**: High, medium, and low priority tasks
- **Local Storage**: Persistent data storage
- **Modular Code**: Separated concerns with utilities

## 🛠️ Getting Started

1. Run \`src/app.js\` to see the demo in action
2. Check \`src/utils.js\` for helper functions
3. Modify and extend the functionality

## 💼 Application Features

### Core Functionality
- Add new todos with automatic ID generation
- Mark todos as complete/incomplete
- View comprehensive statistics
- Priority-based task management

### Utility Functions
- Date formatting for better readability
- Random ID generation
- Local storage management
- Color coding for priorities

## 🎯 Usage Examples

\`\`\`javascript
// Create a new todo
app.addTodo('Learn JavaScript');

// Complete a todo
app.completeTodo(1);

// View statistics
app.getStats();

// List all todos
app.listTodos();
\`\`\`

## 🔧 Extension Ideas

- Add due dates and reminders
- Implement categories/tags
- Create a search function
- Add export/import functionality
- Build a REST API integration

## 📚 Learning Outcomes

- Understanding OOP in JavaScript
- Working with classes and methods
- Managing application state
- Implementing utility functions
- Using ES6+ features effectively

---

Built with ❤️ and JavaScript`
      },
      {
        type: 'folder',
        name: 'src',
        children: [
          {
            type: 'file',
            name: 'app.js',
        content: `// Interactive JavaScript Application
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
          },
          {
            type: 'file',
            name: 'utils.js',
        content: `// Utility functions for the Todo App

// Format date to readable string
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Generate random ID
export function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Storage helpers
export const storage = {
    save: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    },
    load: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// Priority levels
export const PRIORITY = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

// Color codes for priorities
export const COLORS = {
    high: '#ff4444',
    medium: '#ffaa00',
    low: '#00aa00'
};`
          }
        ]
      }
    ]
  }
};

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  
  const loadSnippet = (snippetType) => {
    const template = CODE_TEMPLATES[snippetType];
    if (template) {
      // Send a custom event to ProjectEditor to load the template
      window.dispatchEvent(new CustomEvent('loadTemplate', { 
        detail: { 
          template: template,
          type: snippetType 
        } 
      }));
      
      // Count files in structure
      const countFiles = (items) => {
        let count = 0;
        items.forEach(item => {
          if (item.type === 'file') {
            count++;
          } else if (item.type === 'folder' && item.children) {
            count += countFiles(item.children);
          }
        });
        return count;
      };
      
      const fileCount = countFiles(template.structure);
      const templateName = snippetType === 'javascriptApp' ? 'JavaScript App' : 
                          snippetType === 'html' ? 'HTML Website' : 'JavaScript';
      
      toast({
        title: `${templateName} Template Loaded`,
        description: `Created ${fileCount} file${fileCount > 1 ? 's' : ''} with project structure`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  return (
    <Flex direction="column" h="100vh" bg={colorMode === "dark" ? "gray.900" : "gray.50"} overflow="hidden">
      {/* Header */}
      <Box
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderBottom="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        px={6}
        py={3}
        flexShrink={0}
      >
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <HStack spacing={2}>
              <FaPlay color="#0969da" />
              <Heading size="md" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                CodeCraft
              </Heading>
            </HStack>
            <Badge colorScheme="purple" variant="subtle">
              v1.0.0
            </Badge>
          </HStack>

          <HStack spacing={3}>
            <Tooltip label="View on GitHub" placement="bottom">
              <IconButton
                aria-label="GitHub"
                icon={<FaGithub />}
                variant="ghost"
                size="sm"
                onClick={() => window.open("https://github.com/smshagor-dev/codecraft.git", "_blank")}
              />
            </Tooltip>
            <Tooltip label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`} placement="bottom">
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                variant="ghost"
                size="sm"
                onClick={toggleColorMode}
              />
            </Tooltip>
          </HStack>
        </Flex>
      </Box>

      {/* Editor - takes remaining space */}
      <Box flex={1} overflow="hidden">
        <ProjectEditor />
      </Box>
      
      {/* Footer with Code Snippets */}
      <Box
        borderTop="2px solid"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        bg={colorMode === 'dark' ? 'rgba(17, 25, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
        backdropFilter="blur(10px)"
        px={6}
        py={3}
        flexShrink={0}
      >
        <HStack spacing={4} justify="space-between" align="center">
          <VStack align="start" spacing={0}>
            <Text fontSize="xs" fontWeight="bold" letterSpacing="wide" color={colorMode === 'dark' ? 'purple.300' : 'purple.600'}>
              QUICK START TEMPLATES
            </Text>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
              Load example code to get started quickly
            </Text>
          </VStack>
          
          <HStack spacing={3}>
            <Button
              size="sm"
              leftIcon={<FaCode />}
              variant="outline"
              colorScheme="orange"
              onClick={() => loadSnippet('html')}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(249, 146, 38, 0.15)' : 'rgba(249, 146, 38, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(249, 146, 38, 0.4)'
              }}
              transition="all 0.2s"
            >
              HTML Template
            </Button>
            
            <Button
              size="sm"
              leftIcon={<FaCode />}
              variant="outline"
              colorScheme="blue"
              onClick={() => loadSnippet('javascript')}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
              transition="all 0.2s"
            >
              JavaScript
            </Button>
          </HStack>
        </HStack>
      </Box>
    </Flex>
  );
}

export default App;
