<?php
class Database {
    private $host = "localhost";
    private $db_name = "gestion_etudiant_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        // Auto-detect environment
        if ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1') {
            $this->host = "localhost";
            $this->db_name = "gestion_etudiant_db";
            $this->username = "root";
            $this->password = ""; // Default XAMPP
        } else {
            // Production credentials (REPLACE WITH YOUR OWN)
            $this->host = "sql.example.com";
            $this->db_name = "your_db_name";
            $this->username = "your_username";
            $this->password = "your_password";
        }

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(["message" => "Database Connection Failed: " . $exception->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
?>
