# PowerShell script to add responsive.css to all HTML files
# This script looks for dark-mode.css and adds responsive.css after it

$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)"
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if responsive.css is already added
    if ($content -match '<link rel="stylesheet" href="responsive.css"') {
        Write-Host "  - responsive.css already exists, skipping"
        continue
    }
    
    # Check if dark-mode.css exists to insert after it
    if ($content -match '<link[^>]*href="dark-mode\.css"[^>]*>') {
        Write-Host "  - Found dark-mode.css, adding responsive.css after it"
        $content = $content -replace '(<link[^>]*href="dark-mode\.css"[^>]*>)', '$1
  <link rel="stylesheet" href="responsive.css" data-critical="true">'
    }
    # If no dark-mode.css but has some stylesheet, insert after the last stylesheet
    elseif ($content -match '<link[^>]*stylesheet[^>]*>') {
        Write-Host "  - No dark-mode.css found, adding after last stylesheet"
        $lastStylesheet = [regex]::Matches($content, '<link[^>]*stylesheet[^>]*>')[-1].Value
        $content = $content -replace [regex]::Escape($lastStylesheet), "$lastStylesheet
  <link rel=""stylesheet"" href=""responsive.css"" data-critical=""true"">"
    }
    # If no stylesheets at all, add before </head>
    else {
        Write-Host "  - No stylesheets found, adding before </head>"
        $content = $content -replace '</head>', '  <link rel="stylesheet" href="responsive.css" data-critical="true">
</head>'
    }
    
    # Write the modified content back to the file
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "  - Updated successfully"
}

Write-Host "Script completed. All HTML files have been processed." 