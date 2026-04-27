# Clean and prepare project for manual GitHub upload
$source = "C:\Users\ahmed\Desktop\new shit\student-assistant"
$dest = "C:\Users\ahmed\Desktop\new shit\student-assistant-clean"

Write-Host "[1/6] Cleaning up..."
if (Test-Path $dest) {
    Remove-Item -Recurse -Force $dest
}
New-Item -ItemType Directory -Path $dest | Out-Null

Write-Host "[2/6] Copying source code..."
Copy-Item -Recurse -Path "$source\src" -Destination "$dest\src"

Write-Host "[3/6] Copying configuration files..."
$configFiles = @(
    "package.json",
    "next.config.mjs",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.mjs",
    ".eslintrc.json",
    ".gitignore",
    "next-env.d.ts",
    ".env.example"
)
foreach ($file in $configFiles) {
    $sourcePath = Join-Path $source $file
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $dest
        Write-Host "  - $file"
    }
}

Write-Host "[4/6] Copying documentation..."
Copy-Item -Path "$source\README.md" -Destination $dest
Copy-Item -Path "$source\LICENSE" -Destination $dest

Write-Host "[5/6] Copying GitHub workflows..."
if (Test-Path "$source\.github") {
    Copy-Item -Recurse -Path "$source\.github" -Destination $dest
}

Write-Host "[6/6] Done!`n"
Write-Host "✅ Clean folder created at:"
Write-Host "   $dest"
Write-Host ""
Write-Host "📁 Files ready for manual upload:"
Get-ChildItem $dest | Format-Wide -Property Name -Column 3
Write-Host ""
Write-Host "🚀 Next step: Go to https://github.com/alshomok/alshomok-bot/upload"
Write-Host "   and drag all these files to upload them manually"
