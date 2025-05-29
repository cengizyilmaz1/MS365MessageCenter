# WordPress REST API Post Scraper
# This script fetches all posts from WordPress site except MessageCenter category
# Author: Cengiz YILMAZ
# Version: 1.2.1

# Basic settings
$baseUrl = "https://cengizyilmaz.net"
$excludeCategory = "MessageCenter"
$perPage = 100
$page = 1
$allPosts = @()

# Create data directory if it doesn't exist
$dataDir = "public/data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
}

# Find category ID
$categories = Invoke-RestMethod -Uri "$baseUrl/wp-json/wp/v2/categories?per_page=100"
$excludedCatId = ($categories | Where-Object { $_.name -eq $excludeCategory }).id

if (-not $excludedCatId) {
    Write-Host "Excluded category not found: $excludeCategory"
    exit
}

Write-Host "Found excluded category ID: $excludedCatId"
Write-Host "Starting to fetch posts..."

# Fetch posts with pagination
do {
    $apiUrl = "$baseUrl/wp-json/wp/v2/posts?per_page=$perPage&page=$page&categories_exclude=$excludedCatId"
    try {
        $response = Invoke-RestMethod -Uri $apiUrl
        if ($response.Count -gt 0) {
            $allPosts += $response
            Write-Host "Retrieved $($response.Count) posts from page $page"
            $page++
        } else {
            Write-Host "No more posts found."
            break
        }
    } catch {
        Write-Host "API error or last page reached."
        break
    }
} while ($true)

# Format results
Write-Host "`nFormatting $($allPosts.Count) posts..."
$results = $allPosts | ForEach-Object {
    [PSCustomObject]@{
        Title = $_.title.rendered
        URL   = $_.link
        Date  = $_.date
    }
}

# Export to CSV with UTF-8 BOM
$date = Get-Date -Format "yyyyMMdd"
$outputCsv = Join-Path $dataDir "CengizYILMAZBlogPost_$date.csv"
$csvContent = $results | ConvertTo-Csv -NoTypeInformation
[System.IO.File]::WriteAllLines($outputCsv, $csvContent, [System.Text.Encoding]::UTF8)

Write-Host "`n✅ Completed successfully"
Write-Host "Total posts retrieved: $($results.Count)"
Write-Host "File saved to: $outputCsv"

# Display sample results
Write-Host "`nSample of first 5 posts:"
$results | Select-Object -First 5 | Format-Table -AutoSize 