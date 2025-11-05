<?php
class DatabaseConfig {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        $this->connect();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new DatabaseConfig();
        }
        return self::$instance;
    }
    
    private function connect() {
        $host = 'localhost';
        $dbname = 'smshagor_cloud_storage';
        $username = 'smshagor_cloud_storage'; 
        $password = 'SmShagor1@1';
        
        try {
            $this->connection = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection error");
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
}

function getDBConnection() {
    return DatabaseConfig::getInstance()->getConnection();
}
?>
