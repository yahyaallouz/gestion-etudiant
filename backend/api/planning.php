<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../config/JwtHandler.php';

$database = new Database();
$db = $database->getConnection();
$jwt = new JwtHandler();
$authUserId = $jwt->getAuthId(); 

// Public read access allowed? Let's restrict to auth users
if (!$authUserId) { http_response_code(401); exit; }

$stmt = $db->prepare("SELECT role FROM users WHERE id = :id");
$stmt->bindParam(':id', $authUserId);
$stmt->execute();
$role = $stmt->fetch(PDO::FETCH_ASSOC)['role'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $query = "SELECT s.*, u.name as teacher_name FROM schedule s LEFT JOIN users u ON s.teacher_id = u.id ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($method == 'POST') {
    if ($role !== 'admin') { http_response_code(403); exit; }
    
    $data = json_decode(file_get_contents("php://input"));
    $query = "INSERT INTO schedule (class_name, subject, day_of_week, start_time, end_time, teacher_id) VALUES (:cls, :sub, :day, :start, :end, :tid)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':cls', $data->class_name);
    $stmt->bindParam(':sub', $data->subject);
    $stmt->bindParam(':day', $data->day_of_week);
    $stmt->bindParam(':start', $data->start_time);
    $stmt->bindParam(':end', $data->end_time);
    $stmt->bindParam(':tid', $data->teacher_id);
    
    if($stmt->execute()) echo json_encode(["message" => "Class added"]);
    else { http_response_code(503); echo json_encode(["message" => "Error"]); }
}
?>
