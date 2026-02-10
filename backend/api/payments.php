<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../config/JwtHandler.php';

$database = new Database();
$db = $database->getConnection();
$jwt = new JwtHandler();
$authUserId = $jwt->getAuthId();

if (!$authUserId) { http_response_code(401); exit; }

$stmt = $db->prepare("SELECT role FROM users WHERE id = :id");
$stmt->bindParam(':id', $authUserId);
$stmt->execute();
$role = $stmt->fetch(PDO::FETCH_ASSOC)['role'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    if ($role === 'student') {
        $query = "SELECT p.*, u.name FROM payments p JOIN users u ON p.student_id = u.id WHERE student_id = :id ORDER BY payment_date DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $authUserId);
    } else {
        $query = "SELECT p.*, u.name FROM payments p JOIN users u ON p.student_id = u.id ORDER BY payment_date DESC";
        $stmt = $db->prepare($query);
    }
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($method == 'POST') {
    if ($role !== 'admin') { http_response_code(403); exit; }
    
    $data = json_decode(file_get_contents("php://input"));
    $query = "INSERT INTO payments (student_id, amount, payment_date, status, description) VALUES (:sid, :amt, :date, :status, :desc)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':sid', $data->student_id);
    $stmt->bindParam(':amt', $data->amount);
    $stmt->bindParam(':date', $data->payment_date);
    $stmt->bindParam(':status', $data->status);
    $stmt->bindParam(':desc', $data->description);
    
    if($stmt->execute()) echo json_encode(["message" => "Payment recorded"]);
    else { http_response_code(503); echo json_encode(["message" => "Error"]); }
}
?>
