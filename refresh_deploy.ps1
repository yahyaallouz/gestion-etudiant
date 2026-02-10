$deployDir = "c:\xampp\htdocs\GestionETD\deployment"
$frontendDist = "c:\xampp\htdocs\GestionETD\frontend\dist"
$backendSrc = "c:\xampp\htdocs\GestionETD\backend"
$zipPath = "c:\xampp\htdocs\GestionETD\gestion_etudiant_deploy.zip"

Write-Host "Refreshing Stale Deployment Folder..."

# 1. Clean deployment folder
if (Test-Path $deployDir) { Remove-Item -Recurse -Force $deployDir }
New-Item -ItemType Directory -Path $deployDir | Out-Null
New-Item -ItemType Directory -Path "$deployDir\backend" | Out-Null

# 2. Copy NEW Frontend Build (contains .htaccess and relative paths)
Write-Host "Copying fresh Frontend from $frontendDist..."
Copy-Item -Recurse "$frontendDist\*" $deployDir

# 3. Copy Backend
Write-Host "Copying Backend..."
Copy-Item -Recurse "$backendSrc\*" "$deployDir\backend"

# Copy Debug Script
Copy-Item "c:\xampp\htdocs\GestionETD\debug_full.php" "$deployDir\debug_full.php"

# Copy Demo Setup Script
Copy-Item "c:\xampp\htdocs\GestionETD\backend\setup_demo.php" "$deployDir\backend\setup_demo.php"

# 4. Verify .htaccess
if (Test-Path "$deployDir\.htaccess") {
    Write-Host "SUCCESS: .htaccess found in deployment package."
}
else {
    Write-Host "ERROR: .htaccess MISSING from deployment package!"
}

# 5. Zip
Write-Host "Zipping..."
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipPath -Force

Write-Host "DONE. Zip is now actually up to date."
