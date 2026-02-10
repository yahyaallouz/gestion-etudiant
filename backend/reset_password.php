<?php
include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$email = 'admin@example.com';
$password = 'admin123';
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$query = "UPDATE users SET password = :password WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindParam(':password', $hashed_password);
$stmt->bindParam(':email', $email);

if($stmt->execute()) {
    echo "<h1>Password Reset Successful</h1>";
    echo "<p>User: <strong>$email</strong></p>";
    echo "<p>New Password: <strong>$password</strong></p>";
    echo "<p>Rows affected: " . $stmt->rowCount() . "</p>";
} else {
    echo "<h1>Error</h1>";
    echo "<p>Unable to update password.</p>";
}
?>
