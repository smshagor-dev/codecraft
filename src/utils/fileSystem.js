import { v4 as uuidv4 } from 'uuid';

export const FILE_TYPES = {
  FOLDER: 'folder',
  FILE: 'file'
};

export const getFileExtension = (filename) => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

export const getLanguageFromExtension = (filename) => {
  const extension = getFileExtension(filename);
  
  const languageMap = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'vue': 'vue',
    'svelte': 'svelte',
    
    // Web
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    
    // Backend & Programming Languages
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'cxx': 'cpp',
    'cc': 'cpp',
    'c': 'c',
    'h': 'c',
    'hpp': 'cpp',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'sol': 'solidity',
    'php': 'php',
    'rb': 'ruby',
    'scala': 'scala',
    'pl': 'perl',
    'pm': 'perl',
    'lua': 'lua',
    'hs': 'haskell',
    'elm': 'elm',
    'clj': 'clojure',
    'cljs': 'clojure',
    'erl': 'erlang',
    'ex': 'elixir',
    'exs': 'elixir',
    'r': 'r',
    'm': 'matlab',
    
    // Data & Config
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'prisma': 'prisma',
    'graphql': 'graphql',
    'gql': 'graphql',
    'csv': 'plaintext',
    'tsv': 'plaintext',
    
    // Documentation
    'md': 'markdown',
    'mdx': 'markdown',
    'txt': 'plaintext',
    'rst': 'restructuredtext',
    
    // Shell & Configs
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'ps1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',
    'conf': 'plaintext',
    'config': 'plaintext',
    'ini': 'ini',
    'toml': 'toml'
  };

  return languageMap[extension] || 'plaintext';
};

export const getIconForFile = (filename) => {
  const extension = getFileExtension(filename);
  
  const iconMap = {
    // JavaScript/TypeScript
    'js': '📜',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'vue': '💚',
    'svelte': '🟧',
    
    // Web
    'html': '🌐',
    'css': '🎨',
    'scss': '💜',
    'sass': '💜',
    'less': '🔵',
    
    // Backend
    'py': '🐍',
    'java': '☕',
    'go': '🔷',
    'rs': '🦀',
    'cpp': '🔵',
    'c': '🔵',
    'swift': '🐦',
    'kt': '🟣',
    'dart': '💙',
    'php': '🐘',
    'rb': '💎',
    
    // Data
    'json': '📋',
    'yaml': '⚙️',
    'yml': '⚙️',
    'xml': '📰',
    'sql': '🗃️',
    
    // Docs
    'md': '📝',
    'txt': '📄',
    'pdf': '📕'
  };

  return iconMap[extension] || '📄';
};

export const getFileCategory = (filename) => {
  const extension = getFileExtension(filename);
  
  const categories = {
    // Code
    'js': 'code', 'jsx': 'code', 'ts': 'code', 'tsx': 'code', 'vue': 'code', 'svelte': 'code',
    'py': 'code', 'java': 'code', 'go': 'code', 'rs': 'code', 'cpp': 'code', 'c': 'code',
    'swift': 'code', 'kt': 'code', 'dart': 'code', 'php': 'code', 'rb': 'code', 'scala': 'code',
    'lua': 'code', 'hs': 'code', 'elm': 'code', 'clj': 'code', 'erl': 'code', 'ex': 'code',
    
    // Web
    'html': 'web', 'css': 'web', 'scss': 'web', 'sass': 'web', 'less': 'web',
    
    // Data
    'json': 'data', 'yaml': 'data', 'yml': 'data', 'xml': 'data', 'sql': 'data',
    'csv': 'data', 'tsv': 'data', 'graphql': 'data', 'gql': 'data',
    
    // Docs
    'md': 'document', 'txt': 'document', 'pdf': 'document', 'doc': 'document', 'docx': 'document',
    
    // Images
    'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'gif': 'image', 'svg': 'image',
    'webp': 'image', 'bmp': 'image', 'ico': 'image',
    
    // Media
    'mp4': 'media', 'avi': 'media', 'mov': 'media', 'mp3': 'media', 'wav': 'media',
    
    // Archives
    'zip': 'archive', 'rar': 'archive', 'tar': 'archive', 'gz': 'archive',
    
    // Config
    'conf': 'config', 'config': 'config', 'ini': 'config', 'toml': 'config'
  };

  return categories[extension] || 'file';
};

// Get default template content for different file types
export const getDefaultTemplateContent = (filename) => {
  const extension = getFileExtension(filename);
  
  const templates = {
    // HTML
    'html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoderPoint - Welcome</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🚀 Welcome to CoderPoint</h1>
            <p>Your online coding playground</p>
        </header>
        
        <main class="main">
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>📝 Smart Editor</h3>
                    <p>Powerful code editor with syntax highlighting and auto-completion</p>
                </div>
                <div class="feature-card">
                    <h3>🌐 Live Preview</h3>
                    <p>See your changes in real-time as you code</p>
                </div>
                <div class="feature-card">
                    <h3>📁 File Manager</h3>
                    <p>Organize your projects with ease</p>
                </div>
                <div class="feature-card">
                    <h3>⚡ Fast Execution</h3>
                    <p>Run your code instantly with one click</p>
                </div>
            </div>
            
            <div class="cta-section">
                <button class="cta-button" onclick="startCoding()">Start Coding Now</button>
                <p class="hint">Try editing this file and see the live preview!</p>
            </div>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>`,

    // CSS
    'css': `/* CoderPoint - Main Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
}

.header h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
    color: white;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.feature-card p {
    opacity: 0.9;
    line-height: 1.5;
}

.cta-section {
    text-align: center;
}

.cta-button {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 1rem;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
}

.hint {
    color: rgba(255, 255, 255, 0.7);
    font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .header h1 {
        font-size: 2rem;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}`,

    // JavaScript
    'js': `// CoderPoint - Main JavaScript File
console.log('🚀 Welcome to CoderPoint! Start your Pratics Today!');

// Initialize the application
function init() {
    console.log('CoderPoint initialized successfully!');
    
    // Add interactive features
    setupEventListeners();
    displayWelcomeMessage();
}

// Setup event listeners
function setupEventListeners() {
    // Add click listeners to all feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const features = [
                'Smart Editor with syntax highlighting',
                'Live Preview of your code',
                'File Management system',
                'Fast code execution'
            ];
            alert(\`Feature: \${features[index]}\`);
        });
    });
}

// Display welcome message
function displayWelcomeMessage() {
    const now = new Date();
    const hours = now.getHours();
    let greeting;
    
    if (hours < 12) {
        greeting = 'Good morning! ☀️';
    } else if (hours < 18) {
        greeting = 'Good afternoon! 🌤️';
    } else {
        greeting = 'Good evening! 🌙';
    }
    
    console.log(\`\${greeting} Ready to code?\`);
}

// Start coding function
function startCoding() {
    const messages = [
        '🎉 Let\\'s build something amazing!',
        '🚀 Launching your coding journey...',
        '💡 Time to turn ideas into code!',
        '👨‍💻 Welcome to the developer zone!'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alert(randomMessage);
    
    // Example: Create a dynamic element
    const dynamicElement = document.createElement('div');
    dynamicElement.innerHTML = \`
        <div style="
            background: rgba(255,255,255,0.2);
            padding: 1rem;
            border-radius: 10px;
            margin-top: 1rem;
            text-align: center;
            color: white;
        ">
            <strong>✨ Pro Tip:</strong> Try creating new files in the file explorer!
        </div>
    \`;
    
    const ctaSection = document.querySelector('.cta-section');
    if (ctaSection) {
        ctaSection.appendChild(dynamicElement);
    }
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function generateRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);`,

    // Python
    'py': `# CoderPoint - Python File
# Welcome to CoderPoint! Start your Pratics Today!

print("🚀 Welcome to CoderPoint!")

def init():
    """
    Initialize the application
    """
    print("CoderPoint initialized successfully!")
    
    # Add interactive features
    display_welcome_message()
    demonstrate_features()

def display_welcome_message():
    """
    Display a personalized welcome message
    """
    from datetime import datetime
    
    now = datetime.now()
    hour = now.hour
    
    if hour < 12:
        greeting = "Good morning! ☀️"
    elif hour < 18:
        greeting = "Good afternoon! 🌤️"
    else:
        greeting = "Good evening! 🌙"
    
    print(f"{greeting} Ready to code?")

def demonstrate_features():
    """
    Demonstrate some Python features
    """
    # List of features
    features = [
        "Smart Editor with syntax highlighting",
        "Live Preview of your code",
        "File Management system",
        "Fast code execution"
    ]
    
    print("\\n✨ Available Features:")
    for i, feature in enumerate(features, 1):
        print(f"  {i}. {feature}")
    
    # Example data processing
    numbers = [1, 2, 3, 4, 5]
    squares = [x**2 for x in numbers]
    print(f"\\n📊 Example: Squares of {numbers} are {squares}")

def start_coding():
    """
    Start the coding session with motivation!
    """
    import random
    
    messages = [
        "🎉 Let's build something amazing!",
        "🚀 Launching your coding journey...",
        "💡 Time to turn ideas into code!",
        "👨‍💻 Welcome to the developer zone!"
    ]
    
    random_message = random.choice(messages)
    print(f"\\n{random_message}")
    
    return random_message

# Utility functions
def calculate_fibonacci(n):
    """
    Calculate Fibonacci sequence up to n numbers
    """
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    return sequence[:n]

def format_file_size(bytes):
    """
    Format file size in human-readable format
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes < 1024.0:
            return f"{bytes:.2f} {unit}"
        bytes /= 1024.0
    return f"{bytes:.2f} TB"

# Main execution
if __name__ == "__main__":
    init()
    start_coding()
    
    # Demonstrate fibonacci
    fib_sequence = calculate_fibonacci(10)
    print(f"\\n🔢 Fibonacci sequence: {fib_sequence}")`,

    // Java
    'java': `/*
 * CoderPoint - Java File
 * Welcome to CoderPoint! Start your Pratics Today!
 */

public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 Welcome to CoderPoint!");
        
        // Initialize the application
        init();
        displayWelcomeMessage();
        startCoding();
    }
    
    /**
     * Initialize the application
     */
    public static void init() {
        System.out.println("CoderPoint initialized successfully!");
        demonstrateFeatures();
    }
    
    /**
     * Display a personalized welcome message
     */
    public static void displayWelcomeMessage() {
        java.time.LocalTime now = java.time.LocalTime.now();
        int hour = now.getHour();
        String greeting;
        
        if (hour < 12) {
            greeting = "Good morning! ☀️";
        } else if (hour < 18) {
            greeting = "Good afternoon! 🌤️";
        } else {
            greeting = "Good evening! 🌙";
        }
        
        System.out.println(greeting + " Ready to code?");
    }
    
    /**
     * Demonstrate Java features
     */
    public static void demonstrateFeatures() {
        String[] features = {
            "Smart Editor with syntax highlighting",
            "Live Preview of your code", 
            "File Management system",
            "Fast code execution"
        };
        
        System.out.println("\\n✨ Available Features:");
        for (int i = 0; i < features.length; i++) {
            System.out.println("  " + (i + 1) + ". " + features[i]);
        }
        
        // Example: Calculate squares
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.print("\\n📊 Squares: ");
        for (int num : numbers) {
            System.out.print(num * num + " ");
        }
        System.out.println();
    }
    
    /**
     * Start the coding session
     */
    public static void startCoding() {
        String[] messages = {
            "🎉 Let's build something amazing!",
            "🚀 Launching your coding journey...",
            "💡 Time to turn ideas into code!",
            "👨‍💻 Welcome to the developer zone!"
        };
        
        String randomMessage = messages[(int)(Math.random() * messages.length)];
        System.out.println("\\n" + randomMessage);
    }
    
    /**
     * Utility method to calculate factorial
     */
    public static int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
    
    /**
     * Utility method to check if number is prime
     */
    public static boolean isPrime(int num) {
        if (num <= 1) return false;
        for (int i = 2; i <= Math.sqrt(num); i++) {
            if (num % i == 0) return false;
        }
        return true;
    }
}`,

    // C++
    'cpp': `/*
 * CoderPoint - C++ File
 * Welcome to CoderPoint! Start your Pratics Today!
 */

#include <iostream>
#include <vector>
#include <string>
#include <ctime>
#include <cstdlib>

using namespace std;

class CoderPoint {
public:
    /**
     * Initialize the application
     */
    static void init() {
        cout << "🚀 Welcome to CoderPoint!" << endl;
        cout << "CoderPoint initialized successfully!" << endl;
        
        displayWelcomeMessage();
        demonstrateFeatures();
    }
    
    /**
     * Display a personalized welcome message
     */
    static void displayWelcomeMessage() {
        time_t now = time(0);
        tm* localTime = localtime(&now);
        int hour = localTime->tm_hour;
        string greeting;
        
        if (hour < 12) {
            greeting = "Good morning! ☀️";
        } else if (hour < 18) {
            greeting = "Good afternoon! 🌤️";
        } else {
            greeting = "Good evening! 🌙";
        }
        
        cout << greeting << " Ready to code?" << endl;
    }
    
    /**
     * Demonstrate C++ features
     */
    static void demonstrateFeatures() {
        vector<string> features = {
            "Smart Editor with syntax highlighting",
            "Live Preview of your code",
            "File Management system", 
            "Fast code execution"
        };
        
        cout << "\\n✨ Available Features:" << endl;
        for (int i = 0; i < features.size(); i++) {
            cout << "  " << (i + 1) << ". " << features[i] << endl;
        }
        
        // Example: Calculate squares using modern C++
        vector<int> numbers = {1, 2, 3, 4, 5};
        cout << "\\n📊 Squares: ";
        for (const auto& num : numbers) {
            cout << num * num << " ";
        }
        cout << endl;
    }
    
    /**
     * Start the coding session
     */
    static void startCoding() {
        vector<string> messages = {
            "🎉 Let's build something amazing!",
            "🚀 Launching your coding journey...",
            "💡 Time to turn ideas into code!",
            "👨‍💻 Welcome to the developer zone!"
        };
        
        srand(time(0));
        string randomMessage = messages[rand() % messages.size()];
        cout << "\\n" << randomMessage << endl;
    }
    
    /**
     * Utility method to calculate factorial
     */
    static int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
    
    /**
     * Utility method to generate Fibonacci sequence
     */
    static vector<int> fibonacci(int n) {
        vector<int> sequence;
        if (n >= 1) sequence.push_back(0);
        if (n >= 2) sequence.push_back(1);
        
        for (int i = 2; i < n; i++) {
            sequence.push_back(sequence[i-1] + sequence[i-2]);
        }
        return sequence;
    }
};

int main() {
    // Initialize and run CoderPoint
    CoderPoint::init();
    CoderPoint::startCoding();
    
    // Demonstrate utilities
    cout << "\\n🔢 Factorial of 5: " << CoderPoint::factorial(5) << endl;
    
    vector<int> fib = CoderPoint::fibonacci(10);
    cout << "📈 Fibonacci sequence: ";
    for (int num : fib) {
        cout << num << " ";
    }
    cout << endl;
    
    return 0;
}`,

    // Ruby
    'rb': `# CoderPoint - Ruby File
# Welcome to CoderPoint! Start your Pratics Today!

puts "🚀 Welcome to CoderPoint!"

def init
  # Initialize the application
  puts "CoderPoint initialized successfully!"
  
  # Add interactive features
  display_welcome_message
  demonstrate_features
end

def display_welcome_message
  # Display a personalized welcome message
  hour = Time.now.hour
  
  greeting = if hour < 12
    "Good morning! ☀️"
  elsif hour < 18
    "Good afternoon! 🌤️"
  else
    "Good evening! 🌙"
  end
  
  puts "#{greeting} Ready to code?"
end

def demonstrate_features
  # Demonstrate some Ruby features
  features = [
    "Smart Editor with syntax highlighting",
    "Live Preview of your code",
    "File Management system",
    "Fast code execution"
  ]
  
  puts "\\n✨ Available Features:"
  features.each_with_index do |feature, index|
    puts "  #{index + 1}. #{feature}"
  end
  
  # Example Ruby magic
  numbers = [1, 2, 3, 4, 5]
  squares = numbers.map { |x| x**2 }
  puts "\\n📊 Example: Squares of #{numbers} are #{squares}"
end

def start_coding
  # Start the coding session with motivation!
  messages = [
    "🎉 Let's build something amazing!",
    "🚀 Launching your coding journey...", 
    "💡 Time to turn ideas into code!",
    "👨‍💻 Welcome to the developer zone!"
  ]
  
  random_message = messages.sample
  puts "\\n#{random_message}"
  
  random_message
end

# Utility methods
def calculate_fibonacci(n)
  # Calculate Fibonacci sequence up to n numbers
  sequence = [0, 1]
  (2...n).each do |i|
    sequence << sequence[i-1] + sequence[i-2]
  end
  sequence[0...n]
end

def format_file_size(bytes)
  # Format file size in human-readable format
  units = ['B', 'KB', 'MB', 'GB']
  size = bytes.to_f
  units.each do |unit|
    return "#{size.round(2)} #{unit}" if size < 1024
    size /= 1024
  end
  "#{size.round(2)} TB"
end

# Main execution
if __FILE__ == $0
  init
  start_coding
  
  # Demonstrate fibonacci
  fib_sequence = calculate_fibonacci(10)
  puts "\\n🔢 Fibonacci sequence: #{fib_sequence}"
end`,

    // PHP
    'php': `<?php
/**
 * CoderPoint - PHP File
 * Welcome to CoderPoint! Start your Pratics Today!
 */

echo "🚀 Welcome to CoderPoint!\\n";

/**
 * Initialize the application
 */
function init() {
    echo "CoderPoint initialized successfully!\\n";
    
    // Add interactive features
    displayWelcomeMessage();
    demonstrateFeatures();
}

/**
 * Display a personalized welcome message
 */
function displayWelcomeMessage() {
    $hour = date('H');
    
    if ($hour < 12) {
        $greeting = "Good morning! ☀️";
    } else if ($hour < 18) {
        $greeting = "Good afternoon! 🌤️";
    } else {
        $greeting = "Good evening! 🌙";
    }
    
    echo $greeting . " Ready to code?\\n";
}

/**
 * Demonstrate PHP features
 */
function demonstrateFeatures() {
    $features = [
        "Smart Editor with syntax highlighting",
        "Live Preview of your code",
        "File Management system",
        "Fast code execution"
    ];
    
    echo "\\n✨ Available Features:\\n";
    foreach ($features as $index => $feature) {
        echo "  " . ($index + 1) . ". " . $feature . "\\n";
    }
    
    // Example data processing
    $numbers = [1, 2, 3, 4, 5];
    $squares = array_map(function($x) { return $x * $x; }, $numbers);
    echo "\\n📊 Example: Squares of " . implode(', ', $numbers) . " are " . implode(', ', $squares) . "\\n";
}

/**
 * Start the coding session
 */
function startCoding() {
    $messages = [
        "🎉 Let's build something amazing!",
        "🚀 Launching your coding journey...",
        "💡 Time to turn ideas into code!",
        "👨‍💻 Welcome to the developer zone!"
    ];
    
    $randomMessage = $messages[array_rand($messages)];
    echo "\\n" . $randomMessage . "\\n";
    
    return $randomMessage;
}

/**
 * Utility function to calculate factorial
 */
function factorial($n) {
    if ($n == 0) return 1;
    return $n * factorial($n - 1);
}

/**
 * Utility function to check if number is prime
 */
function isPrime($num) {
    if ($num <= 1) return false;
    for ($i = 2; $i <= sqrt($num); $i++) {
        if ($num % $i == 0) return false;
    }
    return true;
}

// Main execution
if (isset($argv[0]) && basename($argv[0]) == basename(__FILE__)) {
    init();
    startCoding();
    
    // Demonstrate factorial
    echo "\\n🔢 Factorial of 5: " . factorial(5) . "\\n";
}
?>`,
    
    // Default template for other file types
    'default': `// Welcome to CoderPoint!
// This is your new ${getLanguageFromExtension(filename)} file
// Start coding here...`
  };

  return templates[extension] || templates['default'];
};

export class FileSystemNode {
  constructor(name, type = FILE_TYPES.FILE, parent = null) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.parent = parent;
    this.children = type === FILE_TYPES.FOLDER ? [] : null;
    this.content = type === FILE_TYPES.FILE ? '' : null;
    this.language = type === FILE_TYPES.FILE ? getLanguageFromExtension(name) : null;
    this.category = type === FILE_TYPES.FILE ? getFileCategory(name) : null;
    this.isOpen = type === FILE_TYPES.FOLDER ? false : null;
    this.createdAt = new Date().toISOString();
    this.modifiedAt = new Date().toISOString();
    this.size = 0;
    this.encoding = 'utf-8';
  }

  addChild(child) {
    if (this.type === FILE_TYPES.FOLDER) {
      child.parent = this.id;
      this.children.push(child);
      this.updateModified();
      return child;
    }
    throw new Error('Cannot add child to a file');
  }

  removeChild(childId) {
    if (this.type === FILE_TYPES.FOLDER) {
      this.children = this.children.filter(child => child.id !== childId);
      this.updateModified();
    }
  }

  findNode(nodeId) {
    if (this.id === nodeId) {
      return this;
    }
    if (this.type === FILE_TYPES.FOLDER && this.children) {
      for (const child of this.children) {
        const found = child.findNode(nodeId);
        if (found) return found;
      }
    }
    return null;
  }

  findNodeByPath(path) {
    const parts = path.split('/').filter(part => part && part !== '.');
    let current = this;

    for (const part of parts) {
      if (current.type !== FILE_TYPES.FOLDER) return null;
      const child = current.children?.find(child => child.name === part);
      if (!child) return null;
      current = child;
    }

    return current;
  }

  getPath() {
    const path = [];
    let current = this;
    while (current && current.name !== 'root') {
      path.unshift(current.name);
      current = current.parent instanceof FileSystemNode ? current.parent : null;
    }
    return path.join('/');
  }

  updateModified() {
    this.modifiedAt = new Date().toISOString();
  }

  calculateSize() {
    if (this.type === FILE_TYPES.FILE) {
      this.size = this.content ? Buffer.from(this.content).length : 0;
    } else if (this.type === FILE_TYPES.FOLDER && this.children) {
      this.size = this.children.reduce((total, child) => total + child.calculateSize(), 0);
    }
    return this.size;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      parent: this.parent,
      children: this.children ? this.children.map(child => child.toJSON()) : null,
      content: this.content,
      language: this.language,
      category: this.category,
      isOpen: this.isOpen,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      size: this.size,
      encoding: this.encoding
    };
  }

  static fromJSON(json) {
    const node = new FileSystemNode(json.name, json.type);
    node.id = json.id;
    node.parent = json.parent;
    node.content = json.content;
    node.language = json.language;
    node.category = json.category;
    node.isOpen = json.isOpen;
    node.createdAt = json.createdAt;
    node.modifiedAt = json.modifiedAt;
    node.size = json.size || 0;
    node.encoding = json.encoding || 'utf-8';
    
    if (json.children && Array.isArray(json.children)) {
      node.children = json.children.map(child => FileSystemNode.fromJSON(child));
    }
    
    return node;
  }

  // Helper methods for file operations
  isTextFile() {
    if (this.type !== FILE_TYPES.FILE) return false;
    
    const textExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
      'html', 'css', 'scss', 'sass', 'less',
      'py', 'java', 'go', 'rs', 'cpp', 'c', 'h', 'swift', 'kt', 'dart',
      'php', 'rb', 'scala', 'lua', 'hs', 'elm', 'clj', 'erl', 'ex',
      'json', 'yaml', 'yml', 'xml', 'sql', 'graphql', 'gql',
      'md', 'txt', 'rst', 'sh', 'bash', 'ps1', 'bat', 'cmd',
      'conf', 'config', 'ini', 'toml'
    ];
    
    return textExtensions.includes(getFileExtension(this.name));
  }

  getMimeType() {
    const extension = getFileExtension(this.name);
    const mimeTypes = {
      'js': 'application/javascript',
      'jsx': 'application/javascript',
      'ts': 'application/typescript',
      'tsx': 'application/typescript',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'py': 'text/x-python',
      'java': 'text/x-java',
      'cpp': 'text/x-c++',
      'c': 'text/x-c',
      'php': 'application/x-php',
      'xml': 'application/xml',
      'svg': 'image/svg+xml',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'zip': 'application/zip'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

export class FileSystem {
  constructor() {
    this.root = new FileSystemNode('root', FILE_TYPES.FOLDER);
    this.openFiles = new Map();
    this.selectedFile = null;
    this.recentFiles = [];
  }

  createFile(parentId, filename, content = '', autoOpen = true) {
    const parent = parentId ? this.findNode(parentId) : this.root;
    if (!parent || parent.type !== FILE_TYPES.FOLDER) {
      throw new Error('Invalid parent folder');
    }
    
    // Check if file already exists
    if (parent.children?.some(child => child.name === filename)) {
      throw new Error(`File "${filename}" already exists`);
    }
    
    const file = new FileSystemNode(filename, FILE_TYPES.FILE);
    
    // Use provided content or get default template
    if (content === '') {
      file.content = getDefaultTemplateContent(filename);
    } else {
      file.content = content;
    }
    
    file.language = getLanguageFromExtension(filename);
    file.category = getFileCategory(filename);
    parent.addChild(file);
    
    // Auto-open the file in editor
    if (autoOpen) {
      this.openFile(file.id);
    }
    
    return file;
  }

  createFolder(parentId, foldername) {
    const parent = parentId ? this.findNode(parentId) : this.root;
    if (!parent || parent.type !== FILE_TYPES.FOLDER) {
      throw new Error('Invalid parent folder');
    }
    
    // Check if folder already exists
    if (parent.children?.some(child => child.name === foldername)) {
      throw new Error(`Folder "${foldername}" already exists`);
    }
    
    const folder = new FileSystemNode(foldername, FILE_TYPES.FOLDER);
    parent.addChild(folder);
    return folder;
  }

  deleteNode(nodeId) {
    if (nodeId === this.root.id) {
      throw new Error('Cannot delete root folder');
    }
    
    const node = this.findNode(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    // Find parent and remove child
    const parent = this.findNode(node.parent);
    if (parent) {
      parent.removeChild(nodeId);
    }
    
    // Clean up open files and selection
    this.openFiles.delete(nodeId);
    if (this.selectedFile === nodeId) {
      this.selectedFile = null;
    }
    this.recentFiles = this.recentFiles.filter(id => id !== nodeId);
    
    return true;
  }

  renameNode(nodeId, newName) {
    const node = this.findNode(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    // Check for name conflicts in the same directory
    const parent = this.findNode(node.parent);
    if (parent && parent.children?.some(child => child.id !== nodeId && child.name === newName)) {
      throw new Error(`A file or folder with name "${newName}" already exists`);
    }
    
    node.name = newName;
    if (node.type === FILE_TYPES.FILE) {
      node.language = getLanguageFromExtension(newName);
      node.category = getFileCategory(newName);
    }
    node.updateModified();
    
    return node;
  }

  updateFileContent(fileId, content) {
    const file = this.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    file.content = content;
    file.updateModified();
    file.calculateSize();
    
    return file;
  }

  getFileContent(fileId) {
    const file = this.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    return file.content;
  }

  openFile(fileId) {
    const file = this.findNode(fileId);
    if (!file || file.type !== FILE_TYPES.FILE) {
      throw new Error('File not found');
    }
    
    this.openFiles.set(fileId, file);
    this.selectedFile = fileId;
    
    // Add to recent files
    this.recentFiles = this.recentFiles.filter(id => id !== fileId);
    this.recentFiles.unshift(fileId);
    if (this.recentFiles.length > 10) {
      this.recentFiles.pop();
    }
    
    return file;
  }

  closeFile(fileId) {
    this.openFiles.delete(fileId);
    if (this.selectedFile === fileId) {
      this.selectedFile = null;
    }
  }

  getOpenFiles() {
    return Array.from(this.openFiles.values());
  }

  toggleFolder(folderId) {
    const folder = this.findNode(folderId);
    if (!folder || folder.type !== FILE_TYPES.FOLDER) {
      throw new Error('Folder not found');
    }
    
    folder.isOpen = !folder.isOpen;
    folder.updateModified();
    return folder;
  }

  findNode(nodeId) {
    return this.root.findNode(nodeId);
  }

  findNodeByPath(path) {
    return this.root.findNodeByPath(path);
  }

  getAllFiles() {
    const files = [];
    
    const traverse = (node) => {
      if (node.type === FILE_TYPES.FILE) {
        files.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    traverse(this.root);
    return files;
  }

  getFilesByType(extension) {
    return this.getAllFiles().filter(file => 
      getFileExtension(file.name) === extension
    );
  }

  searchFiles(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    const traverse = (node) => {
      if (node.name.toLowerCase().includes(searchTerm)) {
        results.push(node);
      }
      if (node.type === FILE_TYPES.FILE && node.content && 
          node.content.toLowerCase().includes(searchTerm)) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    traverse(this.root);
    return [...new Set(results)]; // Remove duplicates
  }

  calculateTotalSize() {
    return this.root.calculateSize();
  }

  exportToJSON() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      const newFS = FileSystem.fromJSON(data);
      
      // Copy properties
      this.root = newFS.root;
      this.openFiles = newFS.openFiles;
      this.selectedFile = newFS.selectedFile;
      this.recentFiles = newFS.recentFiles;
      
      return true;
    } catch (error) {
      throw new Error('Invalid project file format');
    }
  }

  toJSON() {
    return {
      root: this.root.toJSON(),
      openFiles: Array.from(this.openFiles.keys()),
      selectedFile: this.selectedFile,
      recentFiles: this.recentFiles,
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
  }

  static fromJSON(json) {
    const fs = new FileSystem();
    fs.root = FileSystemNode.fromJSON(json.root);
    
    if (json.openFiles) {
      json.openFiles.forEach(fileId => {
        const file = fs.findNode(fileId);
        if (file) {
          fs.openFiles.set(fileId, file);
        }
      });
    }
    
    fs.selectedFile = json.selectedFile || null;
    fs.recentFiles = json.recentFiles || [];
    
    return fs;
  }

  // Create a welcome project with HTML, CSS, and JS files in src/ folder
  static createDefaultProject() {
    const fs = new FileSystem();
    
    // Create src folder
    const srcFolder = fs.createFolder(fs.root.id, 'src');
    
    // Create the three main files in src folder
    const htmlFile = fs.createFile(srcFolder.id, 'index.html', '', false);
    const cssFile = fs.createFile(srcFolder.id, 'style.css', '', false);
    const jsFile = fs.createFile(srcFolder.id, 'script.js', '', false);
    
    // Open the HTML file by default
    fs.openFile(htmlFile.id);
    
    // Make src folder open by default
    srcFolder.isOpen = true;
    
    return fs;
  }
}

// Utility functions for file operations
export const isValidFilename = (filename) => {
  const invalidChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
  return !invalidChars.some(char => filename.includes(char)) && filename.trim() !== '';
};

export const generateUniqueName = (baseName, existingNames) => {
  let counter = 1;
  let newName = baseName;
  
  while (existingNames.includes(newName)) {
    const extension = getFileExtension(baseName);
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
    newName = extension ? `${nameWithoutExt} (${counter}).${extension}` : `${baseName} (${counter})`;
    counter++;
  }
  
  return newName;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getSupportedFileTypes = () => {
  return {
    code: ['js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'py', 'java', 'go', 'rs', 'cpp', 'c', 'php', 'rb'],
    web: ['html', 'css', 'scss', 'sass', 'less'],
    data: ['json', 'yaml', 'yml', 'xml', 'sql', 'csv'],
    documents: ['md', 'txt', 'pdf'],
    config: ['json', 'yaml', 'yml', 'toml', 'ini']
  };
};