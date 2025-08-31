# PowerShell script to add mobile-enhancements.js to all club pages
$clubPages = Get-ChildItem -Path "$PSScriptRoot\pages\club-*.html"

foreach ($page in $clubPages) {
    $content = Get-Content -Path $page.FullName -Raw
    
    # Check if the script is already included
    if ($content -notmatch '<script src="../js/mobile-enhancements.js"') {
        # Add the script before the closing head tag
        $updatedContent = $content -replace '(</head>)', '    <script src="../js/mobile-enhancements.js" defer></script>$1'
        
        # Write the updated content back to the file
        Set-Content -Path $page.FullName -Value $updatedContent
        
        Write-Host "Updated $($page.Name)"
    } else {
        Write-Host "$($page.Name) already has the script"
    }
}

Write-Host "Script addition complete!"