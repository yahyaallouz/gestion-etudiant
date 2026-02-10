<?php
// Increase resource limits for large extractions
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300);
set_time_limit(300);

$zipFile = 'gestion_etudiant_deploy.zip';
$extractPath = __DIR__;

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractPath);
    $zip->close();
    echo "<h1>Deployment Successful!</h1>";
    echo "<p>Files extracted to: " . $extractPath . "</p>";
    echo "<p>You can now delete this file and the zip file.</p>";
    echo "<p><a href='index.html'>Go to your site</a></p>";
} else {
    echo "<h1>Error</h1>";
    echo "<p>Failed to open the zip file: " . $zipFile . "</p>";
}
?>
