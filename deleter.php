<?php
// deleter.php - Force deletes everything in the current folder
$dir = __DIR__;
$di = new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS);
$ri = new RecursiveIteratorIterator($di, RecursiveIteratorIterator::CHILD_FIRST);

foreach ( $ri as $file ) {
    // Skip deleting this script itself so it finishes execution
    if ($file->getFilename() === 'deleter.php') continue;

    $file->isDir() ?  rmdir($file) : unlink($file);
}

echo "<h1>Cleanup Complete!</h1>";
echo "<p>All files have been deleted.</p>";
echo "<p>You can now delete this `deleter.php` file and the empty folder is ready for the new zip.</p>";
?>
