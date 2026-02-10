<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../config/JwtHandler.php';

$database = new Database();
$db = $database->getConnection();
$jwt = new JwtHandler();

$data = json_decode(file_get_contents("php://input"));
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action == 'register') {
    // Default registration is for TEACHERS (pending admin approval logic could be added, but keeping simple)
    // Admin user is already in DB schema
    
    if(!isset($data->name) || !isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
        exit;
    }

    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $password = password_hash($data->password, PASSWORD_DEFAULT);
    $role = 'teacher'; // Public registration defaults to teacher

    $check_query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($check_query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    if($stmt->rowCount() > 0){
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

} elseif ($action == 'login') {
    
    if(!isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
        exit;
    }

    $email = $data->email;
    $password = $data->password;

    $query = "SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 0,1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if(password_verify($password, $row['password'])) {
            $token_data = [
                "user_id" => $row['id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "role" => $row['role']
            ];
            $jwt_token = $jwt->generateToken($token_data);

            http_response_code(200);
            echo json_encode([
                "message" => "Successful login.",
                "token" => $jwt_token,
                "user" => $token_data
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid password."]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["message" => "User not found."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Invalid action parameter. Received: " . $action]);
}
?>
