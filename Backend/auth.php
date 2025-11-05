<?php
header('Content-Type: application/json');

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
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'register':
            $result = registerUser($input);
            break;
        case 'login':
            $result = loginUser($input);
            break;
        case 'logout':
            $result = logoutUser($input);
            break;
        case 'verify':
            $result = verifyToken($input);
            break;
        case 'profile':
            $result = getUserProfile($input);
            break;
        case 'stats':
            $result = getUserStats($input);
            break;
        default:
            $result = ['success' => false, 'error' => 'Invalid action'];
    }
    
    echo json_encode($result);
    exit;
}

function registerUser($data) {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $email = $data['email'] ?? '';
    
    if (empty($username) || empty($password)) {
        return ['success' => false, 'error' => 'Username and password required'];
    }
    
    if (strlen($username) < 3) {
        return ['success' => false, 'error' => 'Username must be at least 3 characters'];
    }
    
    if (strlen($password) < 6) {
        return ['success' => false, 'error' => 'Password must be at least 6 characters'];
    }
    
    try {
        $db = getDBConnection();
        
        // Check if user exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            return ['success' => false, 'error' => 'Username or email already exists'];
        }
        
        // Create user directory - using relative path
        $baseDir = dirname(__DIR__) . '/cloud_storage';
        if (!file_exists($baseDir)) {
            mkdir($baseDir, 0755, true);
        }
        
        $userDir = $baseDir . '/' . $username;
        $storagePath = '/cloud_storage/' . $username; // Virtual path for database
        
        // Create user directories
        if (!file_exists($userDir)) {
            if (!mkdir($userDir, 0755, true)) {
                error_log("Failed to create user directory: " . $userDir);
                // Continue anyway - use virtual path
                $storagePath = '/virtual/' . $username;
            } else {
                // Create default subdirectories
                mkdir($userDir . '/projects', 0777, true);
                mkdir($userDir . '/documents', 0777, true);
                mkdir($userDir . '/images', 0777, true);
            }
        }
        
        // Insert user with generous storage limit
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password_hash, storage_path, storage_limit) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $storageLimit = 100 * 1024 * 1024; // 100MB default storage
        $stmt->execute([$username, $email, $passwordHash, $storagePath, $storageLimit]);
        $userId = $db->lastInsertId();
        
        // Create welcome file
        $welcomeFile = $userDir . '/welcome.txt';
        $welcomeContent = "Welcome to Cloud Storage, {$username}!\n\n";
        $welcomeContent .= "This is your personal cloud storage space.\n";
        $welcomeContent .= "You can create files and folders here.\n";
        $welcomeContent .= "Storage Limit: 100MB\n";
        $welcomeContent .= "Created: " . date('Y-m-d H:i:s') . "\n";
        
        if (file_exists($userDir)) {
            file_put_contents($welcomeFile, $welcomeContent);
        }
        
        // Generate token for immediate login
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours
        
        // Store session in database
        $stmt = $db->prepare("
            INSERT INTO user_sessions (user_id, token, expires_at, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $stmt->execute([$userId, $token, $expiresAt, $ipAddress, $userAgent]);
        
        $cookieOptions = [
            'expires' => time() + (24 * 60 * 60), 
            'path' => '/',
            'domain' => '.coderpoint.ru', 
            'secure' => true, 
            'httponly' => true, 
            'samesite' => 'Lax' 
        ];
        
        setcookie('auth_token', $token, $cookieOptions);

        $jsCookieOptions = $cookieOptions;
        $jsCookieOptions['httponly'] = false; 
        $jsCookieOptions['domain'] = 'coderpoint.ru'; 
        setcookie('user_token', $token, $jsCookieOptions);

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION['auth_token'] = $token;
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        $_SESSION['storage_path'] = $storagePath;
        $_SESSION['storage_limit'] = $storageLimit;
        
        return [
            'success' => true,
            'message' => 'User registered successfully',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'storage_path' => $storagePath,
                'storage_used' => 0,
                'storage_limit' => $storageLimit
            ],
            'session_set' => true,
            'cookies_set' => true
        ];
        
    } catch (PDOException $e) {
        error_log("Registration error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Registration failed: ' . $e->getMessage()];
    }
}

function loginUser($data) {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    if (empty($username) || empty($password)) {
        return ['success' => false, 'error' => 'Username and password required'];
    }
    
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            SELECT id, username, email, password_hash, storage_path, storage_used, storage_limit 
            FROM users 
            WHERE (username = ? OR email = ?) AND is_active = TRUE
        ");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            return ['success' => false, 'error' => 'Invalid username or password'];
        }

        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); 
        
        $stmt = $db->prepare("
            INSERT INTO user_sessions (user_id, token, expires_at, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user['id'], $token, $expiresAt, $ipAddress, $userAgent]);

        $updateStmt = $db->prepare("UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = ?");
        $updateStmt->execute([$user['id']]);

        $cookieParams = session_get_cookie_params();
        setcookie(
            'auth_token', 
            $token, 
            [
                'expires' => time() + (24 * 60 * 60), 
                'path' => '/',
                'domain' => '.coderpoint.ru', 
                'secure' => true, 
                'httponly' => true, 
                'samesite' => 'Lax' 
            ]
        );
        
        setcookie(
            'user_token', 
            $token, 
            time() + (24 * 60 * 60), 
            "/", 
            "coderpoint.ru", 
            true, 
            false
        );
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION['auth_token'] = $token;
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        
        return [
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'storage_path' => $user['storage_path'],
                'storage_used' => $user['storage_used'],
                'storage_limit' => $user['storage_limit']
            ],
            'session_set' => true
        ];
        
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Login failed: ' . $e->getMessage()];
    }
}

function logoutUser($data) {
    $token = $data['token'] ?? '';
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (empty($token) && isset($_SESSION['auth_token'])) {
        $token = $_SESSION['auth_token'];
    }
    
    try {
        $db = getDBConnection();

        if (!empty($token)) {
            $stmt = $db->prepare("DELETE FROM user_sessions WHERE token = ?");
            $stmt->execute([$token]);
        }

        session_unset();
        session_destroy();
        
        // Clear cookies
        setcookie('auth_token', '', time() - 3600, '/', '.coderpoint.ru', true, true);
        setcookie('user_token', '', time() - 3600, '/', 'coderpoint.ru', true, false);
        
        return ['success' => true, 'message' => 'Logout successful'];
        
    } catch (PDOException $e) {
        error_log("Logout error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Logout failed'];
    }
}

function verifyToken($data) {
    $token = $data['token'] ?? '';

    if (empty($token)) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
        }
    }

    if (empty($token)) {
        $token = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
    }

    if (empty($token) && isset($_COOKIE['auth_token'])) {
        $token = $_COOKIE['auth_token'];
    }

    if (empty($token) && session_status() === PHP_SESSION_ACTIVE) {
        $token = $_SESSION['auth_token'] ?? '';
    }

    if (empty($token)) {
        return ['success' => false, 'error' => 'Token required'];
    }
    
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            SELECT us.*, u.username, u.email, u.storage_path, u.storage_used, u.storage_limit 
            FROM user_sessions us 
            JOIN users u ON us.user_id = u.id 
            WHERE us.token = ? AND us.expires_at > NOW() AND u.is_active = TRUE
        ");
        $stmt->execute([$token]);
        $session = $stmt->fetch();
        
        if (!$session) {
            return ['success' => false, 'error' => 'Invalid or expired token'];
        }
        
        return [
            'success' => true,
            'user' => [
                'id' => $session['user_id'],
                'username' => $session['username'],
                'email' => $session['email'],
                'storage_path' => $session['storage_path'],
                'storage_used' => $session['storage_used'],
                'storage_limit' => $session['storage_limit']
            ]
        ];
        
    } catch (PDOException $e) {
        error_log("Token verification error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Token verification failed'];
    }
}

function getUserProfile($data) {
    $token = $data['token'] ?? '';
    
    $verification = verifyToken(['token' => $token]);
    if (!$verification['success']) {
        return $verification;
    }
    
    $user = $verification['user'];
    
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as total_files,
                SUM(size) as total_size,
                COUNT(CASE WHEN is_directory = TRUE THEN 1 END) as total_folders
            FROM files_metadata 
            WHERE user_id = ?
        ");
        $stmt->execute([$user['id']]);
        $stats = $stmt->fetch();

        $fileStmt = $db->prepare("
            SELECT filename, file_path, size, created_at 
            FROM files_metadata 
            WHERE user_id = ? AND is_directory = FALSE 
            ORDER BY created_at DESC 
            LIMIT 5
        ");
        $fileStmt->execute([$user['id']]);
        $recentFiles = $fileStmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'profile' => [
                'user' => $user,
                'statistics' => [
                    'total_files' => $stats['total_files'] ?? 0,
                    'total_folders' => $stats['total_folders'] ?? 0,
                    'total_size' => $stats['total_size'] ?? 0,
                    'storage_used' => $user['storage_used'],
                    'storage_limit' => $user['storage_limit'],
                    'storage_percentage' => $user['storage_limit'] > 0 ? 
                        round(($user['storage_used'] / $user['storage_limit']) * 100, 2) : 0
                ],
                'recent_files' => $recentFiles
            ]
        ];
        
    } catch (PDOException $e) {
        error_log("Profile error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Failed to get profile'];
    }
}

function getUserStats($data) {
    $token = $data['token'] ?? '';
    
    $verification = verifyToken(['token' => $token]);
    if (!$verification['success']) {
        return $verification;
    }
    
    $user = $verification['user'];
    
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            SELECT 
                COUNT(*) as total_files,
                COUNT(CASE WHEN is_directory = TRUE THEN 1 END) as total_folders,
                SUM(CASE WHEN is_directory = FALSE THEN size ELSE 0 END) as total_size,
                file_type,
                COUNT(*) as type_count
            FROM files_metadata 
            WHERE user_id = ?
            GROUP BY file_type
            ORDER BY type_count DESC
        ");
        $stmt->execute([$user['id']]);
        $typeStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $largeStmt = $db->prepare("
            SELECT filename, file_path, size, created_at 
            FROM files_metadata 
            WHERE user_id = ? AND is_directory = FALSE 
            ORDER BY size DESC 
            LIMIT 10
        ");
        $largeStmt->execute([$user['id']]);
        $largestFiles = $largeStmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'stats' => [
                'total_files' => array_sum(array_column($typeStats, 'type_count')) - 
                               ($typeStats[array_search('directory', array_column($typeStats, 'file_type'))]['type_count'] ?? 0),
                'total_folders' => $typeStats[array_search('directory', array_column($typeStats, 'file_type'))]['type_count'] ?? 0,
                'total_size' => $user['storage_used'],
                'file_types' => $typeStats,
                'largest_files' => $largestFiles,
                'storage_limit' => $user['storage_limit'],
                'storage_available' => max(0, $user['storage_limit'] - $user['storage_used'])
            ]
        ];
        
    } catch (PDOException $e) {
        error_log("Stats error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Failed to get statistics'];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = getDBConnection();
        $dbStatus = 'connected';
        
        $userCount = $db->query("SELECT COUNT(*) as count FROM users")->fetch()['count'];
        $fileCount = $db->query("SELECT COUNT(*) as count FROM files_metadata")->fetch()['count'];
        $activeSessions = $db->query("SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > NOW()")->fetch()['count'];
        
    } catch (Exception $e) {
        $dbStatus = 'disconnected';
        $userCount = 0;
        $fileCount = 0;
        $activeSessions = 0;
    }
    
    echo json_encode([
        'status' => 'active',
        'message' => 'Cloud Storage Auth API is running',
        'database' => $dbStatus,
        'statistics' => [
            'total_users' => $userCount,
            'total_files' => $fileCount,
            'active_sessions' => $activeSessions
        ],
        'endpoints' => [
            'POST /api/auth.php - Authentication operations',
            'Actions: register, login, logout, verify, profile, stats'
        ],
        'features' => [
            'File-based cloud storage',
            'Token-based authentication',
            'Storage quotas',
            'File statistics',
            'Session management'
        ]
    ]);
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
?>