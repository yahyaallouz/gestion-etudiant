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

// Get Role
$stmt = $db->prepare("SELECT role FROM users WHERE id = :id");
$stmt->bindParam(':id', $authUserId);
$stmt->execute();
$userRole = $stmt->fetch(PDO::FETCH_ASSOC)['role'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    if ($userRole === 'student') {
        $query = "SELECT a.*, u.name as student_name FROM attendance a JOIN users u ON a.student_id = u.id WHERE student_id = :id ORDER BY date DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $authUserId);
    } else {
        $query = "SELECT a.*, u.name as student_name FROM attendance a JOIN users u ON a.student_id = u.id ORDER BY date DESC";
        $stmt = $db->prepare($query);
    }
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($method == 'POST') {
    if ($userRole === 'student') {
        http_response_code(403); exit;
    }
    $data = json_decode(file_get_contents("php://input"));
    
    $query = "INSERT INTO attendance (student_id, course_name, date, status) VALUES (:sid, :course, :date, :status)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':sid', $data->student_id);
    $stmt->bindParam(':course', $data->course_name);
    $stmt->bindParam(':date', $data->date);
    $stmt->bindParam(':status', $data->status);
    
    if($stmt->execute()) echo json_encode(["message" => "Attendance recorded"]);
    else { http_response_code(503); echo json_encode(["message" => "Error"]); }

} elseif ($method == 'DELETE') {
    if ($userRole === 'student') {
        http_response_code(403); exit;
    }
    $data = json_decode(file_get_contents("php://input"));
    $stmt = $db->prepare("DELETE FROM attendance WHERE id = :id");
    $stmt->bindParam(':id', $data->id);
    if($stmt->execute()) echo json_encode(["message" => "Deleted"]);
}
?>
