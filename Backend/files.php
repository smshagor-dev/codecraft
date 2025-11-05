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
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    // $token = $input['token'] ?? '';
    
    $headers = getallheaders();

    $token = '';
    
    if (!empty($headers['Authorization']) && str_starts_with($headers['Authorization'], 'Bearer ')) {
        $token = substr($headers['Authorization'], 7);
    } elseif (!empty($headers['X-Auth-Token'])) {
        $token = $headers['X-Auth-Token'];
    }

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Missing or invalid token']);
        exit;
    }
    
    $user = verifyToken($token);
    
    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit;
    }
    
    ensureUserDirectoryExists($user);
    
    switch ($action) {
        case 'list':
            $result = listFiles($user, $input);
            break;
        case 'create':
            $result = createFile($user, $input);
            break;
        case 'read':
            $result = readFileContent($user, $input);
            break;
        case 'write':
            $result = writeFile($user, $input);
            break;
        case 'delete':
            $result = deleteFile($user, $input);
            break;
        case 'mkdir':
            $result = createDirectory($user, $input);
            break;
        case 'rename':
            $result = renameFile($user, $input);
            break;
        case 'copy':
            $result = copyFile($user, $input);
            break;
        case 'move':
            $result = moveFile($user, $input);
            break;
        case 'upload':
            $result = uploadFile($user, $input);
            break;
        case 'stats':
            $result = getFileStats($user, $input);
            break;
        case 'search':
            $result = searchFiles($user, $input);
            break;
        case 'info':
            $result = getFileInfo($user, $input);
            break;
        default:
            $result = ['success' => false, 'error' => 'Invalid action'];
    }
    
    echo json_encode($result);
    exit;
}

function ensureUserDirectoryExists($user) {
    $baseStorageDir = realpath(dirname(__DIR__)) . '/cloud_storage';
    
    if (!file_exists($baseStorageDir)) {
        mkdir($baseStorageDir, 0755, true);
    }

    $userDir = $baseStorageDir . '/' . $user['username'];
    if (!file_exists($userDir)) {
        mkdir($userDir, 0755, true);

        $defaultDirs = ['documents', 'projects', 'images', 'downloads'];
        foreach ($defaultDirs as $dir) {
            mkdir($userDir . '/' . $dir, 0755, true);
        }

        $welcomeContent = "Welcome to your cloud storage, " . $user['username'] . "!\n\n";
        $welcomeContent .= "This is your personal cloud storage space.\n";
        $welcomeContent .= "You can create files and folders here.\n\n";
        $welcomeContent .= "Created: " . date('Y-m-d H:i:s');
        
        file_put_contents($userDir . '/welcome.txt', $welcomeContent);

        updateUserStoragePath($user['id'], '/cloud_storage/' . $user['username']);
    }
}


function updateUserStoragePath($userId, $storagePath) {
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            UPDATE users 
            SET storage_path = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$storagePath, $userId]);
        
        return true;
    } catch (PDOException $e) {
        error_log("Storage path update error: " . $e->getMessage());
        return false;
    }
}


function verifyToken($token) {
    if (empty($token)) {
        return false;
    }
    
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.email, u.storage_path, u.storage_used, u.storage_limit, 
                   u.role, u.is_active
            FROM user_sessions us 
            JOIN users u ON us.user_id = u.id 
            WHERE us.token = ? AND us.expires_at > NOW() AND u.is_active = TRUE
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        return $user ?: false;
        
    } catch (PDOException $e) {
        error_log("Token verification error: " . $e->getMessage());
        return false;
    }
}

function checkUserPermission($user, $operation, $filePath = null) {
    if ($user['role'] === 'admin') {
        return true;
    }
    
    return true;
    
    $userPermissions = json_decode($user['permissions'] ?? '{}', true);

    if ($filePath) {
        if (isset($userPermissions['paths'][$filePath])) {
            $pathPerms = $userPermissions['paths'][$filePath];
            return in_array($operation, $pathPerms);
        }
        
        $parentDir = dirname($filePath);
        if ($parentDir !== '.' && $parentDir !== '/') {
            return checkUserPermission($user, $operation, $parentDir);
        }
    }

    $globalPerms = $userPermissions['global'] ?? [];
    return in_array($operation, $globalPerms);
}

function updateStorageUsage($userId, $sizeChange) {
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            UPDATE users 
            SET storage_used = GREATEST(0, storage_used + ?), 
                updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$sizeChange, $userId]);
        
        return true;
    } catch (PDOException $e) {
        error_log("Storage update error: " . $e->getMessage());
        return false;
    }
}

function recordFileMetadata($user, $fileData) {
    try {
        $db = getDBConnection();
        
        $fileId = bin2hex(random_bytes(16));
        
        $stmt = $db->prepare("
            INSERT INTO files_metadata 
            (file_id, user_id, filename, file_path, full_path, size, file_type, is_directory, mime_type, permissions, owner_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $fileId,
            $user['id'],
            $fileData['filename'],
            $fileData['file_path'],
            $fileData['full_path'],
            $fileData['size'],
            $fileData['file_type'] ?? '',
            $fileData['is_directory'] ?? false,
            $fileData['mime_type'] ?? '',
            $fileData['permissions'] ?? '775',
            $user['id']
        ]);
        
        return $fileId;
    } catch (PDOException $e) {
        error_log("File metadata error: " . $e->getMessage());
        return null;
    }
}

function updateFileMetadata($fileId, $fileData) {
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("
            UPDATE files_metadata 
            SET filename = ?, file_path = ?, full_path = ?, size = ?, updated_at = NOW() 
            WHERE file_id = ?
        ");
        
        $stmt->execute([
            $fileData['filename'],
            $fileData['file_path'],
            $fileData['full_path'],
            $fileData['size'],
            $fileId
        ]);
        
        return true;
    } catch (PDOException $e) {
        error_log("File metadata update error: " . $e->getMessage());
        return false;
    }
}

function deleteFileMetadata($fileId) {
    try {
        $db = getDBConnection();
        
        $stmt = $db->prepare("DELETE FROM files_metadata WHERE file_id = ?");
        $stmt->execute([$fileId]);
        
        return true;
    } catch (PDOException $e) {
        error_log("File metadata delete error: " . $e->getMessage());
        return false;
    }
}

function getPhysicalPath($user, $virtualPath = '') {
    $baseDir = realpath(dirname(__DIR__));
    
    if (!$baseDir) {
        throw new Exception("Base directory not found");
    }

    if (!empty($user['storage_path'])) {
        $userBaseDir = $baseDir . $user['storage_path'];
    } else {
        $userBaseDir = $baseDir . '/cloud_storage/' . $user['username'];
    }

    if (!file_exists($userBaseDir)) {
        if (!mkdir($userBaseDir, 0755, true)) {
            throw new Exception("Failed to create user directory: " . $userBaseDir);
        }
    }
    
    if (empty($virtualPath) || $virtualPath === '/') {
        return $userBaseDir;
    }

    $virtualPath = ltrim($virtualPath, '/');
    $fullPath = $userBaseDir . '/' . $virtualPath;
    
    return $fullPath;
}

function validatePathAccess($user, $physicalPath, $checkExistence = true) {
    $baseDir = realpath(dirname(__DIR__));
    
    if (!$baseDir) {
        return ['success' => false, 'error' => 'Base directory not found'];
    }
    
    if (!empty($user['storage_path'])) {
        $userBaseDir = $baseDir . $user['storage_path'];
    } else {
        $userBaseDir = $baseDir . '/cloud_storage/' . $user['username'];
    }

    if (!file_exists($userBaseDir)) {
        if (!mkdir($userBaseDir, 0755, true)) {
            return ['success' => false, 'error' => 'Failed to create user base directory'];
        }
    }
    
    $userBaseDir = realpath($userBaseDir);
    if (!$userBaseDir) {
        return ['success' => false, 'error' => 'Invalid user base directory'];
    }

    if ($checkExistence && !file_exists($physicalPath)) {
        $parentPath = dirname($physicalPath);
        if (strpos($parentPath, $userBaseDir) === 0) {
            return ['success' => true];
        } else {
            return ['success' => false, 'error' => 'Access denied - parent path outside user directory'];
        }
    }
    
    $resolvedPath = realpath($physicalPath);
    if ($resolvedPath === false && $checkExistence) {
        return ['success' => false, 'error' => 'Invalid path: ' . $physicalPath];
    }
    
    if ($resolvedPath && strpos($resolvedPath, $userBaseDir) !== 0) {
        return ['success' => false, 'error' => 'Access denied - path traversal detected'];
    }
    
    return ['success' => true];
}

function listFiles($user, $data) {
    $path = $data['path'] ?? '';

    error_log("List files request - Path: '" . $path . "', Data: " . json_encode($data));

    if ($path === 'ls') {
        $path = '';
    }

    if (!checkUserPermission($user, 'read', $path)) {
        return ['success' => false, 'error' => 'Read permission denied'];
    }
    
    $physicalPath = getPhysicalPath($user, $path);

    error_log("Physical path: " . $physicalPath);

    $accessCheck = validatePathAccess($user, $physicalPath);
    if (!$accessCheck['success']) {
        return $accessCheck;
    }
    
    if (!file_exists($physicalPath)) {
        if (!mkdir($physicalPath, 0755, true)) {
            return ['success' => false, 'error' => 'Path not found and could not be created: ' . $path];
        }
        return ['success' => true, 'path' => $path, 'items' => [], 'total' => 0, 'message' => 'Directory created'];
    }
    
    if (!is_dir($physicalPath)) {
        return ['success' => false, 'error' => 'Path is not a directory: ' . $path];
    }
    
    $items = scandir($physicalPath);
    if ($items === false) {
        return ['success' => false, 'error' => 'Failed to read directory: ' . $path];
    }
    
    $result = [];
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $itemPath = $physicalPath . '/' . $item;
        $relativePath = ltrim($path . '/' . $item, '/');

        if (!checkUserPermission($user, 'read', $relativePath)) {
            continue; 
        }
        
        $result[] = [
            'name' => $item,
            'path' => $relativePath,
            'type' => is_dir($itemPath) ? 'directory' : 'file',
            'size' => is_file($itemPath) ? filesize($itemPath) : 0,
            'modified' => date('Y-m-d H:i:s', filemtime($itemPath)),
            'created' => date('Y-m-d H:i:s', filectime($itemPath)),
            'permissions' => substr(sprintf('%o', fileperms($itemPath)), -4),
            'extension' => is_file($itemPath) ? pathinfo($item, PATHINFO_EXTENSION) : '',
            'readable' => is_readable($itemPath),
            'writable' => checkUserPermission($user, 'write', $relativePath),
            'deletable' => checkUserPermission($user, 'delete', $relativePath)
        ];
    }

    usort($result, function($a, $b) {
        if ($a['type'] === $b['type']) {
            return strcasecmp($a['name'], $b['name']);
        }
        return $a['type'] === 'directory' ? -1 : 1;
    });
    
    return [
        'success' => true,
        'path' => $path,
        'items' => $result,
        'total' => count($result),
        'permissions' => [
            'can_write' => checkUserPermission($user, 'write', $path),
            'can_delete' => checkUserPermission($user, 'delete', $path),
            'can_create' => checkUserPermission($user, 'create', $path)
        ],
        'storage' => [
            'used' => $user['storage_used'],
            'limit' => $user['storage_limit'],
            'available' => max(0, $user['storage_limit'] - $user['storage_used'])
        ]
    ];
}

function createFile($user, $data) {
    $filename = $data['filename'] ?? '';
    $content = $data['content'] ?? '';
    $path = $data['path'] ?? '';
    
    error_log("Create file - Filename: '$filename', Path: '$path', Content length: " . strlen($content));

    if (!checkUserPermission($user, 'create', $path)) {
        return ['success' => false, 'error' => 'Create permission denied'];
    }
    
    if (empty($filename)) {
        return ['success' => false, 'error' => 'Filename required'];
    }

    $fileSize = strlen($content);
    if ($user['storage_used'] + $fileSize > $user['storage_limit']) {
        return ['success' => false, 'error' => 'Storage limit exceeded'];
    }
    
    try {
        $physicalPath = getPhysicalPath($user, $path);
        $filePath = $physicalPath . '/' . $filename;
        
        error_log("Physical path: '$physicalPath'");
        error_log("Full file path: '$filePath'");

        $accessCheck = validatePathAccess($user, $filePath, false);
        if (!$accessCheck['success']) {
            error_log("Access check failed: " . $accessCheck['error']);
            return $accessCheck;
        }

        $dirPath = dirname($filePath);
        if (!file_exists($dirPath)) {
            error_log("Creating directory: '$dirPath'");
            if (!mkdir($dirPath, 0755, true)) {
                return ['success' => false, 'error' => 'Failed to create directory: ' . $dirPath];
            }
        }
        
        if (file_exists($filePath)) {
            return ['success' => false, 'error' => 'File already exists'];
        }
        
        if (file_put_contents($filePath, $content) === false) {
            return ['success' => false, 'error' => 'Failed to create file'];
        }

        $fileData = [
            'filename' => $filename,
            'file_path' => $path,
            'full_path' => $filePath,
            'size' => $fileSize,
            'file_type' => pathinfo($filename, PATHINFO_EXTENSION),
            'is_directory' => false,
            'mime_type' => mime_content_type($filePath),
            'permissions' => '644'
        ];
        
        $fileId = recordFileMetadata($user, $fileData);

        updateStorageUsage($user['id'], $fileSize);
        
        return [
            'success' => true,
            'message' => 'File created successfully',
            'path' => ltrim($path . '/' . $filename, '/'),
            'size' => $fileSize,
            'file_id' => $fileId,
            'storage_used' => $user['storage_used'] + $fileSize
        ];
        
    } catch (Exception $e) {
        error_log("Create file exception: " . $e->getMessage());
        return ['success' => false, 'error' => 'File creation failed: ' . $e->getMessage()];
    }
}

function createDirectory($user, $data) {
    $dirname = $data['dirname'] ?? '';
    $path = $data['path'] ?? '';
    
    error_log("Create directory - Dirname: '$dirname', Path: '$path'");

    if (!checkUserPermission($user, 'create', $path)) {
        return ['success' => false, 'error' => 'Create permission denied'];
    }
    
    if (empty($dirname)) {
        return ['success' => false, 'error' => 'Directory name required'];
    }
    
    try {
        $physicalPath = getPhysicalPath($user, $path);
        $dirPath = $physicalPath . '/' . $dirname;
        
        error_log("Physical path: '$physicalPath'");
        error_log("Full directory path: '$dirPath'");

        $accessCheck = validatePathAccess($user, $dirPath, false);
        if (!$accessCheck['success']) {
            error_log("Access check failed: " . $accessCheck['error']);
            return $accessCheck;
        }
        
        if (file_exists($dirPath)) {
            return ['success' => false, 'error' => 'Directory already exists'];
        }
        
        if (!mkdir($dirPath, 0755, true)) {
            return ['success' => false, 'error' => 'Failed to create directory'];
        }

        $fileData = [
            'filename' => $dirname,
            'file_path' => $path,
            'full_path' => $dirPath,
            'size' => 0,
            'file_type' => 'directory',
            'is_directory' => true,
            'mime_type' => 'inode/directory',
            'permissions' => '755'
        ];
        
        $fileId = recordFileMetadata($user, $fileData);
        
        return [
            'success' => true,
            'message' => 'Directory created successfully',
            'path' => ltrim($path . '/' . $dirname, '/'),
            'file_id' => $fileId
        ];
        
    } catch (Exception $e) {
        error_log("Create directory exception: " . $e->getMessage());
        return ['success' => false, 'error' => 'Directory creation failed: ' . $e->getMessage()];
    }
}

function readFileContent($user, $data) {
    $filepath = $data['filepath'] ?? '';

    if (!checkUserPermission($user, 'read', $filepath)) {
        return ['success' => false, 'error' => 'Read permission denied'];
    }
    
    if (empty($filepath)) {
        return ['success' => false, 'error' => 'Filepath required'];
    }
    
    $physicalPath = getPhysicalPath($user, $filepath);

    $accessCheck = validatePathAccess($user, $physicalPath);
    if (!$accessCheck['success']) {
        return $accessCheck;
    }
    
    if (!file_exists($physicalPath)) {
        return ['success' => false, 'error' => 'File not found'];
    }
    
    if (is_dir($physicalPath)) {
        return ['success' => false, 'error' => 'Cannot read directory as file'];
    }
    
    // Check if file is readable
    if (!is_readable($physicalPath)) {
        return ['success' => false, 'error' => 'File is not readable'];
    }
    
    $content = file_get_contents($physicalPath);
    if ($content === false) {
        return ['success' => false, 'error' => 'Failed to read file'];
    }
    
    return [
        'success' => true,
        'content' => $content,
        'size' => filesize($physicalPath),
        'modified' => date('Y-m-d H:i:s', filemtime($physicalPath)),
        'path' => $filepath,
        'permissions' => [
            'can_write' => checkUserPermission($user, 'write', $filepath),
            'can_delete' => checkUserPermission($user, 'delete', $filepath)
        ]
    ];
}

function writeFile($user, $data) {
    $filepath = $data['filepath'] ?? '';
    $content = $data['content'] ?? '';
    
    error_log("Write file - Filepath: '$filepath', Content length: " . strlen($content));

    if (!checkUserPermission($user, 'write', $filepath)) {
        return ['success' => false, 'error' => 'Write permission denied'];
    }
    
    if (empty($filepath)) {
        return ['success' => false, 'error' => 'Filepath required'];
    }
    
    try {
        $physicalPath = getPhysicalPath($user, $filepath);
        
        error_log("Physical path for write: '$physicalPath'");

        $accessCheck = validatePathAccess($user, $physicalPath);
        if (!$accessCheck['success']) {
            error_log("Access check failed: " . $accessCheck['error']);
            return $accessCheck;
        }
        
        if (!file_exists($physicalPath)) {
            return ['success' => false, 'error' => 'File not found: ' . $filepath];
        }
        
        if (is_dir($physicalPath)) {
            return ['success' => false, 'error' => 'Cannot write to directory'];
        }

        if (!is_writable($physicalPath)) {
            return ['success' => false, 'error' => 'File is not writable'];
        }

        $oldSize = filesize($physicalPath);
        $newSize = strlen($content);
        $sizeChange = $newSize - $oldSize;

        if ($user['storage_used'] + $sizeChange > $user['storage_limit']) {
            return ['success' => false, 'error' => 'Storage limit exceeded'];
        }
        
        if (file_put_contents($physicalPath, $content) === false) {
            return ['success' => false, 'error' => 'Failed to write file'];
        }

        try {
            $db = getDBConnection();
            $stmt = $db->prepare("
                UPDATE files_metadata 
                SET size = ?, updated_at = NOW() 
                WHERE user_id = ? AND full_path = ?
            ");
            $stmt->execute([$newSize, $user['id'], $physicalPath]);
        } catch (PDOException $e) {
            error_log("File metadata update error: " . $e->getMessage());
        }
        
        updateStorageUsage($user['id'], $sizeChange);
        
        return [
            'success' => true,
            'message' => 'File updated successfully',
            'size' => $newSize,
            'size_change' => $sizeChange,
            'storage_used' => $user['storage_used'] + $sizeChange
        ];
        
    } catch (Exception $e) {
        error_log("Write file exception: " . $e->getMessage());
        return ['success' => false, 'error' => 'File write failed: ' . $e->getMessage()];
    }
}


function downloadFolder($user, $data) {
    $folderPath = $data['folderpath'] ?? '';
    
    if (!checkUserPermission($user, 'read', $folderPath)) {
        return ['success' => false, 'error' => 'Read permission denied'];
    }
    
    if (empty($folderPath)) {
        return ['success' => false, 'error' => 'Folder path required'];
    }
    
    $physicalPath = getPhysicalPath($user, $folderPath);
    
    $accessCheck = validatePathAccess($user, $physicalPath);
    if (!$accessCheck['success']) {
        return $accessCheck;
    }
    
    if (!file_exists($physicalPath)) {
        return ['success' => false, 'error' => 'Folder not found'];
    }
    
    if (!is_dir($physicalPath)) {
        return ['success' => false, 'error' => 'Path is not a directory'];
    }
    
    // Create ZIP file
    $zip = new ZipArchive();
    $zipFilename = tempnam(sys_get_temp_dir(), 'folder_download_') . '.zip';
    
    if ($zip->open($zipFilename, ZipArchive::CREATE) !== TRUE) {
        return ['success' => false, 'error' => 'Cannot create ZIP file'];
    }
    
    // Add files to ZIP recursively
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($physicalPath, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );
    
    foreach ($files as $name => $file) {
        if (!$file->isDir()) {
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($physicalPath) + 1);
            
            if (checkUserPermission($user, 'read', $folderPath . '/' . $relativePath)) {
                $zip->addFile($filePath, $relativePath);
            }
        }
    }
    
    $zip->close();

    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . basename($folderPath) . '.zip"');
    header('Content-Length: ' . filesize($zipFilename));
    readfile($zipFilename);

    unlink($zipFilename);
    exit;
}

function deleteFile($user, $data) {
    $filepath = $data['filepath'] ?? '';

    if (!checkUserPermission($user, 'delete', $filepath)) {
        return ['success' => false, 'error' => 'Delete permission denied'];
    }
    
    if (empty($filepath)) {
        return ['success' => false, 'error' => 'Filepath required'];
    }
    
    $physicalPath = getPhysicalPath($user, $filepath);

    $accessCheck = validatePathAccess($user, $physicalPath);
    if (!$accessCheck['success']) {
        return $accessCheck;
    }
    
    if (!file_exists($physicalPath)) {
        return ['success' => false, 'error' => 'File not found'];
    }

    $fileSize = is_file($physicalPath) ? filesize($physicalPath) : 0;

    try {
        $db = getDBConnection();
        $stmt = $db->prepare("SELECT file_id FROM files_metadata WHERE user_id = ? AND full_path = ?");
        $stmt->execute([$user['id'], $physicalPath]);
        $fileRecord = $stmt->fetch();
    } catch (PDOException $e) {
        error_log("File metadata lookup error: " . $e->getMessage());
    }
    
    if (is_dir($physicalPath)) {
        $files = scandir($physicalPath);
        if (count($files) > 2) { 
            return ['success' => false, 'error' => 'Directory is not empty'];
        }
        
        if (!rmdir($physicalPath)) {
            return ['success' => false, 'error' => 'Failed to delete directory'];
        }
    } else {
        if (!is_writable($physicalPath)) {
            return ['success' => false, 'error' => 'File is not writable (cannot delete)'];
        }
        
        if (!unlink($physicalPath)) {
            return ['success' => false, 'error' => 'Failed to delete file'];
        }
    }

    if ($fileRecord) {
        deleteFileMetadata($fileRecord['file_id']);
    }

    if ($fileSize > 0) {
        updateStorageUsage($user['id'], -$fileSize);
    }
    
    return [
        'success' => true,
        'message' => is_dir($physicalPath) ? 'Directory deleted' : 'File deleted',
        'size_freed' => $fileSize,
        'storage_used' => max(0, $user['storage_used'] - $fileSize)
    ];
}

function renameFile($user, $data) {
    $filepath = $data['filepath'] ?? '';
    $newName = $data['new_name'] ?? '';

    if (!checkUserPermission($user, 'write', $filepath)) {
        return ['success' => false, 'error' => 'Write permission denied for source'];
    }
    
    $targetPath = dirname($filepath) . '/' . $newName;
    if (!checkUserPermission($user, 'create', dirname($targetPath))) {
        return ['success' => false, 'error' => 'Create permission denied for target location'];
    }
    
    if (empty($filepath) || empty($newName)) {
        return ['success' => false, 'error' => 'Filepath and new name required'];
    }
    
    $physicalPath = getPhysicalPath($user, $filepath);
    $newPath = dirname($physicalPath) . '/' . $newName;
    
    // Security check for both paths
    $sourceCheck = validatePathAccess($user, $physicalPath);
    if (!$sourceCheck['success']) {
        return $sourceCheck;
    }
    
    $targetCheck = validatePathAccess($user, $newPath, false);
    if (!$targetCheck['success']) {
        return $targetCheck;
    }
    
    if (!file_exists($physicalPath)) {
        return ['success' => false, 'error' => 'File not found'];
    }
    
    if (file_exists($newPath)) {
        return ['success' => false, 'error' => 'Target file already exists'];
    }
    
    if (!rename($physicalPath, $newPath)) {
        return ['success' => false, 'error' => 'Failed to rename file'];
    }

    try {
        $db = getDBConnection();
        $stmt = $db->prepare("
            UPDATE files_metadata 
            SET filename = ?, full_path = ?, updated_at = NOW() 
            WHERE user_id = ? AND full_path = ?
        ");
        $stmt->execute([$newName, $newPath, $user['id'], $physicalPath]);
    } catch (PDOException $e) {
        error_log("File rename error: " . $e->getMessage());
    }
    
    return [
        'success' => true,
        'message' => 'File renamed successfully',
        'old_path' => $filepath,
        'new_path' => dirname($filepath) . '/' . $newName
    ];
}

function copyFile($user, $data) {
    $sourcePath = $data['source'] ?? '';
    $targetPath = $data['target'] ?? '';

    if (!checkUserPermission($user, 'read', $sourcePath)) {
        return ['success' => false, 'error' => 'Read permission denied for source'];
    }
    
    if (!checkUserPermission($user, 'create', dirname($targetPath))) {
        return ['success' => false, 'error' => 'Create permission denied for target location'];
    }
    
    if (empty($sourcePath) || empty($targetPath)) {
        return ['success' => false, 'error' => 'Source and target paths required'];
    }
    
    $sourcePhysical = getPhysicalPath($user, $sourcePath);
    $targetPhysical = getPhysicalPath($user, $targetPath);

    $sourceCheck = validatePathAccess($user, $sourcePhysical);
    if (!$sourceCheck['success']) {
        return $sourceCheck;
    }
    
    $targetCheck = validatePathAccess($user, $targetPhysical, false);
    if (!$targetCheck['success']) {
        return $targetCheck;
    }
    
    if (!file_exists($sourcePhysical)) {
        return ['success' => false, 'error' => 'Source file not found'];
    }
    
    if (file_exists($targetPhysical)) {
        return ['success' => false, 'error' => 'Target file already exists'];
    }
    
    if (is_dir($sourcePhysical)) {
        // Directory copy
        if (!mkdir($targetPhysical, 0755, true)) {
            return ['success' => false, 'error' => 'Failed to create target directory'];
        }
        
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourcePhysical, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ($files as $file) {
            if ($file->isDir()) {
                mkdir($targetPhysical . '/' . $files->getSubPathName());
            } else {
                copy($file, $targetPhysical . '/' . $files->getSubPathName());
            }
        }
    } else {
        if (!copy($sourcePhysical, $targetPhysical)) {
            return ['success' => false, 'error' => 'Failed to copy file'];
        }
    }
    
    $newSize = is_file($sourcePhysical) ? filesize($sourcePhysical) : 0;

    if ($user['storage_used'] + $newSize > $user['storage_limit']) {
        // Clean up copied files
        if (is_dir($targetPhysical)) {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($targetPhysical, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::CHILD_FIRST
            );
            
            foreach ($files as $file) {
                if ($file->isDir()) {
                    rmdir($file->getRealPath());
                } else {
                    unlink($file->getRealPath());
                }
            }
            rmdir($targetPhysical);
        } else {
            unlink($targetPhysical);
        }
        
        return ['success' => false, 'error' => 'Storage limit exceeded'];
    }

    if ($newSize > 0) {
        updateStorageUsage($user['id'], $newSize);
    }
    
    return [
        'success' => true,
        'message' => 'File copied successfully',
        'source' => $sourcePath,
        'target' => $targetPath,
        'size' => $newSize
    ];
}

function moveFile($user, $data) {
    $copyResult = copyFile($user, $data);
    if (!$copyResult['success']) {
        return $copyResult;
    }
    
    $deleteData = ['filepath' => $data['source']];
    $deleteResult = deleteFile($user, $deleteData);
    
    if (!$deleteResult['success']) {
        $cleanupData = ['filepath' => $data['target']];
        deleteFile($user, $cleanupData);
        return $deleteResult;
    }
    
    return [
        'success' => true,
        'message' => 'File moved successfully',
        'source' => $data['source'],
        'target' => $data['target']
    ];
}

function uploadFile($user, $data) {
    $uploadPath = $data['path'] ?? '';
    
    if (!checkUserPermission($user, 'create', $uploadPath)) {
        return ['success' => false, 'error' => 'Upload permission denied'];
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'No file uploaded or upload error: ' . $_FILES['file']['error'] ?? 'Unknown error'];
    }
    
    $uploadedFile = $_FILES['file'];
    $filename = basename($uploadedFile['name']);
    $fileSize = $uploadedFile['size'];

    if ($fileSize <= 0) {
        return ['success' => false, 'error' => 'Invalid file size'];
    }

    if ($user['storage_used'] + $fileSize > $user['storage_limit']) {
        return ['success' => false, 'error' => 'Storage limit exceeded. Available: ' . 
                formatFileSize($user['storage_limit'] - $user['storage_used']) . 
                ', File size: ' . formatFileSize($fileSize)];
    }
    
    try {
        $physicalPath = getPhysicalPath($user, $uploadPath);
        $filePath = $physicalPath . '/' . $filename;
        
        error_log("Upload file - Filename: '$filename', Path: '$uploadPath', Size: $fileSize");
        error_log("Physical path: '$physicalPath'");
        error_log("Full file path: '$filePath'");

        $accessCheck = validatePathAccess($user, $filePath, false);
        if (!$accessCheck['success']) {
            error_log("Access check failed: " . $accessCheck['error']);
            return $accessCheck;
        }

        $dirPath = dirname($filePath);
        if (!file_exists($dirPath)) {
            error_log("Creating directory: '$dirPath'");
            if (!mkdir($dirPath, 0755, true)) {
                return ['success' => false, 'error' => 'Failed to create directory: ' . $dirPath];
            }
        }

        if (file_exists($filePath)) {
            return ['success' => false, 'error' => 'File already exists: ' . $filename];
        }

        if (!move_uploaded_file($uploadedFile['tmp_name'], $filePath)) {
            return ['success' => false, 'error' => 'Failed to save uploaded file'];
        }
        
        chmod($filePath, 0644);
        
        $fileData = [
            'filename' => $filename,
            'file_path' => $uploadPath,
            'full_path' => $filePath,
            'size' => $fileSize,
            'file_type' => pathinfo($filename, PATHINFO_EXTENSION),
            'is_directory' => false,
            'mime_type' => $uploadedFile['type'],
            'permissions' => '644'
        ];
        
        $fileId = recordFileMetadata($user, $fileData);
        
        // Update storage usage
        updateStorageUsage($user['id'], $fileSize);
        
        return [
            'success' => true,
            'message' => 'File uploaded successfully',
            'filename' => $filename,
            'path' => ltrim($uploadPath . '/' . $filename, '/'),
            'size' => $fileSize,
            'file_id' => $fileId,
            'storage_used' => $user['storage_used'] + $fileSize
        ];
        
    } catch (Exception $e) {
        error_log("File upload exception: " . $e->getMessage());
        return ['success' => false, 'error' => 'File upload failed: ' . $e->getMessage()];
    }
}

function formatFileSize($bytes) {
    if ($bytes == 0) return "0 B";
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = floor(log($bytes, 1024));
    return round($bytes / pow(1024, $i), 2) . ' ' . $units[$i];
}

function getFileStats($user, $data) {
    if (!checkUserPermission($user, 'read', '/')) {
        return ['success' => false, 'error' => 'Permission denied to view statistics'];
    }
    
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
        
        $stmt = $db->prepare("
            SELECT filename, file_path, size, created_at 
            FROM files_metadata 
            WHERE user_id = ? AND is_directory = FALSE 
            ORDER BY size DESC 
            LIMIT 10
        ");
        $stmt->execute([$user['id']]);
        $largestFiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $stmt = $db->prepare("
            SELECT filename, file_path, created_at 
            FROM files_metadata 
            WHERE user_id = ? AND is_directory = FALSE 
            ORDER BY created_at DESC 
            LIMIT 5
        ");
        $stmt->execute([$user['id']]);
        $recentFiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'stats' => [
                'total_files' => array_sum(array_column($typeStats, 'type_count')) - 
                               ($typeStats[array_search('directory', array_column($typeStats, 'file_type'))]['type_count'] ?? 0),
                'total_folders' => $typeStats[array_search('directory', array_column($typeStats, 'file_type'))]['type_count'] ?? 0,
                'total_size' => $user['storage_used'],
                'file_types' => $typeStats,
                'largest_files' => $largestFiles,
                'recent_files' => $recentFiles,
                'storage_limit' => $user['storage_limit'],
                'storage_available' => max(0, $user['storage_limit'] - $user['storage_used'])
            ]
        ];
        
    } catch (PDOException $e) {
        error_log("File stats error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Failed to get file statistics'];
    }
}

function searchFiles($user, $data) {
    $query = $data['query'] ?? '';
    $fileType = $data['file_type'] ?? '';
    
    if (!checkUserPermission($user, 'read', '/')) {
        return ['success' => false, 'error' => 'Search permission denied'];
    }
    
    if (empty($query)) {
        return ['success' => false, 'error' => 'Search query required'];
    }
    
    try {
        $db = getDBConnection();
        
        $sql = "
            SELECT filename, file_path, full_path, size, file_type, is_directory, created_at 
            FROM files_metadata 
            WHERE user_id = ? AND filename LIKE ?
        ";
        $params = [$user['id'], '%' . $query . '%'];
        
        if (!empty($fileType)) {
            $sql .= " AND file_type = ?";
            $params[] = $fileType;
        }
        
        $sql .= " ORDER BY filename LIMIT 50";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $filteredResults = [];
        foreach ($results as $result) {
            $filePath = $result['file_path'] . '/' . $result['filename'];
            if (checkUserPermission($user, 'read', $filePath)) {
                $filteredResults[] = $result;
            }
        }
        
        return [
            'success' => true,
            'query' => $query,
            'results' => $filteredResults,
            'total' => count($filteredResults)
        ];
        
    } catch (PDOException $e) {
        error_log("File search error: " . $e->getMessage());
        return ['success' => false, 'error' => 'Search failed'];
    }
}

function getFileInfo($user, $data) {
    $filepath = $data['filepath'] ?? '';

    if (!checkUserPermission($user, 'read', $filepath)) {
        return ['success' => false, 'error' => 'Read permission denied'];
    }
    
    if (empty($filepath)) {
        return ['success' => false, 'error' => 'Filepath required'];
    }
    
    $physicalPath = getPhysicalPath($user, $filepath);

    $accessCheck = validatePathAccess($user, $physicalPath);
    if (!$accessCheck['success']) {
        return $accessCheck;
    }
    
    if (!file_exists($physicalPath)) {
        return ['success' => false, 'error' => 'File not found'];
    }
    
    $fileInfo = [
        'name' => basename($physicalPath),
        'path' => $filepath,
        'type' => is_dir($physicalPath) ? 'directory' : 'file',
        'size' => is_file($physicalPath) ? filesize($physicalPath) : 0,
        'modified' => date('Y-m-d H:i:s', filemtime($physicalPath)),
        'created' => date('Y-m-d H:i:s', filectime($physicalPath)),
        'permissions' => substr(sprintf('%o', fileperms($physicalPath)), -4),
        'readable' => is_readable($physicalPath),
        'writable' => is_writable($physicalPath) && checkUserPermission($user, 'write', $filepath),
        'executable' => is_executable($physicalPath),
        'user_permissions' => [
            'can_read' => checkUserPermission($user, 'read', $filepath),
            'can_write' => checkUserPermission($user, 'write', $filepath),
            'can_delete' => checkUserPermission($user, 'delete', $filepath)
        ]
    ];
    
    if (is_file($physicalPath)) {
        $fileInfo['extension'] = pathinfo($physicalPath, PATHINFO_EXTENSION);
        $fileInfo['mime_type'] = mime_content_type($physicalPath);
    }
    
    return [
        'success' => true,
        'file_info' => $fileInfo
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = getDBConnection();
        $dbStatus = 'connected';
        
        // Get some basic stats
        $fileCount = $db->query("SELECT COUNT(*) as count FROM files_metadata")->fetch()['count'];
        $totalSize = $db->query("SELECT SUM(size) as size FROM files_metadata WHERE is_directory = FALSE")->fetch()['size'];
        $activeUsers = $db->query("SELECT COUNT(DISTINCT user_id) as count FROM user_sessions WHERE expires_at > NOW()")->fetch()['count'];
        
    } catch (Exception $e) {
        $dbStatus = 'disconnected';
        $fileCount = 0;
        $totalSize = 0;
        $activeUsers = 0;
    }
    
    echo json_encode([
        'status' => 'active',
        'message' => 'Cloud File Management API is running',
        'database' => $dbStatus,
        'statistics' => [
            'total_files' => $fileCount,
            'total_size' => $totalSize ?: 0,
            'active_users' => $activeUsers
        ],
        'endpoints' => [
            'POST /api/files.php - File operations (requires token)',
            'Actions: list, create, read, write, delete, mkdir, rename, copy, move, upload, stats, search, info'
        ]
    ]);
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
?>