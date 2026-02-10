<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../config/JwtHandler.php';

// Enable error reporting for debugging (returns JSON error instead of white screen)
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed.");
    }

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
    $roleStmt->execute([':id' => $authUserId]); // Safer execution
    $currentUser = $roleStmt->fetch(PDO::FETCH_ASSOC);
    $role = $currentUser ? $currentUser['role'] : null;

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method == 'GET') {
        // Fetch unread notifications
        $query = "SELECT * FROM notifications WHERE user_id = :id ORDER BY created_at DESC LIMIT 10";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $authUserId]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Count unread
        $queryCount = "SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = :id AND is_read = 0";
        $stmtCount = $db->prepare($queryCount);
        $stmtCount->execute([':id' => $authUserId]);
        $count = $stmtCount->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "notifications" => $notifications,
            "unread_count" => $count['unread_count']
        ]);

    } elseif ($method == 'POST') {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput);
        
        if (!$data) {
             throw new Exception("Invalid JSON input.");
        }

        if(isset($data->action)) {
            if($data->action == 'mark_read') {
                $query = "UPDATE notifications SET is_read = 1 WHERE user_id = :id AND is_read = 0";
                $stmt = $db->prepare($query);
                
                if($stmt->execute([':id' => $authUserId])) {
                     echo json_encode(["message" => "Notifications marked as read."]);
                } else {
                     throw new Exception("Database update failed.");
                }
            } elseif ($data->action == 'send') {
                if ($role !== 'admin' && $role !== 'teacher') {
                    http_response_code(403);
                    echo json_encode(["message" => "Permission denied."]);
                    exit;
                }

                // Broadcast to all students
                $message = isset($data->message) ? trim($data->message) : '';
                if (empty($message)) {
                    http_response_code(400);
                    echo json_encode(["message" => "Message cannot be empty."]);
                    exit;
                }
                
                // Get all student IDs
                $stuQuery = "SELECT id FROM users WHERE role = 'student'";
                $stuStmt = $db->prepare($stuQuery);
                $stuStmt->execute();
                $students = $stuStmt->fetchAll(PDO::FETCH_ASSOC);

                if (count($students) > 0) {
                    $insertQuery = "INSERT INTO notifications (user_id, message) VALUES (:uid, :msg)";
                    $insertStmt = $db->prepare($insertQuery);

                    foreach($students as $stu) {
                        // Use array execution to avoid bindParam loop issues
                        $insertStmt->execute([':uid' => $stu['id'], ':msg' => $message]);
                    }
                }
                
                echo json_encode(["message" => "Broadcast sent to " . count($students) . " students."]);
            } else {
                 http_response_code(400);
                 echo json_encode(["message" => "Invalid action."]);
            }
        } else {
             http_response_code(400);
             echo json_encode(["message" => "Missing action parameter."]);
        }
    }

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        "message" => "Server Error: " . $e->getMessage(),
        "trace" => $e->getTraceAsString() // Optional: remove in strict prod if sensitive
    ]);
}
?>
