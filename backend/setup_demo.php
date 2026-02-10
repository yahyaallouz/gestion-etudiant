<?php
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Demo User Setup</h1>";

function createUser($db, $name, $email, $password, $role) {
    // Check if exists
    $check = $db->prepare("SELECT id FROM users WHERE email = :email");
    $check->execute([':email' => $email]);
    if ($check->rowCount() > 0) {
        echo "<p style='color:orange'>User <strong>$email</strong> already exists. Skipping.</p>";
        return;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)");
    
    if ($stmt->execute([':name' => $name, ':email' => $email, ':password' => $hash, ':role' => $role])) {
        echo "<p style='color:green'>Created user: <strong>$email</strong> with password: <strong>$password</strong></p>";
    } else {
        echo "<p style='color:red'>Failed to create $email</p>";
    }
}

try {
    if ($db) {
        // Create Teacher
        createUser($db, 'Demo Teacher', 'teacher@demo.com', 'demo123', 'teacher');
        
        // Create Student
        createUser($db, 'Demo Student', 'student@demo.com', 'demo123', 'student');
        
        echo "<h3>Setup Complete! You can now log in.</h3>";
        echo "<a href='../'>Go to Homepage</a>";
    } else {
        echo "Database connection failed.";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
