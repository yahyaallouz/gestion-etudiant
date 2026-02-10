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

// Get User Role
$query = "SELECT role FROM users WHERE id = :id";
$stmt = $db->prepare($query);
$stmt->bindParam(':id', $authUserId);
$stmt->execute();
$currentUser = $stmt->fetch(PDO::FETCH_ASSOC);
$role = $currentUser['role'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    if ($role == 'student') {
        // Student sees own grades
        $query = "SELECT g.id, g.subject, g.score, g.created_at, u.name as teacher_name 
                  FROM grades g 
                  JOIN users u ON g.teacher_id = u.id 
                  WHERE g.student_id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $authUserId);
    } else {
        // Admin/Teacher see all (or filtered by student)
        $studentId = isset($_GET['student_id']) ? $_GET['student_id'] : null;
        if($studentId) {
             $query = "SELECT g.id, g.subject, g.score, g.created_at, u.name as teacher_name 
                  FROM grades g 
                  JOIN users u ON g.teacher_id = u.id 
                  WHERE g.student_id = :id";
             $stmt = $db->prepare($query);
             $stmt->bindParam(':id', $studentId);
        } else {
            // List all grades (maybe limit this?)
            $query = "SELECT g.id, g.student_id, s.name as student_name, g.subject, g.score, u.name as teacher_name 
                      FROM grades g 
                      JOIN users u ON g.teacher_id = u.id 
                      JOIN users s ON g.student_id = s.id
                      ORDER BY g.created_at DESC";
            $stmt = $db->prepare($query);
        }
    }
    
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($method == 'POST') {
    if ($role != 'teacher' && $role != 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden."]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));

    if(!isset($data->student_id) || !isset($data->subject) || !isset($data->score)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
        exit;
    }

    $query = "INSERT INTO grades (student_id, subject, score, teacher_id) VALUES (:student_id, :subject, :score, :teacher_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':student_id', $data->student_id);
    $stmt->bindParam(':subject', $data->subject);
    $stmt->bindParam(':score', $data->score);
    $stmt->bindParam(':teacher_id', $authUserId);

    if($stmt->execute()) {
        // Send Notification to Student
        $notifQuery = "INSERT INTO notifications (user_id, message) VALUES (:student_id, :message)";
        $notifStmt = $db->prepare($notifQuery);
        $message = "New Grade Posted: Check your result in " . $data->subject;
        $notifStmt->bindParam(':student_id', $data->student_id);
        $notifStmt->bindParam(':message', $message);
        $notifStmt->execute();

        http_response_code(201);
        echo json_encode(["message" => "Grade added and notification sent."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to add grade."]);
    }
} elseif ($method == 'DELETE') {
     if ($role != 'teacher' && $role != 'admin') {
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

    $query = "DELETE FROM grades WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);

    if($stmt->execute()) {
        echo json_encode(["message" => "Grade deleted."]);
    } else {
         http_response_code(503);
        echo json_encode(["message" => "Unable to delete grade."]);
    }
}
?>
