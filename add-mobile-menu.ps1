# PowerShell script to add mobile menu toggle to all HTML files
# This script adds a mobile menu toggle button to the navigation if missing

$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)"
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if mobile menu toggle or btn already exists
    if ($content -match '<div class="mobile-menu-toggle">' -or $content -match '<a [^>]*class="mobile-menu-btn"') {
        Write-Host "  - Mobile menu toggle already exists, skipping"
        continue
    }
    
    # Look for the actions div to add the mobile menu toggle after it
    if ($content -match '<div class="actions">.*?</div>') {
        Write-Host "  - Found actions div, adding mobile menu toggle after it"
        $matches = [regex]::Match($content, '<div class="actions">.*?</div>')
        $actionsDiv = $matches.Value
        
        # Create the replacement with the mobile menu toggle
        $replacement = $actionsDiv + '
            <div class="mobile-menu-toggle">
                <i class="fas fa-bars"></i>
            </div>'
        
        # Replace the actions div with our new content
        $content = $content -replace [regex]::Escape($actionsDiv), $replacement
        
        # Write the modified content back to the file
        Set-Content -Path $file.FullName -Value $content
        
        Write-Host "  - Updated successfully"
    }
    else {
        Write-Host "  - No actions div found, skipping"
    }
}

Write-Host "Script completed. All HTML files have been processed." 