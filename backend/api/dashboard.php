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

$response = [];

if ($role == 'student') {
    // 1. Calculate Average Grade
    $query = "SELECT AVG(score) as average_grade, COUNT(id) as total_exams FROM grades WHERE student_id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $authUserId);
    $stmt->execute();
    $gradeStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $response['average_grade'] = number_format((float)$gradeStats['average_grade'], 2, '.', '');
    $response['total_exams'] = $gradeStats['total_exams'];

    // 2. Count Absences
    $query = "SELECT COUNT(id) as total_absences FROM attendance WHERE student_id = :id AND status = 'absent'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $authUserId);
    $stmt->execute();
    $absenceStats = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['total_absences'] = $absenceStats['total_absences'];

    // 3. Recent Grades for Chart
    $query = "SELECT subject, score, created_at FROM grades WHERE student_id = :id ORDER BY created_at ASC LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $authUserId);
    $stmt->execute();
    $response['recent_grades'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

} elseif ($role == 'teacher' || $role == 'admin') {
    // 1. Total Students
    $query = "SELECT COUNT(id) as total_students FROM users WHERE role = 'student'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $studentStats = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['total_students'] = $studentStats['total_students'];

    // 2. Class Average (All grades)
    $query = "SELECT AVG(score) as class_average FROM grades";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $gradeStats = $stmt->fetch(PDO::FETCH_ASSOC);
    $response['class_average'] = number_format((float)$gradeStats['class_average'], 2, '.', '');

    // 3. Recent Activities (Just new users for now)
    $query = "SELECT name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $response['recent_users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
     // 4. Grades Distribution for Chart
    $query = "SELECT subject, AVG(score) as avg_score FROM grades GROUP BY subject";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $response['subject_performance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode($response);
?>
