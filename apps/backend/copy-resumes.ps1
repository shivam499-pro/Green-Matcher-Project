# Copy all resume files to backend
$source = "C:\Users\sj998\Downloads"
$destination = "apps\backend"

# Get all resume files
$txtFiles = Get-ChildItem -Path $source -Filter "*.txt" -File
$jsonFiles = Get-ChildItem -Path $source -Filter "jsonresume_*.json"

# Copy all files
foreach ($file in $txtFiles) {
    Copy-Item -Path $file.FullName -Destination $destination
    Write-Host "Copied: $($file.Name)"
}

foreach ($file in $jsonFiles) {
    Copy-Item -Path $file.FullName -Destination $destination
    Write-Host "Copied: $($file.Name)"
}

Write-Host "`nAll files copied successfully!" -ForegroundColor Green
