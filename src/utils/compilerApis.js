export const COMPILER_SYSTEM = {
  backend: {
    name: 'CoderPoint Backend',
    api: 'https://cloud.coderpoint.ru/api/execute.php',
    method: 'POST',
    priority: 1,
    languages: ['python'],
    timeout: 30000,
    features: ['file_processing', 'virtual_env', 'package_management']
  },

  codex: {
    name: 'Codex API',
    api: 'https://api.codex.jaagrav.in',
    method: 'POST',
    priority: 2,
    languages: ['python', 'javascript', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift'],
    timeout: 15000
  },
  piston: {
    name: 'Piston API',
    api: 'https://emkc.org/api/v2/piston/execute',
    method: 'POST',
    priority: 3,
    languages: ['python', 'javascript', 'java', 'cpp', 'c', 'rust', 'go', 'csharp', 'php', 'ruby', 'swift', 'kotlin'],
    timeout: 10000
  },
  paiza: {
    name: 'Paiza.IO',
    api: 'https://api.paiza.io',
    method: 'POST',
    priority: 4,
    languages: ['python', 'javascript', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift'],
    timeout: 20000
  },
  jdoodle: {
    name: 'JDoodle API',
    api: 'https://api.jdoodle.com/v1/execute',
    method: 'POST',
    priority: 5,
    languages: ['python', 'javascript', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
    timeout: 15000
  }
};

// Complete language mapping with version support
export const LANGUAGE_MAPPING = {
  // Python
  'py': {name: 'python', version: '3.x'},
  'python': {name: 'python', version: '3.x'},
  'python3': {name: 'python', version: '3.x'},
  
  // JavaScript
  'js': {name: 'javascript', version: 'node'},
  'javascript': {name: 'javascript', version: 'node'},
  'jsx': {name: 'javascript', version: 'node'},
  'node': {name: 'javascript', version: 'node'},
  'nodejs': {name: 'javascript', version: 'node'},
  
  // TypeScript
  'ts': {name: 'typescript', version: 'latest'},
  'typescript': {name: 'typescript', version: 'latest'},
  'tsx': {name: 'typescript', version: 'latest'},
  
  // Java
  'java': {name: 'java', version: '11+'},
  
  // C/C++
  'cpp': {name: 'cpp', version: 'c++17'},
  'c++': {name: 'cpp', version: 'c++17'},
  'cc': {name: 'cpp', version: 'c++17'},
  'cxx': {name: 'cpp', version: 'c++17'},
  'c': {name: 'c', version: 'c11'},
  
  // C#
  'cs': {name: 'csharp', version: 'latest'},
  'csharp': {name: 'csharp', version: 'latest'},
  'c#': {name: 'csharp', version: 'latest'},
  
  // PHP
  'php': {name: 'php', version: '7.4+'},
  
  // Ruby
  'rb': {name: 'ruby', version: 'latest'},
  'ruby': {name: 'ruby', version: 'latest'},
  
  // Go
  'go': {name: 'go', version: 'latest'},
  'golang': {name: 'go', version: 'latest'},
  
  // Rust
  'rs': {name: 'rust', version: 'latest'},
  'rust': {name: 'rust', version: 'latest'},
  
  // Swift
  'swift': {name: 'swift', version: 'latest'},
  
  // Kotlin
  'kt': {name: 'kotlin', version: 'latest'},
  'kotlin': {name: 'kotlin', version: 'latest'},
  
  // Shell
  'sh': {name: 'shell', version: 'bash'},
  'bash': {name: 'shell', version: 'bash'},
  'shell': {name: 'shell', version: 'bash'},
  'zsh': {name: 'shell', version: 'zsh'},
  
  // Web & Data
  'html': {name: 'html', version: '5'},
  'htm': {name: 'html', version: '5'},
  'css': {name: 'css', version: '3'},
  'json': {name: 'json', version: 'n/a'},
  'sql': {name: 'sql', version: 'standard'},
  'xml': {name: 'xml', version: '1.0'}
};

// File type detection with MIME types
export const FILE_TYPE_DETECTION = {
  // Data files
  'csv': {type: 'csv', mime: 'text/csv', parser: 'csv'},
  'tsv': {type: 'csv', mime: 'text/tab-separated-values', parser: 'csv'},
  
  // Excel files
  'xlsx': {type: 'excel', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', parser: 'excel'},
  'xls': {type: 'excel', mime: 'application/vnd.ms-excel', parser: 'excel'},
  'xlsm': {type: 'excel', mime: 'application/vnd.ms-excel.sheet.macroEnabled.12', parser: 'excel'},
  'xlsb': {type: 'excel', mime: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12', parser: 'excel'},
  
  // Text files
  'txt': {type: 'text', mime: 'text/plain', parser: 'text'},
  'text': {type: 'text', mime: 'text/plain', parser: 'text'},
  'log': {type: 'text', mime: 'text/plain', parser: 'text'},
  'md': {type: 'text', mime: 'text/markdown', parser: 'text'},
  'markdown': {type: 'text', mime: 'text/markdown', parser: 'text'},
  
  // Data formats
  'json': {type: 'json', mime: 'application/json', parser: 'json'},
  'xml': {type: 'xml', mime: 'application/xml', parser: 'xml'},
  'yaml': {type: 'yaml', mime: 'application/x-yaml', parser: 'yaml'},
  'yml': {type: 'yaml', mime: 'application/x-yaml', parser: 'yaml'},
  
  // Code files
  'js': {type: 'javascript', mime: 'application/javascript', parser: 'code'},
  'py': {type: 'python', mime: 'text/x-python', parser: 'code'},
  'java': {type: 'java', mime: 'text/x-java', parser: 'code'},
  'cpp': {type: 'cpp', mime: 'text/x-c++', parser: 'code'},
  'c': {type: 'c', mime: 'text/x-c', parser: 'code'},
  'php': {type: 'php', mime: 'application/x-php', parser: 'code'},
  'rb': {type: 'ruby', mime: 'application/x-ruby', parser: 'code'},
  'rs': {type: 'rust', mime: 'text/x-rust', parser: 'code'},
  'go': {type: 'go', mime: 'text/x-go', parser: 'code'},
  'html': {type: 'html', mime: 'text/html', parser: 'code'},
  'css': {type: 'css', mime: 'text/css', parser: 'code'}
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
  }
}

// Analyze input requirements from code
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
      { pattern: /argparse/, type: 'command_line', description: 'Command line arguments' }
    ],
    javascript: [
      { pattern: /prompt\s*\(/, type: 'text', description: 'Browser prompt' },
      { pattern: /readline\s*\(/, type: 'text', description: 'Node.js readline' },
      { pattern: /process\.stdin/, type: 'text', description: 'Node.js stdin' }
    ],
    java: [
      { pattern: /Scanner\s*\(/, type: 'text', description: 'Java Scanner' },
      { pattern: /System\.in/, type: 'text', description: 'System input stream' },
      { pattern: /BufferedReader/, type: 'text', description: 'Buffered reader' }
    ],
    cpp: [
      { pattern: /cin\s*>>/, type: 'text', description: 'C++ cin' },
      { pattern: /std::cin/, type: 'text', description: 'Standard cin' }
    ],
    c: [
      { pattern: /scanf\s*\(/, type: 'text', description: 'C scanf' },
      { pattern: /gets\s*\(/, type: 'text', description: 'C gets' },
      { pattern: /fgets\s*\(/, type: 'text', description: 'C fgets' }
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

  // Fallback: If no specific patterns found but code looks like it needs input
  if (inputFields.length === 0 && code.length > 100) {
    // Check for common input-related comments
    const inputComments = code.match(/(input|enter|user|stdin|read)/gi);
    if (inputComments && inputComments.length > 2) {
      inputFields.push({
        id: 'input_general_1',
        type: 'text',
        label: 'General Input',
        placeholder: 'Enter required input',
        required: false
      });
    }
  }

  return inputFields;
};

// Web code execution function
export const executeWebCode = async (language, code, fileSystem) => {
  // Simple web code execution simulation
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

// Main execution function with intelligent API selection
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
    
    // Get available APIs for this language
    const availableApis = getAvailableApis(langInfo.name);
    
    if (availableApis.length === 0) {
      throw new Error(`No APIs available for language: ${langInfo.name}`);
    }

    // Execute with fallback strategy
    const result = await executeWithFallbackStrategy(
      langInfo.name, 
      preparedCode, 
      input, 
      fileContent, 
      availableApis, 
      options
    );

    const executionTime = performance.now() - startTime;
    
    return {
      ...result,
      executionTime: Math.round(executionTime),
      language: langInfo.name,
      languageVersion: langInfo.version,
      timestamp: new Date().toISOString(),
      codeSize: code.length,
      inputSize: input.length
    };
    
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

// Intelligent API selection with fallback
const executeWithFallbackStrategy = async (language, code, input, fileContent, availableApis, options) => {
  const errors = [];
  
  for (const apiConfig of availableApis) {
    try {
      console.log(`Trying ${apiConfig.name} for ${language}...`);
      
      let result;
      if (apiConfig.name === 'CoderPoint Backend') {
        result = await executeWithBackendAPI(language, code, input, fileContent, options);
      } else {
        result = await executeWithExternalAPI(apiConfig, language, code, input, options);
      }
      
      console.log(`${apiConfig.name} execution successful`);
      return {
        ...result,
        apiUsed: apiConfig.name.toLowerCase().replace(' ', '_'),
        backendUsed: apiConfig.name === 'CoderPoint Backend'
      };
      
    } catch (error) {
      console.warn(`${apiConfig.name} failed:`, error.message);
      errors.push(`${apiConfig.name}: ${error.message}`);
      
      // Add delay between retries to avoid rate limiting
      if (availableApis.indexOf(apiConfig) < availableApis.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  throw new Error(`All execution attempts failed:\n${errors.join('\n')}`);
};

// Enhanced backend API execution
const executeWithBackendAPI = async (language, code, input = '', fileContent = null, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COMPILER_SYSTEM.backend.timeout);

  try {
    const payload = {
      code: code,
      language: language,
      input: input,
      ...options
    };

    // Add file content if provided
    if (fileContent) {
      payload.fileContent = processFileContentForAPI(fileContent);
    }

    const response = await fetch(COMPILER_SYSTEM.backend.api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success === false) {
      throw new Error(result.error || 'Execution failed on server');
    }

    return {
      success: true,
      output: result.output || '',
      error: result.error || '',
      exitCode: result.exit_code || 0,
      memory: result.memory,
      cpuTime: result.cpuTime,
      metadata: {
        venvUsed: result.venv_used || false,
        executionTime: result.execution_time
      }
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Backend API timeout');
    }
    throw new Error(`Backend API: ${error.message}`);
  }
};

// External API execution handler
const executeWithExternalAPI = async (apiConfig, language, code, input, options) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), apiConfig.timeout);

  try {
    let response;
    
    switch (apiConfig.name) {
      case 'Codex API':
        response = await executeWithCodexAPI(language, code, input, options, controller);
        break;
      case 'Piston API':
        response = await executeWithPistonAPI(language, code, input, options, controller);
        break;
      case 'Paiza.IO':
        response = await executeWithPaizaAPI(language, code, input, options, controller);
        break;
      case 'JDoodle API':
        response = await executeWithJDoodleAPI(language, code, input, options, controller);
        break;
      default:
        throw new Error(`Unsupported API: ${apiConfig.name}`);
    }

    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error(`${apiConfig.name} timeout`);
    }
    throw error;
  }
};

// Codex API Implementation
const executeWithCodexAPI = async (language, code, input, options, controller) => {
  const response = await fetch(COMPILER_SYSTEM.codex.api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: code,
      language: language,
      input: input,
      ...options
    }),
    signal: controller.signal
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }

  return {
    success: true,
    output: result.output || '',
    error: result.error || '',
    exitCode: 0
  };
};

// Piston API Implementation
const executeWithPistonAPI = async (language, code, input, options, controller) => {
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
};

// Paiza.IO API Implementation
const executeWithPaizaAPI = async (language, code, input, options, controller) => {
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
    throw new Error(`Language ${language} not supported by Paiza`);
  }

  // Create runner session
  const createResponse = await fetch(`${COMPILER_SYSTEM.paiza.api}/runners/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      source_code: code,
      language: paizaLang,
      input: input,
      api_key: 'guest',
      ...options
    }),
    signal: controller.signal
  });

  const createResult = await createResponse.json();
  
  if (createResult.error) {
    throw new Error(createResult.error);
  }

  if (!createResult.id) {
    throw new Error('Failed to create runner session');
  }

  // Poll for results
  const pollStartTime = Date.now();
  const pollTimeout = 30000;
  
  while (Date.now() - pollStartTime < pollTimeout) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (controller.signal.aborted) {
      throw new Error('Polling aborted');
    }

    const statusResponse = await fetch(
      `${COMPILER_SYSTEM.paiza.api}/runners/get_status?id=${createResult.id}&api_key=guest`,
      { signal: controller.signal }
    );
    
    const statusResult = await statusResponse.json();
    
    if (statusResult.status === 'completed') {
      const detailsResponse = await fetch(
        `${COMPILER_SYSTEM.paiza.api}/runners/get_details?id=${createResult.id}&api_key=guest`,
        { signal: controller.signal }
      );
      
      const details = await detailsResponse.json();
      
      return {
        success: true,
        output: details.stdout || '',
        error: details.stderr || details.build_stderr || '',
        exitCode: details.exit_code || 0
      };
    } else if (statusResult.status === 'error') {
      throw new Error('Execution error in Paiza');
    }
  }

  throw new Error('Paiza execution timeout');
};

// JDoodle API Implementation
const executeWithJDoodleAPI = async (language, code, input, options, controller) => {
  const jdoodleLanguageMap = {
    'python': 'python3',
    'javascript': 'nodejs',
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

  const jdoodleLang = jdoodleLanguageMap[language];
  if (!jdoodleLang) {
    throw new Error(`Language ${language} not supported by JDoodle`);
  }

  const clientId = '9143123cdb6e8b72a552c3449ca7f7e7';
  const clientSecret = 'e90b70abfc6ac26d36ad6e9c3b84ab334decc8b23b8443b270b171828801e3d3';
  
  const response = await fetch(COMPILER_SYSTEM.jdoodle.api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: clientId,
      clientSecret: clientSecret,
      script: code,
      language: jdoodleLang,
      versionIndex: '0',
      stdin: input,
      ...options
    }),
    signal: controller.signal
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }

  return {
    success: true,
    output: result.output || '',
    error: result.error || '',
    memory: result.memory,
    cpuTime: result.cpuTime
  };
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

const getAvailableApis = (language) => {
  return Object.values(COMPILER_SYSTEM)
    .filter(api => api.languages.includes(language))
    .sort((a, b) => a.priority - b.priority);
};

const prepareCodeForExecution = (code, language, options) => {
  let preparedCode = code;
  
  // Apply language-specific formatting
  switch (language) {
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
  }
  
  return preparedCode;
};

const processFileContentForAPI = (fileContent) => {
  if (typeof fileContent === 'string') {
    return fileContent;
  }
  
  if (Array.isArray(fileContent)) {
    return fileContent.reduce((acc, file, index) => {
      acc[`file${index}`] = file.content || file;
      return acc;
    }, {});
  }
  
  if (typeof fileContent === 'object') {
    return Object.entries(fileContent).reduce((acc, [key, value]) => {
      acc[key] = value.content || value;
      return acc;
    }, {});
  }
  
  return fileContent;
};

// File processing functions
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
        parsedData: parseFileContent(content, fileInfo)
      });
    };
    
    reader.onerror = (error) => reject(error);
    
    // Determine reading strategy
    if (file.type.startsWith('text/') || 
        file.type === 'application/json' ||
        file.type === 'application/csv' ||
        fileInfo.type === 'text') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
};

export const detectFileInfo = (filename, mimeType = '') => {
  const extension = filename.split('.').pop().toLowerCase();
  return FILE_TYPE_DETECTION[extension] || { 
    type: 'unknown', 
    mime: mimeType || 'application/octet-stream',
    parser: 'raw'
  };
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
  // Simple XML parsing - for complex XML use DOMParser
  try {
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
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      content: content
    };
  }
};

// Enhanced compiler class
export class EnhancedCompiler {
  constructor() {
    this.files = new Map();
    this.executionHistory = [];
    this.settings = {
      maxHistorySize: 50,
      preferredAPI: 'auto',
      timeout: 30000,
      autoFormat: true
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

  async execute(language, code, input = '', options = {}) {
    const fileContent = this.files.size > 0 ? 
      Object.fromEntries(Array.from(this.files.entries()).map(([name, file]) => [name, file])) : 
      null;

    const result = await executeCode(language, code, input, fileContent, {
      ...this.settings,
      ...options
    });

    // Add to history
    this.executionHistory.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      language,
      codeSize: code.length,
      inputSize: input.length,
      fileCount: this.files.size,
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
    return {
      totalExecutions: this.executionHistory.length,
      successfulExecutions: this.executionHistory.filter(e => e.result.success).length,
      totalFiles: this.files.size,
      fileTypes: Array.from(this.files.values()).reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// API status monitoring
export const getAPIStatus = async () => {
  const status = {};
  const testPromises = [];

  for (const [apiName, apiConfig] of Object.entries(COMPILER_SYSTEM)) {
    testPromises.push(
      testAPI(apiName, apiConfig).then(result => {
        status[apiName] = result;
      })
    );
  }

  await Promise.allSettled(testPromises);
  return status;
};

const testAPI = async (apiName, apiConfig) => {
  const startTime = performance.now();
  
  try {
    let testUrl = apiConfig.api;
    
    // Adjust test URL based on API
    if (apiName === 'piston') {
      testUrl = 'https://emkc.org/api/v2/piston/versions';
    } else if (apiName === 'paiza') {
      testUrl = `${apiConfig.api}/runners/create`;
    }
    
    const response = await fetch(testUrl, {
      method: apiName === 'piston' ? 'GET' : 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    const responseTime = performance.now() - startTime;
    
    return {
      status: response.ok ? 'online' : 'offline',
      responseTime: Math.round(responseTime),
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'offline',
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      error: error.message
    };
  }
};

// Language support utilities
export const isLanguageSupported = (language) => {
  const langKey = language.toLowerCase();
  return !!LANGUAGE_MAPPING[langKey];
};

export const getSupportedLanguages = () => {
  return Object.entries(LANGUAGE_MAPPING).reduce((acc, [key, value]) => {
    if (!acc.find(item => item.name === value.name)) {
      acc.push({ name: value.name, version: value.version, aliases: [key] });
    } else {
      const existing = acc.find(item => item.name === value.name);
      existing.aliases.push(key);
    }
    return acc;
  }, []);
};

export const getAPISupport = (language) => {
  const langInfo = mapLanguage(language);
  const support = {};
  
  Object.keys(COMPILER_SYSTEM).forEach(api => {
    support[api] = COMPILER_SYSTEM[api].languages.includes(langInfo.name);
  });
  
  return support;
};

// Batch execution
export const executeBatch = async (executions) => {
  const results = [];
  
  for (const execution of executions) {
    try {
      const result = await executeCode(
        execution.language,
        execution.code,
        execution.input,
        execution.fileContent,
        execution.options
      );
      results.push({
        ...execution,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        ...execution,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

// Export everything
export default {
  executeCode,
  executeBatch,
  readFileContent,
  detectFileInfo,
  parseFileContent,
  isLanguageSupported,
  getSupportedLanguages,
  getAPISupport,
  getAPIStatus,
  EnhancedCompiler,
  COMPILER_SYSTEM,
  LANGUAGE_MAPPING,
  FILE_TYPE_DETECTION,
  analyzeInputRequirements,
  executeWebCode
};