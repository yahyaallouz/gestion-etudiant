<?php
// debug_full.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html');

echo "<h1>Server Debugger</h1>";

// 1. Check PHP Version
echo "<h2>PHP Version</h2>";
echo phpversion();

// 2. Check Database Connection
echo "<h2>Database Connection</h2>";
include 'backend/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "<p style='color:green'>Database Connection Successful!</p>";
        
        // Test Query
        $stmt = $db->query("SELECT count(*) as count FROM users");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "<p>User Count: " . $row['count'] . "</p>";
        
        // Test Notifications Table
        try {
            $stmt = $db->query("SELECT count(*) as count FROM notifications");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "<p>Notifications Count: " . $row['count'] . "</p>";
        } catch (PDOException $e) {
            echo "<p style='color:red'>Notifications Table Error: " . $e->getMessage() . "</p>";
        }

    } else {
        echo "<p style='color:red'>Database Connection Object is NULL (Check class).</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>Database Exception: " . $e->getMessage() . "</p>";
}

// 3. Check Modules
echo "<h2>Loaded Extensions</h2>";
$exts = get_loaded_extensions();
if (in_array('pdo_mysql', $exts)) {
    echo "<p style='color:green'>pdo_mysql is loaded.</p>";
} else {
    echo "<p style='color:red'>pdo_mysql is MISSING!</p>";
}

// 4. Check File Permissions
echo "<h2>File Access</h2>";
$files = ['backend/api/dashboard.php', 'backend/api/notifications.php', 'backend/config/cors.php'];
foreach ($files as $f) {
    if (file_exists($f)) {
        echo "<p style='color:green'>$f exists.</p>";
    } else {
        echo "<p style='color:red'>$f NOT FOUND.</p>";
    }
}

// 5. Check JwtHandler
echo "<h2>JwtHandler Test</h2>";
try {
    include_once 'backend/config/JwtHandler.php';
    if (class_exists('JwtHandler')) {
        $jwt = new JwtHandler();
        echo "<p style='color:green'>JwtHandler class loaded and instantiated successfully.</p>";
    } else {
        echo "<p style='color:red'>JwtHandler class FAILED to load.</p>";
    }
} catch (Throwable $e) {
    echo "<p style='color:red'>JwtHandler Crash: " . $e->getMessage() . "</p>";
}

    echo "<p style='color:red'>JwtHandler Crash: " . $e->getMessage() . "</p>";
}

// 6. Check Headers (Debugging 401)
echo "<h2>Request Headers</h2>";
$headers = getallheaders();
echo "<pre>" . print_r($headers, true) . "</pre>";
echo "<h3>Raw _SERVER Authorization</h3>";
echo "<p>HTTP_AUTHORIZATION: " . (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : 'Not Set') . "</p>";
echo "<p>REDIRECT_HTTP_AUTHORIZATION: " . (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : 'Not Set') . "</p>";

echo "<h2>Done.</h2>";
?>
