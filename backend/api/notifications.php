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

// Fetch user role
$roleQuery = "SELECT role FROM users WHERE id = :id";
$roleStmt = $db->prepare($roleQuery);
$roleStmt->bindParam(':id', $authUserId);
$roleStmt->execute();
$currentUser = $roleStmt->fetch(PDO::FETCH_ASSOC);
$role = $currentUser ? $currentUser['role'] : null;

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Fetch unread notifications
    $query = "SELECT * FROM notifications WHERE user_id = :id ORDER BY created_at DESC LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $authUserId);
    $stmt->execute();
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Count unread
    $queryCount = "SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = :id AND is_read = 0";
    $stmtCount = $db->prepare($queryCount);
    $stmtCount->bindParam(':id', $authUserId);
    $stmtCount->execute();
    $count = $stmtCount->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "notifications" => $notifications,
        "unread_count" => $count['unread_count']
    ]);

} elseif ($method == 'POST') {
    // Mark as read
    $data = json_decode(file_get_contents("php://input"));
    
    if(isset($data->action)) {
        if($data->action == 'mark_read') {
            $query = "UPDATE notifications SET is_read = 1 WHERE user_id = :id AND is_read = 0";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $authUserId);
            
            if($stmt->execute()) {
                 echo json_encode(["message" => "Notifications marked as read."]);
            } else {
                 http_response_code(503);
                 echo json_encode(["message" => "Unable to update notifications."]);
            }
        } elseif ($data->action == 'send' && ($role == 'admin' || $role == 'teacher')) {
            // Broadcast to all students (or specific user if extended later)
            $message = isset($data->message) ? $data->message : 'New announcement.';
            
            // Get all student IDs
            $stuQuery = "SELECT id FROM users WHERE role = 'student'";
            $stuStmt = $db->prepare($stuQuery);
            $stuStmt->execute();
            $students = $stuStmt->fetchAll(PDO::FETCH_ASSOC);

            $insertQuery = "INSERT INTO notifications (user_id, message) VALUES (:uid, :msg)";
            $insertStmt = $db->prepare($insertQuery);

            foreach($students as $stu) {
                $insertStmt->bindParam(':uid', $stu['id']);
                $insertStmt->bindParam(':msg', $message);
                $insertStmt->execute();
            }
            
            echo json_encode(["message" => "Broadcast sent to " . count($students) . " students."]);
        }
    }
}
?>
