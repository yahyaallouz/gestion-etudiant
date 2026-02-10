$deployDir = "c:\xampp\htdocs\GestionETD\deployment"
$frontendDist = "c:\xampp\htdocs\GestionETD\frontend\dist"
$backendSrc = "c:\xampp\htdocs\GestionETD\backend"
$zipPath = "c:\xampp\htdocs\GestionETD\gestion_etudiant_deploy.zip"

Write-Host "Starting deployment prep..."

# Clean up previous attempts
if (Test-Path $deployDir) { Remove-Item -Recurse -Force $deployDir }
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

# Create directories
New-Item -ItemType Directory -Path $deployDir | Out-Null
New-Item -ItemType Directory -Path "$deployDir\backend" | Out-Null

# Copy Frontend Build (to root of deploy)
Write-Host "Copying Frontend from $frontendDist..."
Copy-Item -Recurse "$frontendDist\*" $deployDir

# Copy Backend (to /backend)
Write-Host "Copying Backend from $backendSrc..."
Copy-Item -Recurse "$backendSrc\*" "$deployDir\backend"

# List contents for verification
Write-Host "Verifying deployment folder content:"
Get-ChildItem -Recurse $deployDir | Select-Object FullName

# Create Zip
Write-Host "Zipping to $zipPath..."
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipPath -Force

Write-Host "Deployment zip created at: $zipPath"
