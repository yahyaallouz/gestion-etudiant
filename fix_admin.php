<?php
// fix_admin.php
include_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h1>Fixing Admin Password</h1>";

// 1. Update the password for admin@example.com
$new_password = "admin123";
$new_hash = password_hash($new_password, PASSWORD_DEFAULT);
$email = "admin@example.com";

$query = "UPDATE users SET password = :password WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindParam(':password', $new_hash);
$stmt->bindParam(':email', $email);

if ($stmt->execute()) {
    echo "<h2 style='color:green'>SUCCESS: Password for '$email' updated to '$new_password'.</h2>";
} else {
    echo "<h2 style='color:red'>FAILED to update password.</h2>";
    print_r($stmt->errorInfo());
}

// 2. Show the list of users again
echo "<h3>Current Users:</h3>";
$stmt = $db->query("SELECT id, name, email, role FROM users");
echo "<table border='1'><tr><th>ID</th><th>Email</th><th>Role</th></tr>";
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "<tr><td>{$row['id']}</td><td>{$row['email']}</td><td>{$row['role']}</td></tr>";
}
echo "</table>";
?>
