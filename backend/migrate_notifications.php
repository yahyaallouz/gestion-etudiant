<?php
// backend/migrate_notifications.php
include 'config/database.php';

echo "<h1>Migrating Notifications Table</h1>";

$database = new Database();
$db = $database->getConnection();

$query = "CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

try {
    $db->exec($query);
    echo "<h2 style='color:green'>Table 'notifications' created successfully (or already exists).</h2>";
} catch (PDOException $e) {
    echo "<h2 style='color:red'>Error creating table: " . $e->getMessage() . "</h2>";
}
?>
