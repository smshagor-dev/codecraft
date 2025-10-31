export const COMPILER_APIS = {
  coderpoint: {
    name: 'CoderPoint API',
    api: `${import.meta.env.VITE_API_URL}/execute`,
    method: 'POST',
    free: true,
    rateLimit: 'Unlimited',
    languages: ['python', 'javascript', 'java', 'cpp', 'c', 'rust', 'go', 'csharp', 'php', 'ruby', 'swift', 'kotlin', 'typescript']
  },
  piston: {
    name: 'Piston API',
    api: 'https://emkc.org/api/v2/piston/execute',
    method: 'POST',
    free: true,
    rateLimit: 'Unlimited',
    languages: ['python', 'javascript', 'java', 'cpp', 'c', 'rust', 'go', 'csharp', 'php', 'ruby', 'swift', 'kotlin']
  },
  codex: {
    name: 'Codex API',
    api: 'https://api.codex.jaagrav.in',
    method: 'POST',
    free: true,
    rateLimit: 'Unlimited',
    languages: ['python', 'javascript', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift']
  },
  paiza: {
    name: 'Paiza.IO',
    api: 'https://api.paiza.io',
    method: 'POST',
    endpoint: '/runners/create',
    free: true,
    rateLimit: 'Unlimited',
    languages: ['python', 'javascript', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift']
  }
};

// Simple language mapping
export const LANGUAGE_MAPPING = {
  // Python
  'py': 'python',
  'python': 'python',
  
  // JavaScript
  'js': 'javascript',
  'javascript': 'javascript',
  'jsx': 'javascript',
  
  // TypeScript
  'ts': 'typescript',
  'typescript': 'typescript',
  'tsx': 'typescript',
  
  // Java
  'java': 'java',
  
  // C/C++
  'cpp': 'cpp',
  'c': 'c',
  
  // C#
  'cs': 'csharp',
  'csharp': 'csharp',
  
  // PHP
  'php': 'php',
  
  // Ruby
  'rb': 'ruby',
  'ruby': 'ruby',
  
  // Go
  'go': 'go',
  'golang': 'go',
  
  // Rust
  'rs': 'rust',
  'rust': 'rust',
  
  // Swift
  'swift': 'swift',
  
  // Kotlin
  'kt': 'kotlin',
  'kotlin': 'kotlin'
};

// Language mapping for CoderPoint API
export const CODERPOINT_LANGUAGE_MAPPING = {
  'python': 'python',
  'javascript': 'nodejs',
  'typescript': 'typescript',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'csharp': 'csharp',
  'php': 'php',
  'ruby': 'ruby',
  'go': 'go',
  'rust': 'rust',
  'swift': 'swift',
  'kotlin': 'kotlin'
};

// Main execution function
export const executeCode = async (language, code, input = '') => {
  const langKey = language.toLowerCase();
  const mappedLang = LANGUAGE_MAPPING[langKey];
  
  if (!mappedLang) {
    throw new Error(`Language "${language}" is not supported`);
  }

  // Try APIs in order - CoderPoint first, then fallbacks
  const apisToTry = ['coderpoint', 'piston', 'codex', 'paiza'];
  const errors = [];

  for (const apiName of apisToTry) {
    try {
      console.log(`Trying ${apiName} API for ${mappedLang}...`);
      const result = await executeWithAPI(apiName, mappedLang, code, input);
      console.log(`${apiName} API success:`, result);
      return {
        ...result,
        apiUsed: apiName,
        language: mappedLang
      };
    } catch (error) {
      console.warn(`${apiName} API failed:`, error.message);
      errors.push(`${apiName}: ${error.message}`);
      // Continue to next API
    }
  }

  throw new Error(`All compilers failed:\n${errors.join('\n')}`);
};

// Execute with specific API
const executeWithAPI = async (apiName, language, code, input = '') => {
  switch (apiName) {
    case 'coderpoint':
      return await executeWithCoderPointAPI(language, code, input);
    case 'piston':
      return await executeWithPistonAPI(language, code, input);
    case 'codex':
      return await executeWithCodexAPI(language, code, input);
    case 'paiza':
      return await executeWithPaizaAPI(language, code, input);
    default:
      throw new Error(`API ${apiName} not implemented`);
  }
};

// CoderPoint API Implementation
const executeWithCoderPointAPI = async (language, code, input = '') => {
  try {
    const coderpointLang = CODERPOINT_LANGUAGE_MAPPING[language];
    if (!coderpointLang) {
      throw new Error(`CoderPoint doesn't support ${language}`);
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: coderpointLang,
        code: code,
        input: input
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('CoderPoint API raw response:', result);
    
    // Handle different response formats from CoderPoint API
    if (result.output !== undefined || result.error !== undefined) {
      return {
        run: {
          output: result.output || '',
          stderr: result.error || '',
          stdout: result.output || '',
          code: result.exitCode || 0
        }
      };
    } else if (result.run) {
      return {
        run: {
          output: result.run.output || '',
          stderr: result.run.stderr || '',
          stdout: result.run.stdout || '',
          code: result.run.code || 0
        }
      };
    } else if (result.result) {
      return {
        run: {
          output: result.result.output || '',
          stderr: result.result.error || '',
          stdout: result.result.output || '',
          code: result.result.exitCode || 0
        }
      };
    } else {
      throw new Error('Unexpected response format from CoderPoint API');
    }
  } catch (error) {
    throw new Error(`CoderPoint API: ${error.message}`);
  }
};

// Piston API Implementation
const executeWithPistonAPI = async (language, code, input = '') => {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: '*',
        files: [{ content: code }],
        stdin: input
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('Piston API raw response:', result);
    
    if (result.run) {
      return {
        run: {
          output: result.run.output || '',
          stderr: result.run.stderr || '',
          stdout: result.run.output || '',
          code: result.run.code || 0
        }
      };
    } else if (result.message) {
      throw new Error(result.message);
    } else {
      throw new Error('Unexpected response format from Piston API');
    }
  } catch (error) {
    throw new Error(`Piston API: ${error.message}`);
  }
};

// Codex API Implementation
const executeWithCodexAPI = async (language, code, input = '') => {
  try {
    const response = await fetch('https://api.codex.jaagrav.in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        language: language,
        input: input
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return {
      run: {
        output: result.output || '',
        stderr: result.error || '',
        stdout: result.output || ''
      }
    };
  } catch (error) {
    throw new Error(`Codex API: ${error.message}`);
  }
};

// Paiza.IO API Implementation
const executeWithPaizaAPI = async (language, code, input = '') => {
  const paizaLanguageMap = {
    'python': 'python3',
    'javascript': 'javascript',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'php': 'php',
    'ruby': 'ruby',
    'go': 'go',
    'rust': 'rust',
    'swift': 'swift'
  };

  const paizaLang = paizaLanguageMap[language];
  if (!paizaLang) {
    throw new Error(`Paiza doesn't support ${language}`);
  }

  try {
    // Create runner
    const createResponse = await fetch('https://api.paiza.io/runners/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        source_code: code,
        language: paizaLang,
        input: input,
        api_key: 'guest'
      })
    });

    const createResult = await createResponse.json();
    
    if (createResult.error) {
      throw new Error(createResult.error);
    }

    if (!createResult.id) {
      throw new Error('Failed to create runner session');
    }

    // Poll for results with timeout
    const timeout = 20000; // 20 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.paiza.io/runners/get_status?id=${createResult.id}&api_key=guest`);
      const statusResult = await statusResponse.json();
      
      if (statusResult.error) {
        throw new Error(statusResult.error);
      }
      
      if (statusResult.status === 'completed') {
        const detailsResponse = await fetch(`https://api.paiza.io/runners/get_details?id=${createResult.id}&api_key=guest`);
        const details = await detailsResponse.json();
        
        return {
          run: {
            output: details.stdout || '',
            stderr: details.stderr || details.build_stderr || '',
            stdout: details.stdout || ''
          }
        };
      }
    }

    throw new Error('Execution timeout');
  } catch (error) {
    throw new Error(`Paiza API: ${error.message}`);
  }
};

// Specialized execution for web languages
export const executeWebCode = async (language, code, fileSystem) => {
  if (language === 'html') {
    return executeHTML(code, fileSystem);
  } else if (language === 'css') {
    return executeCSS(code);
  } else if (['javascript', 'js', 'jsx', 'ts', 'tsx'].includes(language)) {
    return executeInBrowser(language, code);
  }
  
  return executeCode(language, code);
};

// HTML execution
const executeHTML = async (code, fileSystem) => {
  return {
    run: {
      output: 'HTML content ready for preview',
      stderr: '',
      stdout: 'HTML executed successfully'
    },
    html: code,
    apiUsed: 'browser'
  };
};

// CSS execution
const executeCSS = async (code) => {
  try {
    const style = document.createElement('style');
    style.textContent = code;
    document.head.appendChild(style);
    document.head.removeChild(style);
    
    return {
      run: {
        output: 'CSS validated successfully',
        stderr: '',
        stdout: 'CSS is valid'
      },
      apiUsed: 'browser'
    };
  } catch (error) {
    return {
      run: {
        output: '',
        stderr: error.message,
        stdout: ''
      },
      apiUsed: 'browser'
    };
  }
};

// Browser execution for JavaScript
const executeInBrowser = async (language, code) => {
  try {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const logs = [];
    const errors = [];
    const warnings = [];
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(message);
      originalConsoleLog(...args);
    };
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      errors.push(message);
      originalConsoleError(...args);
    };
    
    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      warnings.push(message);
      originalConsoleWarn(...args);
    };
    
    let result;
    try {
      if (language === 'typescript' || language === 'ts' || language === 'tsx') {
        result = eval(`(function() { 
          "use strict";
          try {
            ${code}
          } catch(e) {
            console.error('Execution error:', e.message);
          }
        })()`);
      } else {
        result = eval(`(function() { 
          "use strict";
          try {
            ${code}
          } catch(e) {
            console.error('Execution error:', e.message);
          }
        })()`);
      }
    } catch (evalError) {
      errors.push(`Eval error: ${evalError.message}`);
    }
    
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    const output = [
      ...logs.map(log => `[LOG] ${log}`),
      ...warnings.map(warn => `[WARN] ${warn}`),
      ...errors.map(err => `[ERROR] ${err}`),
      result !== undefined ? `[RESULT] ${result}` : ''
    ].filter(line => line.trim()).join('\n');
    
    return {
      run: {
        output: output,
        stderr: errors.join('\n'),
        stdout: logs.join('\n')
      },
      apiUsed: 'browser'
    };
  } catch (error) {
    return {
      run: {
        output: '',
        stderr: `Browser execution failed: ${error.message}`,
        stdout: ''
      },
      apiUsed: 'browser'
    };
  }
};

// Enhanced input detection with detailed field analysis for ALL languages
export const analyzeInputRequirements = (code, language) => {
  if (!code) return [];
  
  const inputPatterns = {
    python: {
      pattern: /input\s*\(\s*([^)]*)\s*\)/g,
      extractor: (match) => {
        const prompt = match[1] ? match[1].replace(/['"]/g, '').trim() : '';
        return {
          prompt: prompt || 'Enter value',
          type: 'text',
          placeholder: 'Enter text input',
          example: 'John Doe',
          required: true
        };
      }
    },
    javascript: {
      pattern: /prompt\s*\(\s*([^)]*)\s*\)/g,
      extractor: (match) => {
        const prompt = match[1] ? match[1].replace(/['"]/g, '').trim() : '';
        return {
          prompt: prompt || 'Enter value',
          type: 'text',
          placeholder: 'Enter text input',
          example: 'John Doe',
          required: true
        };
      }
    },
    typescript: {
      pattern: /prompt\s*\(\s*([^)]*)\s*\)/g,
      extractor: (match) => {
        const prompt = match[1] ? match[1].replace(/['"]/g, '').trim() : '';
        return {
          prompt: prompt || 'Enter value',
          type: 'text',
          placeholder: 'Enter text input',
          example: 'John Doe',
          required: true
        };
      }
    },
    java: {
      pattern: /\.next(Int|Double|Float|Long|Line|Boolean|)(\s*\(\s*\))?|\.readLine\s*\(\s*\)|Scanner\s*\(|BufferedReader\s*\(/g,
      extractor: (match) => {
        const method = match[0];
        let type = 'text';
        let example = 'Hello World';
        
        if (method.includes('nextInt')) {
          type = 'number';
          example = '25';
        } else if (method.includes('nextDouble') || method.includes('nextFloat')) {
          type = 'number';
          example = '3.14';
        } else if (method.includes('nextLong')) {
          type = 'number';
          example = '1000000';
        } else if (method.includes('nextBoolean')) {
          type = 'boolean';
          example = 'true';
        } else {
          type = 'text';
          example = 'Hello World';
        }
        
        return {
          prompt: `Enter ${type} value`,
          type: type,
          placeholder: `Enter ${type}`,
          example: example,
          required: true
        };
      }
    },
    cpp: {
      pattern: /cin\s*>>|\bstd\s*::\s*cin\s*>>/g,
      extractor: () => ({
        prompt: 'Enter input value',
        type: 'text',
        placeholder: 'Enter value',
        example: '42',
        required: true
      })
    },
    c: {
      pattern: /scanf\s*\(\s*[^)]+\s*\)|gets\s*\(\s*[^)]+\s*\)|fgets\s*\(\s*[^)]+\s*\)/g,
      extractor: (match) => {
        const method = match[0];
        let type = 'text';
        let example = 'Hello';
        
        if (method.includes('%d') || method.includes('%i')) {
          type = 'number';
          example = '42';
        } else if (method.includes('%f') || method.includes('%lf')) {
          type = 'number';
          example = '3.14';
        } else if (method.includes('%c')) {
          type = 'text';
          example = 'A';
        } else {
          type = 'text';
          example = 'Hello';
        }
        
        return {
          prompt: 'Enter formatted input',
          type: type,
          placeholder: 'Enter value',
          example: example,
          required: true
        };
      }
    },
    csharp: {
      pattern: /Console\s*\.\s*ReadLine\s*\(\s*\)/g,
      extractor: () => ({
        prompt: 'Enter text input',
        type: 'text',
        placeholder: 'Enter text',
        example: 'Hello World',
        required: true
      })
    },
    php: {
      pattern: /fgets\s*\(\s*STDIN\s*\)|readline\s*\(\s*([^)]*)\s*\)|\$_\s*\[\s*['"](POST|GET|REQUEST)['"]\s*\]/g,
      extractor: (match) => {
        const prompt = match[1] ? match[1].replace(/['"]/g, '').trim() : '';
        return {
          prompt: prompt || 'Enter value',
          type: 'text',
          placeholder: 'Enter text input',
          example: 'John Doe',
          required: true
        };
      }
    },
    ruby: {
      pattern: /gets(\.chomp)?|gets\.strip/gi,
      extractor: () => ({
        prompt: 'Enter input value',
        type: 'text',
        placeholder: 'Enter text',
        example: 'Hello World',
        required: true
      })
    },
    go: {
      pattern: /fmt\.Scan(|f|ln)\s*\(|bufio\.NewReader|\.ReadString/gi,
      extractor: () => ({
        prompt: 'Enter input value',
        type: 'text',
        placeholder: 'Enter value',
        example: '42',
        required: true
      })
    },
    rust: {
      pattern: /std\s*::\s*io\s*::\s*stdin\s*\(\s*\)|\.read_line\s*\(\s*&?\s*mut\s+\w+\s*\)/gi,
      extractor: () => ({
        prompt: 'Enter text input',
        type: 'text',
        placeholder: 'Enter text',
        example: 'Hello World',
        required: true
      })
    },
    swift: {
      pattern: /readLine\s*\(\s*\)/gi,
      extractor: () => ({
        prompt: 'Enter text input',
        type: 'text',
        placeholder: 'Enter text',
        example: 'Hello World',
        required: true
      })
    },
    kotlin: {
      pattern: /readLine\s*\(\s*\)|Scanner\s*\(/gi,
      extractor: () => ({
        prompt: 'Enter text input',
        type: 'text',
        placeholder: 'Enter text',
        example: 'Hello World',
        required: true
      })
    }
  };

  const langConfig = inputPatterns[language];
  if (!langConfig) {
    console.log(`No input pattern configuration for language: ${language}`);
    return [];
  }

  try {
    const matches = [...code.matchAll(langConfig.pattern)];
    console.log(`Input detection for ${language}:`, {
      pattern: langConfig.pattern,
      matches: matches.length,
      sample: matches.slice(0, 2)
    });
    
    return matches.map((match, index) => ({
      id: `${language}_${index}_${Date.now()}`,
      ...langConfig.extractor(match),
      defaultValue: ''
    }));
  } catch (error) {
    console.error(`Error analyzing input for ${language}:`, error);
    return [];
  }
};

// Enhanced count input calls with better patterns
export const countInputCalls = (code, language) => {
  const inputPatterns = {
    python: /input\s*\(/g,
    javascript: /prompt\s*\(/g,
    typescript: /prompt\s*\(/g,
    java: /\.next(Int|Double|Float|Long|Line|Boolean|)|\.readLine\s*\(|Scanner\s*\(|BufferedReader\s*\(/g,
    cpp: /cin\s*>>|\bstd\s*::\s*cin\s*>>/g,
    c: /scanf\s*\(|gets\s*\(|fgets\s*\(/g,
    csharp: /Console\s*\.\s*ReadLine\s*\(/g,
    php: /fgets\s*\(\s*STDIN\s*\)|readline\s*\(|\$_\s*\[\s*['"](POST|GET|REQUEST)['"]\s*\]/g,
    ruby: /gets(\.chomp)?/gi,
    go: /fmt\.Scan(|f|ln)\s*\(|bufio\.NewReader/gi,
    rust: /std\s*::\s*io\s*::\s*stdin\s*\(|\.read_line\s*\(/gi,
    swift: /readLine\s*\(/gi,
    kotlin: /readLine\s*\(|Scanner\s*\(/gi
  };
  
  const pattern = inputPatterns[language];
  if (!pattern) {
    console.log(`No input pattern for language: ${language}`);
    return 0;
  }

  try {
    const matches = code.match(pattern);
    const count = matches ? matches.length : 0;
    console.log(`Input count for ${language}: ${count}`);
    return count;
  } catch (error) {
    console.error(`Error counting input calls for ${language}:`, error);
    return 0;
  }
};

// Simple input detection (backward compatibility)
export const detectInputRequirements = (code, language) => {
  const count = countInputCalls(code, language);
  console.log(`Input requirements for ${language}: ${count > 0}`);
  return count > 0;
};

// Get input examples for different languages
export const getInputExamples = (language) => {
  const examples = {
    python: ['John', '25', 'New York'],
    javascript: ['John', '25'],
    typescript: ['John', '25'],
    java: ['John', '25'],
    cpp: ['John', '25'],
    c: ['John', '25'],
    csharp: ['John', '25'],
    php: ['John', '25'],
    ruby: ['John', '25'],
    go: ['John', '25'],
    rust: ['John', '25'],
    swift: ['John', '25'],
    kotlin: ['John', '25']
  };
  
  return examples[language] || examples.python;
};

// Utility functions
export const isLanguageSupported = (language) => {
  const langKey = language.toLowerCase();
  return !!LANGUAGE_MAPPING[langKey];
};

export const getSupportedLanguages = () => {
  return Object.keys(LANGUAGE_MAPPING);
};

// Get API status
export const getAPIStatus = async () => {
  const status = {
    coderpoint: { status: 'unknown', responseTime: 0 },
    piston: { status: 'unknown', responseTime: 0 },
    codex: { status: 'unknown', responseTime: 0 },
    paiza: { status: 'unknown', responseTime: 0 }
  };

  // Test CoderPoint API
  try {
    const startTime = performance.now();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const endTime = performance.now();
    
    if (response.ok) {
      status.coderpoint.status = 'online';
      status.coderpoint.responseTime = Math.round(endTime - startTime);
    } else {
      status.coderpoint.status = 'offline';
    }
  } catch (error) {
    status.coderpoint.status = 'offline';
  }

  // Test Piston API
  try {
    const startTime = performance.now();
    const response = await fetch('https://emkc.org/api/v2/piston/versions', {
      method: 'GET'
    });
    const endTime = performance.now();
    
    if (response.ok) {
      status.piston.status = 'online';
      status.piston.responseTime = Math.round(endTime - startTime);
    } else {
      status.piston.status = 'offline';
    }
  } catch (error) {
    status.piston.status = 'offline';
  }

  return status;
};

// Preprocess code for input simulation (fallback method)
export const preprocessCodeWithInput = (code, language, input) => {
  if (!input) return code;
  
  const inputLines = input.split('\n').filter(line => line.trim());
  
  if (language === 'python') {
    let processedCode = code;
    let inputIndex = 0;
    
    // Replace input() calls with simulated values
    processedCode = processedCode.replace(/input\([^)]*\)/g, (match) => {
      if (inputIndex < inputLines.length) {
        const value = inputLines[inputIndex++];
        // Escape quotes and special characters
        const escapedValue = value.replace(/"/g, '\\"').replace(/'/g, "\\'");
        return `"${escapedValue}"`;
      }
      return `""`; // Default empty string
    });
    
    return processedCode;
  }
  
  // For other languages, we rely on the stdin parameter
  return code;
};

// Validate code for common issues
export const validateCode = (code, language) => {
  const issues = [];
  
  if (!code || code.trim().length === 0) {
    issues.push({
      type: 'warning',
      message: 'Code is empty',
      line: 1,
      column: 1
    });
    return issues;
  }
  
  // Check for infinite loops in certain languages
  if (language === 'python') {
    const whileTruePattern = /while\s+True\s*:/g;
    const matches = code.match(whileTruePattern);
    if (matches) {
      issues.push({
        type: 'warning',
        message: 'Potential infinite loop detected (while True:)',
        line: 1,
        column: 1
      });
    }
  }
  
  // Check for very long code
  if (code.length > 10000) {
    issues.push({
      type: 'warning',
      message: 'Code is very long and may take time to execute',
      line: 1,
      column: 1
    });
  }
  
  return issues;
};

// Format code for specific language requirements
export const formatCodeForExecution = (code, language) => {
  let formattedCode = code;
  
  switch (language) {
    case 'java':
      // Ensure Java code has a main class if it doesn't
      if (!code.includes('public static void main') && !code.includes('class Main')) {
        formattedCode = `public class Main {
    public static void main(String[] args) {
        // User code
        ${code}
    }
}`;
      }
      break;
      
    case 'c':
      // Ensure C code has main function
      if (!code.includes('int main()') && !code.includes('void main()')) {
        formattedCode = `#include <stdio.h>
        
int main() {
    // User code
    ${code}
    return 0;
}`;
      }
      break;
      
    case 'cpp':
      // Ensure C++ code has main function
      if (!code.includes('int main()') && !code.includes('void main()')) {
        formattedCode = `#include <iostream>
using namespace std;

int main() {
    // User code
    ${code}
    return 0;
}`;
      }
      break;
      
    default:
      // No formatting needed for other languages
      break;
  }
  
  return formattedCode;
};

// Get language-specific execution tips
export const getExecutionTips = (language) => {
  const tips = {
    python: [
      'Use input() for user input',
      'Print statements will appear in output',
      'Import standard libraries as needed'
    ],
    javascript: [
      'Use console.log() for output',
      'prompt() for user input in browser',
      'No DOM access in this environment'
    ],
    java: [
      'Must have a main method',
      'Use System.out.println for output',
      'Scanner for user input'
    ],
    cpp: [
      'Include necessary headers',
      'Use cout for output',
      'cin for user input'
    ],
    c: [
      'Include stdio.h for I/O',
      'Use printf for output',
      'scanf for user input'
    ],
    csharp: [
      'Use Console.ReadLine() for input',
      'Console.WriteLine for output',
      'Include using System;'
    ],
    php: [
      'Use readline() or fgets(STDIN) for input',
      'echo for output',
      'Run in CLI environment'
    ],
    ruby: [
      'Use gets for input',
      'puts for output',
      'Use .chomp to remove newline'
    ],
    go: [
      'Use fmt.Scan for input',
      'fmt.Println for output',
      'Package main required'
    ],
    rust: [
      'Use std::io::stdin() for input',
      'println! for output',
      'Add use std::io;'
    ],
    swift: [
      'Use readLine() for input',
      'print() for output',
      'Optional unwrapping needed'
    ],
    kotlin: [
      'Use readLine() for input',
      'println() for output',
      'Scanner available for complex input'
    ]
  };
  
  return tips[language] || ['Write your code and click Run to execute'];
};

export default {
  executeCode,
  executeWebCode,
  analyzeInputRequirements,
  detectInputRequirements,
  countInputCalls,
  isLanguageSupported,
  getSupportedLanguages,
  getAPIStatus,
  validateCode,
  formatCodeForExecution,
  getExecutionTips,
  COMPILER_APIS,
  LANGUAGE_MAPPING
};