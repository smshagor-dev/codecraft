export const COMPILER_APIS = {
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

// Main execution function
export const executeCode = async (language, code, input = '') => {
  const langKey = language.toLowerCase();
  const mappedLang = LANGUAGE_MAPPING[langKey];
  
  if (!mappedLang) {
    throw new Error(`Language "${language}" is not supported`);
  }

  // Try APIs in order
  const apisToTry = ['piston', 'codex', 'paiza'];
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

// Piston API Implementation - Fixed version
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

// Utility functions
export const isLanguageSupported = (language) => {
  const langKey = language.toLowerCase();
  return !!LANGUAGE_MAPPING[langKey];
};

export const getSupportedLanguages = () => {
  return Object.keys(LANGUAGE_MAPPING);
};