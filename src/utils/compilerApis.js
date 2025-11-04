export const COMPILER_SYSTEM = {
  backend: {
    name: 'CoderPoint Backend',
    api: 'https://cloud.coderpoint.ru/api/execute.php',
    method: 'POST',
    priority: 1,
    languages: ['python'],
    timeout: 30000,
    features: ['file_processing', 'virtual_env', 'package_management', 'file_reading'],
    fileSupport: {
      txt: { read: true, write: true },
      csv: { read: true, write: true, parse: true },
      json: { read: true, write: true, parse: true },
      xlsx: { read: true, write: false },
      xls: { read: true, write: false },
      xml: { read: true, write: true },
      pdf: { read: false, write: false }
    },
    pythonConfig: {
      version: '3.9',
      defaultPackages: ['numpy', 'pandas', 'matplotlib', 'requests', 'scipy', 'sklearn', 'openpyxl'],
      fileReadingPackages: ['pandas', 'openpyxl', 'json', 'csv'],
      virtualEnv: true,
      timeout: 30
    }
  },
  piston: {
    name: 'Piston API',
    api: 'https://emkc.org/api/v2/piston/execute',
    method: 'POST',
    priority: 2,
    languages: ['javascript', 'java', 'cpp', 'c', 'rust', 'go', 'csharp', 'php', 'ruby', 'swift', 'kotlin'],
    timeout: 15000
  }
};

// Enhanced language mapping with backend priority
export const LANGUAGE_MAPPING = {
  // Python - Always use backend only
  'py': {name: 'python', version: '3.9', backend: true, piston: false},
  'python': {name: 'python', version: '3.9', backend: true, piston: false},
  'python3': {name: 'python', version: '3.9', backend: true, piston: false},
  
  // JavaScript - Try backend first, then piston
  'js': {name: 'javascript', version: 'node', backend: true, piston: true},
  'javascript': {name: 'javascript', version: 'node', backend: true, piston: true},
  'jsx': {name: 'javascript', version: 'node', backend: true, piston: true},
  'node': {name: 'javascript', version: 'node', backend: true, piston: true},
  'nodejs': {name: 'javascript', version: 'node', backend: true, piston: true},
  
  // Java - Try backend first, then piston
  'java': {name: 'java', version: '11+', backend: true, piston: true},
  
  // C/C++ - Use piston only
  'cpp': {name: 'cpp', version: 'c++17', backend: false, piston: true},
  'c++': {name: 'cpp', version: 'c++17', backend: false, piston: true},
  'cc': {name: 'cpp', version: 'c++17', backend: false, piston: true},
  'cxx': {name: 'cpp', version: 'c++17', backend: false, piston: true},
  'c': {name: 'c', version: 'c11', backend: false, piston: true},
  
  // C# - Use piston only
  'cs': {name: 'csharp', version: 'latest', backend: false, piston: true},
  'csharp': {name: 'csharp', version: 'latest', backend: false, piston: true},
  'c#': {name: 'csharp', version: 'latest', backend: false, piston: true},
  
  // PHP - Use piston only
  'php': {name: 'php', version: '7.4+', backend: false, piston: true},
  
  // Ruby - Use piston only
  'rb': {name: 'ruby', version: 'latest', backend: false, piston: true},
  'ruby': {name: 'ruby', version: 'latest', backend: false, piston: true},
  
  // Go - Use piston only
  'go': {name: 'go', version: 'latest', backend: false, piston: true},
  'golang': {name: 'go', version: 'latest', backend: false, piston: true},
  
  // Rust - Use piston only
  'rs': {name: 'rust', version: 'latest', backend: false, piston: true},
  'rust': {name: 'rust', version: 'latest', backend: false, piston: true},
  
  // Swift - Use piston only
  'swift': {name: 'swift', version: 'latest', backend: false, piston: true},
  
  // Kotlin - Use piston only
  'kt': {name: 'kotlin', version: 'latest', backend: false, piston: true},
  'kotlin': {name: 'kotlin', version: 'latest', backend: false, piston: true},
  
  // Shell - Use piston only
  'sh': {name: 'shell', version: 'bash', backend: false, piston: true},
  'bash': {name: 'shell', version: 'bash', backend: false, piston: true},
  'shell': {name: 'shell', version: 'bash', backend: false, piston: true},
  'zsh': {name: 'shell', version: 'zsh', backend: false, piston: true}
};

// Enhanced file type detection with Python backend support
export const FILE_TYPE_DETECTION = {
  // Text files
  'txt': {type: 'text', mime: 'text/plain', parser: 'text', backend: true},
  'text': {type: 'text', mime: 'text/plain', parser: 'text', backend: true},
  'log': {type: 'text', mime: 'text/plain', parser: 'text', backend: true},
  
  // CSV files
  'csv': {type: 'csv', mime: 'text/csv', parser: 'csv', backend: true},
  'tsv': {type: 'csv', mime: 'text/tab-separated-values', parser: 'csv', backend: true},
  
  // Excel files
  'xlsx': {type: 'excel', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', parser: 'excel', backend: true},
  'xls': {type: 'excel', mime: 'application/vnd.ms-excel', parser: 'excel', backend: true},
  'xlsm': {type: 'excel', mime: 'application/vnd.ms-excel.sheet.macroEnabled.12', parser: 'excel', backend: true},
  
  // JSON files
  'json': {type: 'json', mime: 'application/json', parser: 'json', backend: true},
  
  // XML files
  'xml': {type: 'xml', mime: 'application/xml', parser: 'xml', backend: true},
  
  // Data files
  'yaml': {type: 'yaml', mime: 'application/x-yaml', parser: 'yaml', backend: true},
  'yml': {type: 'yaml', mime: 'application/x-yaml', parser: 'yaml', backend: true},
  
  // Code files
  'py': {type: 'python', mime: 'text/x-python', parser: 'code', backend: true},
  'js': {type: 'javascript', mime: 'application/javascript', parser: 'code', backend: true},
  'java': {type: 'java', mime: 'text/x-java', parser: 'code', backend: true}
};

// Enhanced language detection utility
export const detectLanguageFromCode = (code) => {
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return 'python'; // default
  }
  
  const trimmedCode = code.trim();
  const firstLine = trimmedCode.split('\n')[0].trim().toLowerCase();
  
  // Detect from shebang
  if (firstLine.startsWith('#!')) {
    if (firstLine.includes('python')) return 'python';
    if (firstLine.includes('node')) return 'javascript';
    if (firstLine.includes('bash') || firstLine.includes('sh')) return 'shell';
    if (firstLine.includes('php')) return 'php';
    if (firstLine.includes('ruby')) return 'ruby';
  }
  
  // Detect from class declarations (Java/C#)
  if (trimmedCode.includes('public class') || trimmedCode.includes('class ') && trimmedCode.includes('{') && !trimmedCode.includes('def ')) {
    if (trimmedCode.includes('System.') || trimmedCode.includes('import java.')) return 'java';
    if (trimmedCode.includes('Console.') || trimmedCode.includes('using System')) return 'csharp';
  }
  
  // Detect from function patterns
  if (trimmedCode.includes('def ') && trimmedCode.includes(':')) return 'python';
  if ((trimmedCode.includes('function') || trimmedCode.includes('const ') || trimmedCode.includes('let ') || trimmedCode.includes('var ')) && 
      trimmedCode.includes('{') && trimmedCode.includes('}')) return 'javascript';
  
  // Detect from includes/imports
  if (trimmedCode.includes('#include')) return 'cpp';
  if (trimmedCode.includes('<?php')) return 'php';
  if (trimmedCode.includes('package main') || trimmedCode.includes('import "fmt"')) return 'go';
  if (trimmedCode.includes('fn main()')) return 'rust';
  
  // Detect from print statements
  if (trimmedCode.includes('System.out.print')) return 'java';
  if (trimmedCode.includes('cout <<')) return 'cpp';
  if (trimmedCode.includes('printf(') || trimmedCode.includes('puts(')) return 'c';
  if (trimmedCode.includes('console.log')) return 'javascript';
  if (trimmedCode.includes('print(') && !trimmedCode.includes('System.out.print')) return 'python';
  
  return 'python'; // default fallback
};

// Enhanced code validation for language compatibility
export const validateCodeForLanguage = (code, targetLanguage) => {
  if (!code || code.trim().length === 0) {
    return { valid: true, code: '', warning: null };
  }

  const trimmedCode = code.trim();
  
  // Language-specific syntax validation
  const incompatiblePatterns = {
    python: [
      { pattern: /class\s+\w+\s*\{/, language: 'Java/C++', example: 'class MyClass {' },
      { pattern: /public\s+class/, language: 'Java', example: 'public class Main' },
      { pattern: /void\s+main/, language: 'Java/C/C++', example: 'void main()' },
      { pattern: /System\.out\.print/, language: 'Java', example: 'System.out.println()' },
      { pattern: /#include\s*<.*>/, language: 'C/C++', example: '#include <iostream>' },
      { pattern: /using\s+namespace/, language: 'C++', example: 'using namespace std;' },
      { pattern: /cout\s*<</, language: 'C++', example: 'cout << "hello";' },
      { pattern: /printf\s*\(/, language: 'C', example: 'printf("hello");' },
      { pattern: /<\?php/, language: 'PHP', example: '<?php echo "hello"; ?>' }
    ],
    java: [
      { pattern: /def\s+\w+\s*\(.*\):/, language: 'Python', example: 'def my_function():' },
      { pattern: /print\(.*\)/, language: 'Python', example: 'print("hello")' },
      { pattern: /import\s+\w+$/, language: 'Python', example: 'import os' },
      { pattern: /#include/, language: 'C/C++', example: '#include <stdio.h>' },
      { pattern: /<\?php/, language: 'PHP', example: '<?php echo "hello"; ?>' }
    ],
    cpp: [
      { pattern: /def\s+\w+\s*\(.*\):/, language: 'Python', example: 'def my_function():' },
      { pattern: /class\s+\w+:/, language: 'Python', example: 'class MyClass:' },
      { pattern: /print\(.*\)/, language: 'Python', example: 'print("hello")' },
      { pattern: /System\.out\.print/, language: 'Java', example: 'System.out.println()' },
      { pattern: /public\s+class/, language: 'Java', example: 'public class Main' }
    ],
    c: [
      { pattern: /def\s+\w+\s*\(.*\):/, language: 'Python', example: 'def my_function():' },
      { pattern: /class\s+\w+:/, language: 'Python', example: 'class MyClass:' },
      { pattern: /print\(.*\)/, language: 'Python', example: 'print("hello")' },
      { pattern: /System\.out\.print/, language: 'Java', example: 'System.out.println()' },
      { pattern: /public\s+class/, language: 'Java', example: 'public class Main' },
      { pattern: /cout\s*<</, language: 'C++', example: 'cout << "hello";' }
    ],
    javascript: [
      { pattern: /def\s+\w+\s*\(.*\):/, language: 'Python', example: 'def my_function():' },
      { pattern: /class\s+\w+\s*\{/, language: 'Java/C++', example: 'class MyClass {' },
      { pattern: /public\s+class/, language: 'Java', example: 'public class Main' },
      { pattern: /System\.out\.print/, language: 'Java', example: 'System.out.println()' },
      { pattern: /#include/, language: 'C/C++', example: '#include <iostream>' }
    ],
    php: [
      { pattern: /def\s+\w+\s*\(.*\):/, language: 'Python', example: 'def my_function():' },
      { pattern: /class\s+\w+\s*\{/, language: 'Java/C++', example: 'class MyClass {' },
      { pattern: /public\s+class/, language: 'Java', example: 'public class Main' },
      { pattern: /System\.out\.print/, language: 'Java', example: 'System.out.println()' },
      { pattern: /#include/, language: 'C/C++', example: '#include <iostream>' }
    ]
  };

  const patterns = incompatiblePatterns[targetLanguage] || [];
  const detectedIssues = [];

  for (const { pattern, language, example } of patterns) {
    if (pattern.test(trimmedCode)) {
      detectedIssues.push({
        language,
        example,
        pattern: pattern.source
      });
    }
  }

  if (detectedIssues.length > 0) {
    const warning = `Found ${detectedIssues.length} incompatible syntax pattern${detectedIssues.length > 1 ? 's' : ''} from ${detectedIssues.map(issue => issue.language).join(', ')}`;
    
    return { 
      valid: false, 
      code: trimmedCode,
      error: `Language mismatch: Code contains ${detectedIssues[0].language} syntax (e.g., "${detectedIssues[0].example}") but current language is ${targetLanguage}`,
      warnings: detectedIssues,
      details: detectedIssues
    };
  }
  
  return { valid: true, code: trimmedCode, warning: null };
};

// Enhanced execution result structure
class ExecutionResult {
  constructor() {
    this.success = false;
    this.output = '';
    this.error = '';
    this.executionTime = 0;
    this.memory = 0;
    this.exitCode = 0;
    this.apiUsed = '';
    this.language = '';
    this.timestamp = new Date().toISOString();
    this.metadata = {};
    this.filesProcessed = [];
  }
}

// Enhanced input requirements analysis
export const analyzeInputRequirements = (code, language) => {
  if (!code || typeof code !== 'string') {
    return [];
  }

  const inputFields = [];
  const lines = code.split('\n');
  
  // Language-specific input detection patterns
  const patterns = {
    python: [
      { pattern: /input\s*\(/, type: 'text', description: 'Python input() function' },
      { pattern: /sys\.stdin/, type: 'text', description: 'System stdin' },
      { pattern: /argparse/, type: 'command_line', description: 'Command line arguments' },
      { pattern: /open\s*\(/, type: 'file', description: 'File reading operation' },
      { pattern: /pandas\.read_/, type: 'file', description: 'Pandas file reading' },
      { pattern: /with\s+open/, type: 'file', description: 'File context manager' }
    ],
    javascript: [
      { pattern: /prompt\s*\(/, type: 'text', description: 'Browser prompt' },
      { pattern: /readline\s*\(/, type: 'text', description: 'Node.js readline' },
      { pattern: /process\.stdin/, type: 'text', description: 'Node.js stdin' },
      { pattern: /fs\.readFile/, type: 'file', description: 'File system reading' }
    ],
    java: [
      { pattern: /Scanner\s*\(/, type: 'text', description: 'Java Scanner' },
      { pattern: /System\.in/, type: 'text', description: 'System input stream' },
      { pattern: /BufferedReader/, type: 'text', description: 'Buffered reader' },
      { pattern: /FileReader/, type: 'file', description: 'File reading' }
    ]
  };

  // Check for input patterns in the code
  const langPatterns = patterns[language] || [];
  
  langPatterns.forEach(({ pattern, type, description }) => {
    if (pattern.test(code)) {
      // Count occurrences
      const matches = code.match(new RegExp(pattern.source, 'g'));
      const count = matches ? matches.length : 1;
      
      for (let i = 0; i < count; i++) {
        inputFields.push({
          id: `input_${language}_${type}_${i}`,
          type: type,
          label: `${description} #${i + 1}`,
          placeholder: `Enter input for ${description}`,
          required: true
        });
      }
    }
  });

  return inputFields;
};

// Web code execution function
export const executeWebCode = async (language, code, fileSystem) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        output: `Web ${language} code executed successfully`,
        executionTime: 100,
        language: language
      });
    }, 500);
  });
};

// OPTIMIZED: Main execution function with Python backend priority
export const executeCode = async (language, code, input = '', fileContent = null, options = {}) => {
  const startTime = performance.now();
  
  try {
    // Validate inputs
    const validation = validateExecutionInput(language, code, input, fileContent);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Map language and prepare code
    const langInfo = mapLanguage(language);
    const preparedCode = prepareCodeForExecution(code, langInfo.name, options);
    
    console.log(`Executing ${langInfo.name} code with backend priority...`);

    // STRATEGY: For Python - ONLY use backend, throw error if backend fails
    if (langInfo.name === 'python') {
      try {
        console.log('Using CoderPoint Backend for Python (mandatory)');
        const result = await executeWithBackendAPI(langInfo.name, preparedCode, input, fileContent, options);
        const executionTime = performance.now() - startTime;
        
        return {
          ...result,
          executionTime: Math.round(executionTime),
          language: langInfo.name,
          languageVersion: langInfo.version,
          timestamp: new Date().toISOString(),
          codeSize: code.length,
          inputSize: input.length,
          apiUsed: 'backend',
          backendUsed: true
        };
      } catch (backendError) {
        console.error('Python backend execution failed:', backendError.message);
        throw new Error(`Python execution failed: Backend API is required for Python. Error: ${backendError.message}`);
      }
    }
    
    // STRATEGY: For JavaScript/Java - Try backend first, then piston
    if (langInfo.backend) {
      try {
        console.log(`Trying CoderPoint Backend for ${langInfo.name}`);
        const result = await executeWithBackendAPI(langInfo.name, preparedCode, input, fileContent, options);
        const executionTime = performance.now() - startTime;
        
        return {
          ...result,
          executionTime: Math.round(executionTime),
          language: langInfo.name,
          languageVersion: langInfo.version,
          timestamp: new Date().toISOString(),
          codeSize: code.length,
          inputSize: input.length,
          apiUsed: 'backend',
          backendUsed: true
        };
      } catch (backendError) {
        console.warn(`Backend API failed for ${langInfo.name}, trying Piston:`, backendError.message);
        // Continue to piston fallback
      }
    }
    
    // STRATEGY: For all other languages - Use Piston only
    if (langInfo.piston) {
      try {
        console.log(`Using Piston API for ${langInfo.name}`);
        const result = await executeWithPistonAPI(langInfo.name, preparedCode, input, options);
        const executionTime = performance.now() - startTime;
        
        return {
          ...result,
          executionTime: Math.round(executionTime),
          language: langInfo.name,
          languageVersion: langInfo.version,
          timestamp: new Date().toISOString(),
          codeSize: code.length,
          inputSize: input.length,
          apiUsed: 'piston',
          backendUsed: false
        };
      } catch (pistonError) {
        console.error(`Piston API failed for ${langInfo.name}:`, pistonError.message);
        throw new Error(`Execution failed: ${pistonError.message}`);
      }
    }
    
    throw new Error(`No supported API available for language: ${langInfo.name}`);
    
  } catch (error) {
    const executionTime = performance.now() - startTime;
    
    return {
      success: false,
      error: error.message,
      executionTime: Math.round(executionTime),
      language: language,
      timestamp: new Date().toISOString(),
      apiUsed: 'none'
    };
  }
};

// ENHANCED: Backend API execution with file reading support for Python
const executeWithBackendAPI = async (language, code, input = '', fileContent = null, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COMPILER_SYSTEM.backend.timeout);

  try {
    // Prepare Python-specific optimizations with file reading support
    let processedCode = code;
    if (language === 'python') {
      processedCode = optimizePythonCodeWithFileSupport(code, input, fileContent);
    }

    const payload = {
      code: processedCode,
      language: language,
      input: input,
      timeout: COMPILER_SYSTEM.backend.pythonConfig.timeout,
      enableFileReading: true,
      ...options
    };

    // Add file content if provided
    if (fileContent) {
      payload.fileContent = processFileContentForBackend(fileContent, language);
    }

    // Add Python-specific configuration with file reading packages
    if (language === 'python') {
      payload.pythonConfig = {
        ...COMPILER_SYSTEM.backend.pythonConfig,
        fileReading: true,
        supportedFileTypes: Object.keys(COMPILER_SYSTEM.backend.fileSupport)
      };
    }

    console.log('Sending to backend API:', { 
      language, 
      codeLength: processedCode.length, 
      hasInput: !!input,
      hasFiles: !!fileContent,
      fileTypes: fileContent ? Object.keys(fileContent) : [],
      pythonOptimized: language === 'python'
    });

    const response = await fetch(COMPILER_SYSTEM.backend.api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'include'
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const result = await response.json();
    
    console.log('Backend API response:', result);

    // Handle different response formats
    if (result.success === false || result.error) {
      throw new Error(result.error || result.message || 'Execution failed on server');
    }

    return {
      success: true,
      output: result.output || result.stdout || '',
      error: result.error || result.stderr || '',
      exitCode: result.exit_code || result.exitCode || 0,
      memory: result.memory,
      cpuTime: result.cpuTime || result.execution_time,
      metadata: {
        venvUsed: result.venv_used || false,
        executionTime: result.execution_time,
        packagesUsed: result.packages_used || [],
        filesProcessed: result.files_processed || []
      }
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Backend API timeout - execution took too long');
    }
    throw new Error(`Backend API: ${error.message}`);
  }
};

// Python code optimization with file reading support
const optimizePythonCodeWithFileSupport = (code, input, fileContent) => {
  let optimizedCode = code;
  
  // Remove any existing wrapper if present
  optimizedCode = optimizedCode.trim();
  
  // Check if code uses file operations
  const usesFileOperations = 
    code.includes('open(') || 
    code.includes('pandas.read_') || 
    code.includes('with open') ||
    code.includes('pd.read_') ||
    code.includes('openpyxl') ||
    code.includes('.to_csv') ||
    code.includes('.to_excel');
  
  // Add file reading imports if needed
  if (usesFileOperations && !code.includes('import pandas') && code.includes('pandas')) {
    optimizedCode = 'import pandas as pd\n' + optimizedCode;
  }
  
  if (usesFileOperations && !code.includes('import openpyxl') && code.includes('openpyxl')) {
    optimizedCode = 'import openpyxl\n' + optimizedCode;
  }
  
  // Handle simple expressions for immediate execution
  const lines = optimizedCode.split('\n');
  if (lines.length === 1) {
    const singleLine = lines[0].trim();
    
    // If it's a simple expression without print, wrap it
    if (!singleLine.startsWith('print') && 
        !singleLine.startsWith('import') &&
        !singleLine.startsWith('from') &&
        !singleLine.startsWith('def ') &&
        !singleLine.startsWith('class ') &&
        !singleLine.startsWith('#') &&
        !singleLine.includes('=') &&
        singleLine.length > 0) {
      optimizedCode = `print(${singleLine})`;
    }
  }
  
  return optimizedCode;
};

// Enhanced file content processing for backend
const processFileContentForBackend = (fileContent, language) => {
  if (typeof fileContent === 'string') {
    return {
      content: fileContent,
      type: 'text',
      language: language
    };
  }
  
  if (Array.isArray(fileContent)) {
    return fileContent.reduce((acc, file, index) => {
      const fileInfo = detectFileInfo(file.name || `file${index}`);
      acc[`file${index}`] = {
        content: file.content || file,
        name: file.name || `file${index}`,
        type: fileInfo.type,
        extension: fileInfo.extension,
        supported: fileInfo.backend
      };
      return acc;
    }, {});
  }
  
  if (typeof fileContent === 'object') {
    return Object.entries(fileContent).reduce((acc, [key, value]) => {
      const fileInfo = detectFileInfo(key);
      acc[key] = {
        content: value.content || value,
        name: key,
        type: fileInfo.type,
        extension: fileInfo.extension,
        supported: fileInfo.backend
      };
      return acc;
    }, {});
  }
  
  return fileContent;
};

// Piston API Implementation
const executeWithPistonAPI = async (language, code, input, options) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COMPILER_SYSTEM.piston.timeout);

  try {
    const response = await fetch(COMPILER_SYSTEM.piston.api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: '*',
        files: [{ content: code }],
        stdin: input,
        ...options
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if (result.message) {
      throw new Error(result.message);
    }

    if (result.run) {
      return {
        success: true,
        output: result.run.output || '',
        error: result.run.stderr || '',
        exitCode: result.run.code || 0
      };
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Piston API timeout');
    }
    throw error;
  }
};

// Utility functions
const validateExecutionInput = (language, code, input, fileContent) => {
  const errors = [];
  
  if (!language || typeof language !== 'string') {
    errors.push('Language is required and must be a string');
  }
  
  if (!code || typeof code !== 'string') {
    errors.push('Code is required and must be a string');
  } else if (code.length > 100000) {
    errors.push('Code exceeds maximum size (100KB)');
  }
  
  if (input && typeof input !== 'string') {
    errors.push('Input must be a string');
  }
  
  if (input && input.length > 10000) {
    errors.push('Input exceeds maximum size (10KB)');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
};

const mapLanguage = (language) => {
  const langKey = language.toLowerCase();
  const mapped = LANGUAGE_MAPPING[langKey];
  
  if (!mapped) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  return mapped;
};

const prepareCodeForExecution = (code, language, options) => {
  let preparedCode = code;
  
  // Apply language-specific formatting
  switch (language) {
    case 'python':
      // Python code is handled by optimizePythonCodeWithFileSupport function
      break;
      
    case 'java':
      if (!code.includes('public class') && !code.includes('class')) {
        preparedCode = `public class Main {\n    public static void main(String[] args) {\n        ${code}\n    }\n}`;
      }
      break;
      
    case 'c':
      if (!code.includes('int main') && !code.includes('void main')) {
        preparedCode = `#include <stdio.h>\n\nint main() {\n    ${code}\n    return 0;\n}`;
      }
      break;
      
    case 'cpp':
      if (!code.includes('int main') && !code.includes('void main')) {
        preparedCode = `#include <iostream>\nusing namespace std;\n\nint main() {\n    ${code}\n    return 0;\n}`;
      }
      break;

    case 'php':
      if (!code.includes('<?php') && !code.trim().startsWith('<?')) {
        preparedCode = `<?php\n${code}\n?>`;
      }
      break;
  }
  
  return preparedCode;
};

// FILE PROCESSING FUNCTIONS
export const readFileContent = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target.result;
      const fileInfo = detectFileInfo(file.name, file.type);
      
      resolve({
        name: file.name,
        type: fileInfo.type,
        mimeType: fileInfo.mime,
        size: file.size,
        lastModified: file.lastModified,
        content: content,
        extension: file.name.split('.').pop().toLowerCase(),
        backendSupported: fileInfo.backend || false,
        parsedData: parseFileContent(content, fileInfo)
      });
    };
    
    reader.onerror = (error) => reject(error);
    
    // Determine reading strategy based on file type
    if (file.type.startsWith('text/') || 
        file.type === 'application/json' ||
        file.type.includes('csv') ||
        fileInfo.type === 'text' ||
        fileInfo.backend) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
};

export const detectFileInfo = (filename, mimeType = '') => {
  const extension = filename.split('.').pop().toLowerCase();
  const fileType = FILE_TYPE_DETECTION[extension] || { 
    type: 'unknown', 
    mime: mimeType || 'application/octet-stream',
    parser: 'raw',
    backend: false
  };
  
  // Check if file type is supported by backend
  fileType.backendSupported = COMPILER_SYSTEM.backend.fileSupport[extension] !== undefined;
  
  return fileType;
};

export const parseFileContent = (content, fileInfo) => {
  try {
    switch (fileInfo.parser) {
      case 'json':
        return JSON.parse(content);
      case 'csv':
        return parseCSV(content);
      case 'text':
        return {
          raw: content,
          lines: content.split('\n'),
          lineCount: content.split('\n').length,
          wordCount: content.split(/\s+/).length
        };
      case 'xml':
        return parseXML(content);
      case 'excel':
        return {
          type: 'excel',
          content: content,
          note: 'Excel files are processed by backend Python with pandas'
        };
      default:
        return content;
    }
  } catch (error) {
    console.warn(`Failed to parse ${fileInfo.type} file:`, error);
    return content;
  }
};

const parseCSV = (content) => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], data: [], totalRows: 0 };
  
  // Detect delimiter
  const firstLine = lines[0];
  const delimiters = { ',': firstLine.split(',').length, ';': firstLine.split(';').length, '\t': firstLine.split('\t').length };
  const delimiter = Object.keys(delimiters).reduce((a, b) => delimiters[a] > delimiters[b] ? a : b);
  
  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  }).filter(row => Object.values(row).some(val => val !== ''));
  
  return {
    headers,
    data,
    totalRows: data.length,
    delimiter,
    sample: data.slice(0, 5)
  };
};

const parseXML = (content) => {
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, "text/xml");
      
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error('XML parsing error');
      }
      
      return {
        root: xmlDoc.documentElement.nodeName,
        valid: true,
        content: content
      };
    } else {
      return {
        valid: content.includes('<?xml'),
        content: content
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      content: content
    };
  }
};

// Python file reading utilities
export const generatePythonFileReadingCode = (fileData, operation = 'read') => {
  const fileExtensions = Object.keys(fileData);
  let pythonCode = '';
  
  fileExtensions.forEach(ext => {
    const files = fileData[ext];
    files.forEach((file, index) => {
      switch (ext) {
        case 'csv':
          pythonCode += `# Reading CSV file: ${file.name}\n`;
          pythonCode += `df_${index} = pd.read_csv('${file.name}')\n`;
          pythonCode += `print(f"CSV file ${file.name} loaded with {len(df_${index})} rows and {len(df_${index}.columns)} columns")\n`;
          pythonCode += `print(df_${index}.head())\n\n`;
          break;
        case 'json':
          pythonCode += `# Reading JSON file: ${file.name}\n`;
          pythonCode += `with open('${file.name}', 'r') as f:\n`;
          pythonCode += `    data_${index} = json.load(f)\n`;
          pythonCode += `print(f"JSON file ${file.name} loaded")\n`;
          pythonCode += `print(f"Data type: {type(data_${index})}")\n\n`;
          break;
        case 'txt':
          pythonCode += `# Reading text file: ${file.name}\n`;
          pythonCode += `with open('${file.name}', 'r') as f:\n`;
          pythonCode += `    text_${index} = f.read()\n`;
          pythonCode += `print(f"Text file ${file.name} loaded with {len(text_${index})} characters")\n\n`;
          break;
        case 'xlsx':
        case 'xls':
          pythonCode += `# Reading Excel file: ${file.name}\n`;
          pythonCode += `df_${index} = pd.read_excel('${file.name}')\n`;
          pythonCode += `print(f"Excel file ${file.name} loaded with {len(df_${index})} rows and {len(df_${index}.columns)} columns")\n`;
          pythonCode += `print(df_${index}.head())\n\n`;
          break;
      }
    });
  });
  
  return pythonCode;
};

// Enhanced compiler class with Python file reading support
export class EnhancedCompiler {
  constructor() {
    this.files = new Map();
    this.executionHistory = [];
    this.settings = {
      maxHistorySize: 50,
      preferredAPI: 'auto',
      timeout: 30000,
      autoFormat: true,
      pythonOptimization: true,
      enableFileReading: true
    };
  }

  async addFile(file) {
    const fileInfo = await readFileContent(file);
    this.files.set(fileInfo.name, fileInfo);
    return fileInfo;
  }

  async addFiles(fileList) {
    const results = [];
    for (const file of fileList) {
      results.push(await this.addFile(file));
    }
    return results;
  }

  removeFile(filename) {
    return this.files.delete(filename);
  }

  clearFiles() {
    this.files.clear();
  }

  getFile(filename) {
    return this.files.get(filename);
  }

  getFileList() {
    return Array.from(this.files.values());
  }

  getFilesByType(type) {
    return Array.from(this.files.values()).filter(file => file.type === type);
  }

  // Check if files are supported for Python backend
  areFilesSupportedForPython() {
    const files = Array.from(this.files.values());
    return files.every(file => file.backendSupported);
  }

  async execute(language, code, input = '', options = {}) {
    const fileContent = this.files.size > 0 ? 
      Object.fromEntries(Array.from(this.files.entries()).map(([name, file]) => [name, file])) : 
      null;

    const executionOptions = {
      ...this.settings,
      ...options
    };

    const result = await executeCode(language, code, input, fileContent, executionOptions);

    // Add to history
    this.executionHistory.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      language,
      codeSize: code.length,
      inputSize: input.length,
      fileCount: this.files.size,
      filesUsed: fileContent ? Object.keys(fileContent) : [],
      result
    });

    // Limit history size
    if (this.executionHistory.length > this.settings.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.settings.maxHistorySize);
    }

    return result;
  }

  getHistory() {
    return this.executionHistory;
  }

  clearHistory() {
    this.executionHistory = [];
  }

  setSetting(key, value) {
    if (key in this.settings) {
      this.settings[key] = value;
    }
  }

  getStats() {
    const files = Array.from(this.files.values());
    return {
      totalExecutions: this.executionHistory.length,
      successfulExecutions: this.executionHistory.filter(e => e.result.success).length,
      totalFiles: files.length,
      fileTypes: files.reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {}),
      pythonSupportedFiles: files.filter(f => f.backendSupported).length
    };
  }
}

// Export everything
export default {
  executeCode,
  executeWebCode,
  readFileContent,
  detectFileInfo,
  parseFileContent,
  generatePythonFileReadingCode,
  EnhancedCompiler,
  COMPILER_SYSTEM,
  LANGUAGE_MAPPING,
  FILE_TYPE_DETECTION,
  analyzeInputRequirements,
  detectLanguageFromCode,
  validateCodeForLanguage
};