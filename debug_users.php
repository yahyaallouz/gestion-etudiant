<?php
// debug_users.php
include_once 'backend/config/database.php';

echo "<h1>Database Debugger</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("<h2 style='color:red'>Database Connection Failed (Check console/logs)</h2>");
    }
    echo "<h2 style='color:green'>Database Connection Successful</h2>";
    
    // 1. List All Users
    echo "<h3>Current Users in DB:</h3>";
    $query = "SELECT id, name, email, role, password, created_at FROM users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>Name</th><th>Email (wrapped in quotes)</th><th>Role</th><th>Password Hash (First 10 chars)</th></tr>";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $email_debug = "'" . $row['email'] . "'";
            $hash_preview = substr($row['password'], 0, 10) . "...";
            echo "<tr>";
            echo "<td>{$row['id']}</td>";
            echo "<td>{$row['name']}</td>";
            echo "<td>{$email_debug}</td>"; // Show quotes to detect whitespace
            echo "<td>{$row['role']}</td>";
            echo "<td>{$hash_preview}</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No users found in the table.</p>";
    }

    // 2. Test Admin Password
    echo "<h3>Test Admin Password ('admin123')</h3>";
    $admin_email = 'admin@example.com';
    $check = $db->prepare("SELECT password FROM users WHERE email = :email");
    $check->bindParam(':email', $admin_email);
    $check->execute();
    
    if ($check->rowCount() > 0) {
        $row = $check->fetch(PDO::FETCH_ASSOC);
        $hash = $row['password'];
        $verify = password_verify('admin123', $hash);
        if ($verify) {
            echo "<p style='color:green'>SUCCESS: 'admin123' matches the hash in DB.</p>";
        } else {
            echo "<p style='color:red'>FAILURE: 'admin123' does NOT match the hash in DB.</p>";
            echo "<p>Hash in DB: " . $hash . "</p>";
            echo "<p>New Hash of 'admin123': " . password_hash('admin123', PASSWORD_DEFAULT) . "</p>";
        }
    } else {
        echo "<p>Admin user not found for testing.</p>";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
