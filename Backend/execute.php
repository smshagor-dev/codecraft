<?php
header('Content-Type: application/json');

// Handle CORS properly for your domains
$allowed_origins = [
    'https://coderpoint.ru',
    'http://coderpoint.ru',
    'https://cloud.coderpoint.ru',
    'http://cloud.coderpoint.ru',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://coderpoint.ru');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$VENV_PATH = '/home/smshagor/cloud.coderpoint.ru/python_packages';
$VENV_PYTHON = $VENV_PATH . '/bin/python3';
$VENV_PIP = $VENV_PATH . '/bin/pip3';
$VENV_SITE_PACKAGES = $VENV_PATH . '/lib/python3.6/site-packages';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $code = $input['code'] ?? '';
    $language = $input['language'] ?? '';
    $command = $input['command'] ?? '';
    $input_data = $input['input'] ?? '';
    
    if (!empty($command)) {
        $result = executeTerminalCommand($command);
    } elseif (!empty($code) && !empty($language)) {
        $result = executeCode($code, $language, $input_data);
    } else {
        $result = ['success' => false, 'error' => 'No code/command provided'];
    }
    
    echo json_encode($result);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['debug_python'])) {
        $testCode = <<<'PYTHON'
import sys
print("Python version:", sys.version)
print("Python path:", sys.executable)
print("Hello from Python!")

# Test basic operations
x = 5 + 3
print(f"5 + 3 = {x}")

# Test imports
try:
    import math
    print(f"Math module: OK, pi = {math.pi}")
except ImportError as e:
    print(f"Math import failed: {e}")

print("Python test completed successfully!")
PYTHON;

        $result = executePythonDirect($testCode);
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }
    
    if (isset($_GET['debug_filesystem'])) {
        $tempDir = '/tmp/code_exec_' . uniqid();
        
        $result = [
            'temp_dir' => $tempDir,
            'dir_created' => mkdir($tempDir, 0755, true),
            'dir_exists' => is_dir($tempDir),
            'dir_writable' => is_writable($tempDir),
            'temp_dir_permissions' => substr(sprintf('%o', fileperms('/tmp')), -4),
            'current_uid' => posix_getuid(),
            'current_user' => posix_getpwuid(posix_getuid())['name'] ?? 'unknown'
        ];
        
        if ($result['dir_created']) {
            $testFile = $tempDir . '/test.py';
            $testContent = 'print("Hello World")';
            $result['file_written'] = file_put_contents($testFile, $testContent);
            $result['file_exists'] = file_exists($testFile);
            $result['file_content'] = file_get_contents($testFile);
            
            // Clean up
            unlink($testFile);
            rmdir($tempDir);
        }
        
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }
    
    if (isset($_GET['test_simple_python'])) {
        // Simple Python test without file creation
        $testCode = 'print("Hello from Python!")';
        $result = executePythonDirect($testCode);
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }
    
    if (isset($_GET['test_python_versions'])) {
        $result = [];
        
        // Test system Python
        $systemOutput = shell_exec('python3 --version 2>&1');
        $result['system_python'] = $systemOutput ? trim($systemOutput) : 'Not found';
        
        // Test virtual environment Python
        if (file_exists($VENV_PYTHON)) {
            $venvOutput = shell_exec(escapeshellarg($VENV_PYTHON) . ' --version 2>&1');
            $result['venv_python'] = $venvOutput ? trim($venvOutput) : 'Not working';
        } else {
            $result['venv_python'] = 'Virtual environment not found';
        }
        
        // Test Python execution
        $testCode = 'print("Hello from Python Execution Test")';
        $execResult = executePythonDirect($testCode);
        $result['execution_test'] = $execResult;
        
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }
    
    if (isset($_GET['test_pandas'])) {
        $testCode = <<<'PYTHON'
try:
    import pandas as pd
    print("SUCCESS: Pandas imported successfully")
    print(f"Pandas version: {pd.__version__}")
    
    # Test basic pandas functionality
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
    print("DataFrame created successfully:")
    print(df)
    
except ImportError as e:
    print(f"FAILED: {e}")
except Exception as e:
    print(f"ERROR: {e}")
PYTHON;

        $result = executePythonDirect($testCode);
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }
    
    $venvStatus = file_exists($VENV_PYTHON) ? 'Found' : 'Not Found';
    
    echo json_encode([
        'status' => 'active', 
        'message' => 'Code Execution API is running',
        'virtual_env' => $venvStatus,
        'python_path' => $VENV_PYTHON
    ]);
    exit;
}

// Direct Python execution without file creation - USES VIRTUAL ENVIRONMENT
function executePythonDirect($code) {
    global $VENV_PYTHON, $VENV_SITE_PACKAGES;
    
    // Escape the code properly for command line
    $escapedCode = escapeshellarg($code);
    
    // Use virtual environment Python if available, otherwise system Python
    if (file_exists($VENV_PYTHON)) {
        // Use virtual environment Python with proper environment setup
        $command = escapeshellarg($VENV_PYTHON) . ' -c ' . $escapedCode . ' 2>&1';
        $venvUsed = true;
    } else {
        // Fallback to system Python
        $command = "python3 -c {$escapedCode} 2>&1";
        $venvUsed = false;
    }
    
    $output = shell_exec($command);
    
    if ($output === null) {
        return [
            'success' => false, 
            'error' => 'Python execution failed completely',
            'venv_used' => $venvUsed
        ];
    }
    
    $output = trim($output);
    
    if (empty($output)) {
        return [
            'success' => true, 
            'output' => 'Program executed successfully (no output)',
            'venv_used' => $venvUsed
        ];
    }
    
    // Check for Python errors
    $pythonErrors = [
        'SyntaxError:', 'NameError:', 'ImportError:', 'ModuleNotFoundError:',
        'IndentationError:', 'TypeError:', 'ValueError:', 'AttributeError:',
        'FileNotFoundError:', 'PermissionError:'
    ];
    
    foreach ($pythonErrors as $error) {
        if (strpos($output, $error) !== false) {
            return [
                'success' => false, 
                'error' => $output,
                'venv_used' => $venvUsed
            ];
        }
    }
    
    return [
        'success' => true, 
        'output' => $output,
        'venv_used' => $venvUsed
    ];
}

function executeTerminalCommand($command) {
    global $VENV_PYTHON, $VENV_PIP, $VENV_SITE_PACKAGES;
    
    if (containsDangerousCommand($command)) {
        return ['success' => false, 'error' => 'Dangerous command blocked'];
    }
    
    $tempDir = '/tmp/terminal_' . uniqid();
    if (!mkdir($tempDir, 0755, true) && !is_dir($tempDir)) {
        return ['success' => false, 'error' => 'Failed to create temporary directory'];
    }
    
    try {
        $trimmedCommand = trim($command);
        
        if ($trimmedCommand === 'clear' || $trimmedCommand === 'cls') {
            return ['success' => true, 'output' => 'CLEAR_TERMINAL'];
        }
        
        if ($trimmedCommand === 'pwd') {
            return ['success' => true, 'output' => $tempDir];
        }
        
        if (strpos($trimmedCommand, 'cd ') === 0) {
            return handleChangeDirectory($trimmedCommand, $tempDir);
        }
        
        $installResult = handlePackageInstallation($trimmedCommand, $tempDir);
        if ($installResult !== null) {
            return $installResult;
        }
        
        $envResult = handleEnvironmentChecks($trimmedCommand, $tempDir);
        if ($envResult !== null) {
            return $envResult;
        }
        
        $fullCommand = 'cd ' . escapeshellarg($tempDir);
        
        if (file_exists($VENV_PYTHON)) {
            $fullCommand .= ' && export PATH=' . escapeshellarg(dirname($VENV_PYTHON)) . ':$PATH';
            $fullCommand .= ' && export PYTHONPATH=' . escapeshellarg($VENV_SITE_PACKAGES) . ':$PYTHONPATH';
            $fullCommand .= ' && export VIRTUAL_ENV=' . escapeshellarg(dirname($VENV_PYTHON));
        }
        
        $fullCommand .= ' && timeout 30 ' . $command . ' 2>&1';
        
        $output = shell_exec($fullCommand);
        
        if (strpos($output, 'timeout: sending signal TERM') !== false) {
            return ['success' => false, 'error' => 'Command timed out'];
        }
        
        return [
            'success' => true, 
            'output' => $output ? trim($output) : 'Command executed successfully',
            'directory' => $tempDir,
            'venv_used' => file_exists($VENV_PYTHON)
        ];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Execution error: ' . $e->getMessage()];
    } finally {
        // Clean up in background
        shell_exec("sleep 2 && rm -rf " . escapeshellarg($tempDir) . " > /dev/null 2>&1 &");
    }
}

function executePython($code, $input = '') {
    global $VENV_PYTHON, $VENV_SITE_PACKAGES;
    
    // If there's input, create a complete Python program that handles input
    if (!empty($input)) {
        $completeCode = <<<PYTHON
import sys
import io

# Set up input simulation
if sys.version_info[0] >= 3:
    from io import StringIO
else:
    from StringIO import StringIO

# Save original stdin
original_stdin = sys.stdin

try:
    # Create string buffer with input data
    input_buffer = StringIO('''$input''')
    sys.stdin = input_buffer
    
    # Execute the user code
    $code
finally:
    # Restore original stdin
    sys.stdin = original_stdin
PYTHON;
    } else {
        $completeCode = $code;
    }
    
    return executePythonDirect($completeCode);
}

function executeJavaScript($code, $input = '') {
    // Use direct Node.js execution
    $escapedCode = escapeshellarg($code);
    $command = "node -e {$escapedCode} 2>&1";
    $output = shell_exec($command);
    
    if ($output === null) {
        return ['success' => false, 'error' => 'Node.js not installed or execution failed'];
    }
    
    $output = trim($output);
    
    if (empty($output)) {
        return ['success' => true, 'output' => 'Program executed successfully (no output)'];
    }
    
    // Check for JavaScript errors
    if (strpos($output, 'Error:') !== false || strpos($output, 'SyntaxError:') !== false) {
        return ['success' => false, 'error' => $output];
    }
    
    return ['success' => true, 'output' => $output, 'language' => 'javascript'];
}

function executeJava($code, $input = '') {
    $tempDir = '/tmp/java_exec_' . uniqid();
    if (!mkdir($tempDir, 0755, true)) {
        return ['success' => false, 'error' => 'Failed to create temporary directory'];
    }
    
    try {
        if (preg_match('/public\s+class\s+(\w+)/', $code, $matches)) {
            $className = $matches[1];
        } else {
            // Wrap in a Main class if no class found
            $className = 'Main';
            $code = "public class Main {\n    public static void main(String[] args) {\n        " . $code . "\n    }\n}";
        }
        
        $file = $tempDir . '/' . $className . '.java';
        file_put_contents($file, $code);
        
        $compile = shell_exec('cd ' . escapeshellarg($tempDir) . ' && javac ' . escapeshellarg($file) . ' 2>&1');
        
        if (!empty($compile)) {
            return ['success' => false, 'error' => "Compilation error:\n" . $compile];
        }
        
        $output = shell_exec('cd ' . escapeshellarg($tempDir) . ' && java ' . escapeshellarg($className) . ' 2>&1');
        
        if ($output === null) {
            return ['success' => false, 'error' => 'Java execution failed'];
        }
        
        return ['success' => true, 'output' => trim($output), 'language' => 'java'];
        
    } finally {
        shell_exec("rm -rf " . escapeshellarg($tempDir) . " > /dev/null 2>&1 &");
    }
}

function executePHP($code, $input = '') {
    $escapedCode = escapeshellarg("<?php\n" . $code . "\n?>");
    $command = "php -r {$escapedCode} 2>&1";
    $output = shell_exec($command);
    
    return ['success' => true, 'output' => trim($output), 'language' => 'php'];
}

function executeC($code, $input = '') {
    $tempDir = '/tmp/c_exec_' . uniqid();
    if (!mkdir($tempDir, 0755, true)) {
        return ['success' => false, 'error' => 'Failed to create temporary directory'];
    }
    
    try {
        $file = $tempDir . '/program.c';
        $executable = $tempDir . '/program';
        file_put_contents($file, $code);
        
        $compile = shell_exec('cd ' . escapeshellarg($tempDir) . ' && gcc ' . escapeshellarg($file) . ' -o ' . escapeshellarg($executable) . ' 2>&1');
        
        if (!empty($compile) && !file_exists($executable)) {
            return ['success' => false, 'error' => "Compilation error:\n" . $compile];
        }
        
        $output = shell_exec('cd ' . escapeshellarg($tempDir) . ' && ./program 2>&1');
        return ['success' => true, 'output' => trim($output), 'language' => 'c'];
        
    } finally {
        shell_exec("rm -rf " . escapeshellarg($tempDir) . " > /dev/null 2>&1 &");
    }
}

function executeCpp($code, $input = '') {
    $tempDir = '/tmp/cpp_exec_' . uniqid();
    if (!mkdir($tempDir, 0755, true)) {
        return ['success' => false, 'error' => 'Failed to create temporary directory'];
    }
    
    try {
        $file = $tempDir . '/program.cpp';
        $executable = $tempDir . '/program';
        file_put_contents($file, $code);
        
        $compile = shell_exec('cd ' . escapeshellarg($tempDir) . ' && g++ ' . escapeshellarg($file) . ' -o ' . escapeshellarg($executable) . ' 2>&1');
        
        if (!empty($compile) && !file_exists($executable)) {
            return ['success' => false, 'error' => "Compilation error:\n" . $compile];
        }
        
        $output = shell_exec('cd ' . escapeshellarg($tempDir) . ' && ./program 2>&1');
        return ['success' => true, 'output' => trim($output), 'language' => 'cpp'];
        
    } finally {
        shell_exec("rm -rf " . escapeshellarg($tempDir) . " > /dev/null 2>&1 &");
    }
}

function executeRuby($code, $input = '') {
    $escapedCode = escapeshellarg($code);
    $command = "ruby -e {$escapedCode} 2>&1";
    $output = shell_exec($command);
    
    return ['success' => true, 'output' => trim($output), 'language' => 'ruby'];
}

function executeGo($code, $input = '') {
    $tempDir = '/tmp/go_exec_' . uniqid();
    if (!mkdir($tempDir, 0755, true)) {
        return ['success' => false, 'error' => 'Failed to create temporary directory'];
    }
    
    try {
        $file = $tempDir . '/main.go';
        file_put_contents($file, $code);
        
        $compile = shell_exec('cd ' . escapeshellarg($tempDir) . ' && go build -o program ' . escapeshellarg($file) . ' 2>&1');
        
        if (!empty($compile)) {
            return ['success' => false, 'error' => "Compilation error:\n" . $compile];
        }
        
        $output = shell_exec('cd ' . escapeshellarg($tempDir) . ' && ./program 2>&1');
        return ['success' => true, 'output' => trim($output), 'language' => 'go'];
        
    } finally {
        shell_exec("rm -rf " . escapeshellarg($tempDir) . " > /dev/null 2>&1 &");
    }
}

function executeRust($code, $input = '') {
    $tempDir = '/tmp/rust_exec_' . uniqid();
    if (!mkdir($tempDir, 0755, true)) {
        return ['success' => false, 'error' => 'Failed to create temporary directory'];
    }
    
    try {
        $file = $tempDir . '/main.rs';
        $executable = $tempDir . '/program';
        file_put_contents($file, $code);
        
        $compile = shell_exec('cd ' . escapeshellarg($tempDir) . ' && rustc ' . escapeshellarg($file) . ' -o ' . escapeshellarg($executable) . ' 2>&1');
        
        if (!empty($compile)) {
            return ['success' => false, 'error' => "Compilation error:\n" . $compile];
        }
        
        $output = shell_exec('cd ' . escapeshellarg($tempDir) . ' && ./program 2>&1');
        return ['success' => true, 'output' => trim($output), 'language' => 'rust'];
        
    } finally {
        shell_exec("rm -rf " . escapeshellarg($tempDir) . " > /dev/null 2>&1 &");
    }
}

function executeShell($code, $input = '') {
    $escapedCode = escapeshellarg($code);
    $command = "bash -c {$escapedCode} 2>&1";
    $output = shell_exec($command);
    
    return ['success' => true, 'output' => trim($output), 'language' => 'shell'];
}

function executeHTML($code, $input = '') {
    return ['success' => true, 'output' => 'HTML Code - View in browser', 'language' => 'html'];
}

function executeCSS($code, $input = '') {
    return ['success' => true, 'output' => 'CSS Code - Apply to HTML', 'language' => 'css'];
}

function executeJSON($code, $input = '') {
    $json = json_decode($code);
    if (json_last_error() === JSON_ERROR_NONE) {
        return ['success' => true, 'output' => 'Valid JSON', 'language' => 'json'];
    } else {
        return ['success' => false, 'error' => 'Invalid JSON: ' . json_last_error_msg(), 'language' => 'json'];
    }
}

function executeSQL($code, $input = '') {
    return ['success' => true, 'output' => 'SQL Code - Execute on database', 'language' => 'sql'];
}

function executeCode($code, $language, $input = '') {
    try {
        switch ($language) {
            case 'py':
            case 'python':
                return executePython($code, $input);
            case 'js':
            case 'javascript':
                return executeJavaScript($code, $input);
            case 'php':
                return executePHP($code, $input);
            case 'java':
                return executeJava($code, $input);
            case 'cpp':
                return executeCpp($code, $input);
            case 'c':
                return executeC($code, $input);
            case 'rb':
            case 'ruby':
                return executeRuby($code, $input);
            case 'go':
                return executeGo($code, $input);
            case 'rs':
            case 'rust':
                return executeRust($code, $input);
            case 'sh':
            case 'shell':
                return executeShell($code, $input);
            case 'html':
                return executeHTML($code, $input);
            case 'css':
                return executeCSS($code, $input);
            case 'json':
                return executeJSON($code, $input);
            case 'sql':
                return executeSQL($code, $input);
            default:
                return ['success' => false, 'error' => 'Language not supported: ' . $language];
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Execution error: ' . $e->getMessage()];
    }
}

// Include all the helper functions (handlePackageInstallation, handleEnvironmentChecks, etc.)
// They remain the same as in the previous version

function handlePackageInstallation($command, $tempDir) {
    global $VENV_PIP, $VENV_PYTHON;
    
    $lowerCommand = strtolower(trim($command));
    
    if (strpos($lowerCommand, 'pip install') === 0) {
        $packagePart = trim(substr($command, 11));
        $packageName = explode(' ', $packagePart)[0];
        
        if (empty($packageName)) {
            return ['success' => false, 'error' => 'Please specify package name'];
        }
        
        if (containsDangerousPackage($packageName)) {
            return ['success' => false, 'error' => 'Package blocked: ' . $packageName];
        }
        
        $pipCommands = [];
        if (file_exists($VENV_PIP)) {
            $pipCommands[] = escapeshellarg($VENV_PIP) . " install " . escapeshellarg($packageName) . " 2>&1";
        }
        if (file_exists($VENV_PYTHON)) {
            $pipCommands[] = escapeshellarg($VENV_PYTHON) . " -m pip install " . escapeshellarg($packageName) . " 2>&1";
        }
        
        $pipCommands = array_merge($pipCommands, [
            "pip3 install --user " . escapeshellarg($packageName) . " 2>&1",
            "pip install --user " . escapeshellarg($packageName) . " 2>&1",
            "python3 -m pip install --user " . escapeshellarg($packageName) . " 2>&1"
        ]);
        
        $output = '';
        $success = false;
        $usedVenv = false;
        
        foreach ($pipCommands as $pipCmd) {
            $result = shell_exec('cd ' . escapeshellarg($tempDir) . ' && ' . $pipCmd);
            if ($result !== null) {
                $output = $result;
                if (strpos($result, 'Successfully installed') !== false || 
                    strpos($result, 'Requirement already satisfied') !== false ||
                    strpos($result, 'Collecting ') !== false) {
                    $success = true;
                }
                if (strpos($pipCmd, $VENV_PIP) !== false || strpos($pipCmd, $VENV_PYTHON) !== false) {
                    $usedVenv = true;
                }
                break;
            }
        }
        
        if (empty($output)) {
            return ['success' => false, 'error' => 'Pip installation failed'];
        }
        
        return [
            'success' => $success,
            'output' => $output,
            'venv_used' => $usedVenv
        ];
    }
    
    return null;
}

function handleEnvironmentChecks($command, $tempDir) {
    global $VENV_PYTHON, $VENV_PIP, $VENV_SITE_PACKAGES;
    
    $lowerCommand = strtolower($command);
    
    if ($lowerCommand === 'python --version' || $lowerCommand === 'python3 --version') {
        if (file_exists($VENV_PYTHON)) {
            $output = shell_exec(escapeshellarg($VENV_PYTHON) . ' --version 2>&1');
            $venvUsed = true;
        } else {
            $output = shell_exec('python3 --version 2>&1') ?? shell_exec('python --version 2>&1') ?? 'Python not found';
            $venvUsed = false;
        }
        return ['success' => true, 'output' => trim($output), 'venv_used' => $venvUsed];
    }
    
    if ($lowerCommand === 'pip list' || $lowerCommand === 'pip3 list') {
        return handlePipList();
    }
    
    if ($lowerCommand === 'pip --version' || $lowerCommand === 'pip3 --version') {
        if (file_exists($VENV_PIP)) {
            $output = shell_exec(escapeshellarg($VENV_PIP) . ' --version 2>&1');
            $venvUsed = true;
        } else {
            $output = shell_exec('pip3 --version 2>&1') ?? shell_exec('pip --version 2>&1') ?? 'Pip not found';
            $venvUsed = false;
        }
        return ['success' => true, 'output' => trim($output), 'venv_used' => $venvUsed];
    }
    
    if ($lowerCommand === 'node --version' || $lowerCommand === 'node -v') {
        $output = shell_exec('node --version 2>&1') ?? 'Node.js not found';
        return ['success' => true, 'output' => trim($output)];
    }
    
    if ($lowerCommand === 'npm --version' || $lowerCommand === 'npm -v') {
        $output = shell_exec('npm --version 2>&1') ?? 'NPM not found';
        return ['success' => true, 'output' => trim($output)];
    }
    
    if ($lowerCommand === 'venv-info' || $lowerCommand === 'virtualenv-info') {
        return getVirtualEnvInfo();
    }
    
    if ($lowerCommand === 'venv-packages' || $lowerCommand === 'virtualenv-packages') {
        return getVenvPackages();
    }
    
    if ($lowerCommand === 'which python' || $lowerCommand === 'which python3') {
        $venvPython = file_exists($VENV_PYTHON) ? $VENV_PYTHON : 'Virtual Python not found';
        $systemPython = shell_exec('which python3 2>&1') ?? shell_exec('which python 2>&1') ?? 'System Python not found';
        $output = "Virtual Environment Python: " . $venvPython . "\n";
        $output .= "System Python: " . trim($systemPython);
        return ['success' => true, 'output' => $output];
    }
    
    if ($lowerCommand === 'which pip' || $lowerCommand === 'which pip3') {
        $venvPip = file_exists($VENV_PIP) ? $VENV_PIP : 'Virtual Pip not found';
        $systemPip = shell_exec('which pip3 2>&1') ?? shell_exec('which pip 2>&1') ?? 'System Pip not found';
        $output = "Virtual Environment Pip: " . $venvPip . "\n";
        $output .= "System Pip: " . trim($systemPip);
        return ['success' => true, 'output' => $output];
    }
    
    if (strpos($lowerCommand, 'check ') === 0) {
        $package = trim(substr($command, 6));
        if ($package) {
            return checkPackage($package);
        }
    }
    
    if (strpos($lowerCommand, 'test ') === 0) {
        $package = trim(substr($command, 5));
        if ($package) {
            return testPackageImport($package);
        }
    }
    
    if ($lowerCommand === 'dev-env' || $lowerCommand === 'environment' || $lowerCommand === 'env-check') {
        return getDevelopmentEnvironmentSummary();
    }
    
    if ($lowerCommand === 'install-basic-packages') {
        return installBasicPackages($tempDir);
    }
    
    if ($lowerCommand === 'activate-venv' || $lowerCommand === 'use-venv') {
        return activateVirtualEnvironment();
    }
    
    if ($lowerCommand === 'help' || $lowerCommand === 'commands') {
        return getAvailableCommands();
    }
    
    return null;
}

function handlePipList() {
    global $VENV_PIP, $VENV_PYTHON;
    
    if (file_exists($VENV_PIP)) {
        $output = shell_exec(escapeshellarg($VENV_PIP) . ' list 2>&1');
        if ($output && !str_contains($output, 'command not found')) {
            return ['success' => true, 'output' => $output, 'venv_used' => true];
        }
    }
    
    if (file_exists($VENV_PYTHON)) {
        $output = shell_exec(escapeshellarg($VENV_PYTHON) . ' -m pip list 2>&1');
        if ($output && !str_contains($output, 'command not found')) {
            return ['success' => true, 'output' => $output, 'venv_used' => true];
        }
    }
    
    $pipCommands = [
        'pip3 list --user 2>&1',
        'pip list --user 2>&1',
        'python3 -m pip list --user 2>&1',
        'python -m pip list --user 2>&1',
        'pip3 list 2>&1',
        'pip list 2>&1'
    ];
    
    $output = '';
    foreach ($pipCommands as $pipCmd) {
        $result = shell_exec($pipCmd);
        if ($result && !str_contains($result, 'command not found') && !str_contains($result, 'No module named pip')) {
            $output = $result;
            break;
        }
    }
    
    if (empty($output)) {
        $output = "No pip packages found.\n";
        $output .= "Virtual Environment: " . (file_exists($VENV_PIP) ? 'Available' : 'Not available');
    }
    
    return ['success' => true, 'output' => $output, 'venv_used' => false];
}

function getVirtualEnvInfo() {
    global $VENV_PATH, $VENV_PYTHON, $VENV_PIP, $VENV_SITE_PACKAGES;
    
    $venvExists = file_exists($VENV_PYTHON);
    
    $output = "VIRTUAL ENVIRONMENT STATUS\n\n";
    $output .= "Path: " . $VENV_PATH . "\n";
    $output .= "Status: " . ($venvExists ? "ACTIVE" : "NOT FOUND") . "\n\n";
    
    if ($venvExists) {
        $pythonVersion = shell_exec(escapeshellarg($VENV_PYTHON) . ' --version 2>&1');
        $output .= "Python: " . trim($pythonVersion) . "\n";
        $output .= "Pip: " . (file_exists($VENV_PIP) ? "Found" : "Not found") . "\n";
        $output .= "Site Packages: " . $VENV_SITE_PACKAGES . "\n";
        
        if (file_exists($VENV_SITE_PACKAGES)) {
            $packages = scandir($VENV_SITE_PACKAGES);
            $packageCount = count(array_filter($packages, function($item) {
                global $VENV_SITE_PACKAGES;
                return $item !== '.' && $item !== '..' && is_dir($VENV_SITE_PACKAGES . '/' . $item);
            }));
            $output .= "Installed Packages: " . $packageCount . "\n";
        }
        
        $output .= "\nPACKAGE IMPORT TEST:\n";
        $testPackages = ['numpy', 'pandas', 'matplotlib', 'requests'];
        foreach ($testPackages as $pkg) {
            $testResult = testPackageImportSilent($pkg);
            $status = $testResult ? 'OK' : 'FAIL';
            $output .= "  " . $status . " " . $pkg . "\n";
        }
    } else {
        $output .= "To create virtual environment:\n";
        $output .= "  python3 -m venv python_packages\n";
        $output .= "  source python_packages/bin/activate\n";
    }
    
    return ['success' => true, 'output' => $output];
}

function getVenvPackages() {
    global $VENV_SITE_PACKAGES;
    
    if (!file_exists($VENV_SITE_PACKAGES)) {
        return ['success' => false, 'output' => 'Virtual environment not found'];
    }
    
    $packages = scandir($VENV_SITE_PACKAGES);
    $packageList = array_filter($packages, function($item) {
        global $VENV_SITE_PACKAGES;
        return $item !== '.' && $item !== '..' && 
               $item !== '__pycache__' && 
               is_dir($VENV_SITE_PACKAGES . '/' . $item);
    });
    
    $output = "VIRTUAL ENVIRONMENT PACKAGES\n\n";
    $output .= "Total: " . count($packageList) . " packages\n\n";
    
    foreach ($packageList as $package) {
        $output .= "* " . $package . "\n";
    }
    
    if (count($packageList) === 0) {
        $output .= "No packages found.\n";
    }
    
    return ['success' => true, 'output' => $output];
}

function checkPackage($packageName) {
    $pythonCode = "try:\n    import " . $packageName . "\n    version = getattr(" . $packageName . ", '__version__', 'unknown')\n    print('OK " . $packageName . "')\n    print('Version: ' + str(version))\n    try:\n        print('Location: ' + str(" . $packageName . ".__file__))\n    except:\n        pass\nexcept ImportError as e:\n    print('FAIL " . $packageName . "')\n    print('Error: ' + str(e))";
    
    return executePythonDirect($pythonCode);
}

function testPackageImportSilent($packageName) {
    $pythonCode = "try:\n    import " . $packageName . "\n    print('OK')\nexcept:\n    pass";
    
    $result = executePythonDirect($pythonCode);
    return $result['success'] && trim($result['output']) === 'OK';
}

function testPackageImport($packageName) {
    $pythonCode = "try:\n    import " . $packageName . "\n    version = getattr(" . $packageName . ", '__version__', 'unknown')\n    print('IMPORT SUCCESS: " . $packageName . "')\n    print('Version: ' + str(version))\n    try:\n        print('File: ' + str(" . $packageName . ".__file__))\n    except:\n        pass\nexcept Exception as e:\n    print('IMPORT FAILED: " . $packageName . "')\n    print('Error: ' + str(e))";
    
    return executePythonDirect($pythonCode);
}

function activateVirtualEnvironment() {
    global $VENV_PYTHON, $VENV_PIP, $VENV_SITE_PACKAGES;
    
    if (!file_exists($VENV_PYTHON)) {
        return ['success' => false, 'output' => 'Virtual environment not found'];
    }
    
    $output = "VIRTUAL ENVIRONMENT ACTIVATED\n\n";
    $output .= "Python: " . $VENV_PYTHON . "\n";
    $output .= "Pip: " . (file_exists($VENV_PIP) ? $VENV_PIP : 'Not found') . "\n";
    $output .= "All Python commands will use virtual environment.\n";
    
    return ['success' => true, 'output' => $output];
}

function installBasicPackages($tempDir) {
    global $VENV_PIP, $VENV_PYTHON;
    
    $packages = [
        'numpy==1.19.5',
        'pandas==1.1.5', 
        'matplotlib==3.3.4',
        'requests==2.28.2'
    ];
    
    $results = [];
    $successCount = 0;
    $usedVenv = false;
    
    foreach ($packages as $package) {
        if (file_exists($VENV_PIP)) {
            $command = escapeshellarg($VENV_PIP) . " install " . escapeshellarg($package) . " 2>&1";
            $usedVenv = true;
        } else {
            $command = "pip3 install --user " . escapeshellarg($package) . " 2>&1";
        }
        
        $output = shell_exec('cd ' . escapeshellarg($tempDir) . ' && ' . $command);
        
        $success = strpos($output, 'Successfully installed') !== false || 
                   strpos($output, 'Requirement already satisfied') !== false;
        
        if ($success) $successCount++;
        
        $results[] = [
            'package' => $package,
            'success' => $success
        ];
    }
    
    $summary = "BASIC PACKAGES INSTALLATION\n\n";
    $summary .= "Using: " . ($usedVenv ? "Virtual Environment" : "System Pip") . "\n";
    $summary .= "Installed: {$successCount}/" . count($packages) . " packages\n\n";
    
    foreach ($results as $result) {
        $status = $result['success'] ? 'OK' : 'FAIL';
        $summary .= $status . " " . $result['package'] . "\n";
    }
    
    return [
        'success' => $successCount > 0,
        'output' => $summary,
        'venv_used' => $usedVenv
    ];
}

function getDevelopmentEnvironmentSummary() {
    global $VENV_PYTHON, $VENV_PIP;
    
    $summary = "DEVELOPMENT ENVIRONMENT\n\n";
    
    $venvExists = file_exists($VENV_PYTHON);
    $summary .= "VIRTUAL ENVIRONMENT:\n";
    $summary .= "  Status: " . ($venvExists ? "ACTIVE" : "NOT FOUND") . "\n";
    if ($venvExists) {
        $pythonVersion = shell_exec(escapeshellarg($VENV_PYTHON) . ' --version 2>&1');
        $summary .= "  Python: " . trim($pythonVersion) . "\n";
        $summary .= "  Pip: " . (file_exists($VENV_PIP) ? "Available" : "Not found") . "\n";
    }
    
    $summary .= "\nSYSTEM PYTHON:\n";
    $systemPython = shell_exec('python3 --version 2>&1') ?? 'Not found';
    $summary .= "  Version: " . trim($systemPython) . "\n";
    $systemPip = shell_exec('pip3 --version 2>&1') ? 'Available' : 'Not found';
    $summary .= "  Pip: " . $systemPip . "\n";
    
    $summary .= "\nNODE.JS:\n";
    $nodeVersion = shell_exec('node --version 2>&1') ?? 'Not found';
    $summary .= "  Version: " . trim($nodeVersion) . "\n";
    
    $summary .= "\nCOMMANDS:\n";
    $summary .= "  venv-info              - Virtual environment status\n";
    $summary .= "  pip install <package>  - Install package\n";
    $summary .= "  check <package>        - Check package\n";
    
    return ['success' => true, 'output' => $summary];
}

function getAvailableCommands() {
    $output = "AVAILABLE COMMANDS\n\n";
    
    $output .= "PYTHON:\n";
    $output .= "  python --version       - Check Python\n";
    $output .= "  pip list               - List packages\n";
    $output .= "  pip install <pkg>      - Install package\n";
    $output .= "  venv-info              - Virtual environment\n";
    $output .= "  venv-packages          - Show packages\n";
    $output .= "  check <package>        - Check package\n";
    $output .= "  install-basic-packages - Install packages\n\n";
    
    $output .= "SYSTEM:\n";
    $output .= "  node --version         - Node.js version\n";
    $output .= "  which python           - Python path\n";
    $output .= "  dev-env                - Environment summary\n";
    $output .= "  pwd                    - Current directory\n";
    $output .= "  clear                  - Clear terminal\n";
    
    return ['success' => true, 'output' => $output];
}

function handleChangeDirectory($command, $tempDir) {
    $path = trim(substr($command, 2));
    
    if (empty($path) || $path === '~') {
        return ['success' => true, 'output' => 'Changed to home'];
    }
    
    if ($path === '..') {
        return ['success' => true, 'output' => 'Moved to parent'];
    }
    
    return ['success' => true, 'output' => 'Changed to: ' . $path];
}

function containsDangerousPackage($package) {
    $dangerousPackages = [
        'os', 'sys', 'shutil', 'subprocess', 'ctypes',
        'socket', 'requests-toolbelt', 'pyinstaller'
    ];
    
    $lowerPackage = strtolower($package);
    
    foreach ($dangerousPackages as $dangerous) {
        if (strpos($lowerPackage, $dangerous) !== false) {
            return true;
        }
    }
    
    return false;
}

function containsDangerousCommand($command, $username = null) {
    $dangerousPatterns = [
        'rm -rf', 'rm -fr', 'rm -f', 'rm -r',
        'dd if=', 'mkfs', 'fdisk',
        '> /dev/sd', 'cat >', 'tee >',
        'wget', 'curl', 'bash -c', 'sh -c',
        'sudo', 'su ', 'chmod 777', 'chown',
        'passwd', 'useradd', 'adduser',
        'ssh-keygen', 'ssh-copy-id',
        'nc ', 'netcat', 'telnet',
        'python -c', 'perl -e', 'ruby -e',
        'echo', 'printf',
        'mv ', 'cp ', 'ln ',
        'find /', 'grep -r',
        'kill', 'pkill', 'killall',
        'crontab', 'at ', 'nohup',
        'tar ', 'gzip', 'bzip2',
        'mount', 'umount',
        'iptables', 'ufw',
        'service', 'systemctl',
        'docker', 'kubectl',
        'git clone', 'git pull',
        'apt-get', 'yum', 'dnf', 'pacman',
        'pip download', 'pip uninstall',
        'unzip', 'zip'
    ];
    
    // Allow user-specific file operations
    if ($username && preg_match('/^(mkdir|rm|cp|mv|ls|cat)\s+/', $command)) {
        // These commands are allowed for authenticated users
        return false;
    }
    
    $lowerCommand = strtolower($command);
    
    foreach ($dangerousPatterns as $pattern) {
        if (strpos($lowerCommand, strtolower($pattern)) !== false) {
            return true;
        }
    }
    
    if (preg_match('/[;&|`\n]/', $command)) {
        return true;
    }
    
    return false;
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
?>