<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../config/JwtHandler.php';

$database = new Database();
$db = $database->getConnection();
$jwt = new JwtHandler();

$authUserId = $jwt->getAuthId();

if (!$authUserId) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
    exit;
}

// Get Request Method
$method = $_SERVER['REQUEST_METHOD'];

// Helper to check if requester is Admin
function isAdmin($db, $id) {
    $query = "SELECT role FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row && $row['role'] === 'admin';
}

if ($method == 'GET') {
    $roleFilter = isset($_GET['role']) ? $_GET['role'] : '';
    
    $query = "SELECT id, name, email, role, created_at FROM users";
    if ($roleFilter) {
        $query .= " WHERE role = :role";
    }
    $query .= " ORDER BY created_at DESC";

    $stmt = $db->prepare($query);
    if ($roleFilter) {
        $stmt->bindParam(':role', $roleFilter);
    }
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($users);

} elseif ($method == 'POST') {
    // Only Admin can add users here (specifically Students, but technically any via this private API)
    if (!isAdmin($db, $authUserId)) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden. Only Admin can add users."]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));

    if(!isset($data->name) || !isset($data->email) || !isset($data->password) || !isset($data->role)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
        exit;
    }

    $name = $data->name;
    $email = $data->email;
    $password = password_hash($data->password, PASSWORD_DEFAULT);
    $role = $data->role; // 'student', 'teacher', 'admin'

    $check = $db->prepare("SELECT id FROM users WHERE email = :email");
    $check->bindParam(':email', $email);
    $check->execute();
    if($check->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["message" => "Email already exists."]);
        exit;
    }

    $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password);
    $stmt->bindParam(':role', $role);

    if($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "User created successfully."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to create user."]);
    }

} elseif ($method == 'DELETE') {
     if (!isAdmin($db, $authUserId)) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        exit;
    }
    
    $data = json_decode(file_get_contents("php://input"));
    $id = isset($data->id) ? $data->id : (isset($_GET['id']) ? $_GET['id'] : null);

    if(!$id) {
        http_response_code(400);
        echo json_encode(["message" => "Missing ID."]);
        exit;
    }

    if ($id == $authUserId) {
        http_response_code(400);
        echo json_encode(["message" => "Cannot delete yourself."]);
        exit;
    }

    $query = "DELETE FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);

    if($stmt->execute()) {
        echo json_encode(["message" => "User deleted."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to delete user."]);
    }
}
?>
