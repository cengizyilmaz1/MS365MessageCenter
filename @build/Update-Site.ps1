# Get the latest M365 Message Center items and update the site

param($GraphSecret)
function Connect-MicrosoftGraph(){
    $m365Config = Get-Content ./@build/config-m365.json | ConvertFrom-Json

    $secret = $GraphSecret
    if([string]::IsNullOrEmpty($GraphSecret)){ # If we are running in Github get the secret from the parameter
        Write-Host "-GraphSecret not supplied"
        $secret = Get-Content ./@build/secrets-m365.json | ConvertFrom-Json
    }

    [securestring]$secSecret = ConvertTo-SecureString $secret -AsPlainText -Force
    [pscredential]$cred = New-Object System.Management.Automation.PSCredential ($m365Config.clientId, $secSecret)
    Write-Host "Connecting to Microsoft Graph"
    Connect-MgGraph -TenantId $m365Config.tenantId -Credential $cred -NoWelcome
}

function Get-M365MessageCenterItems() {
    Write-Host "Getting Message Center items"
    $mc = Get-MgServiceAnnouncementMessage -Top 999 -Sort "LastModifiedDateTime desc" -All
    return $mc
}

function Backup-ExistingMessages() {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $backupPath = "$dataPath/backups"
    
    if(!(Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath
    }
    
    if(Test-Path "$dataPath/messages.json") {
        Copy-Item "$dataPath/messages.json" "$backupPath/messages_$timestamp.json"
        Write-Host "Backed up existing messages to $backupPath/messages_$timestamp.json"
    }
}

function Merge-Messages($newMessages, $existingMessages) {
    $merged = @()
    $existingIds = @{}
    
    # Create lookup of existing messages
    foreach($msg in $existingMessages) {
        $existingIds[$msg.Id] = $msg
    }
    
    # Add new messages, updating existing ones if needed
    foreach($msg in $newMessages) {
        if($existingIds.ContainsKey($msg.Id)) {
            # Keep the newer version based on LastModifiedDateTime
            $existingDate = [DateTime]::Parse($existingIds[$msg.Id].LastModifiedDateTime)
            $newDate = [DateTime]::Parse($msg.LastModifiedDateTime)
            
            if($newDate -gt $existingDate) {
                $merged += $msg
                Write-Host "Updated existing message: $($msg.Id)"
            } else {
                $merged += $existingIds[$msg.Id]
            }
        } else {
            $merged += $msg
            Write-Host "Added new message: $($msg.Id)"
        }
    }
    
    # Add any existing messages not in new set
    foreach($msg in $existingMessages) {
        if(!($newMessages | Where-Object { $_.Id -eq $msg.Id })) {
            $merged += $msg
        }
    }
    
    return $merged | Sort-Object { [DateTime]::Parse($_.LastModifiedDateTime) } -Descending
}

$dataPath = "./@data"

# Backup existing messages before any changes
Backup-ExistingMessages

# Get existing messages
$existingMessages = @()
if(Test-Path "$dataPath/messages.json") {
    $existingMessages = Get-Content "$dataPath/messages.json" | ConvertFrom-Json
}

# Connect and get new messages
Connect-MicrosoftGraph
$newMessages = Get-M365MessageCenterItems

# Merge messages, ensuring no data loss
$mergedMessages = Merge-Messages $newMessages $existingMessages

# Save merged messages
$mergedMessages | ConvertTo-Json -Depth 100 | Set-Content "$dataPath/messages.json"

# Archive individual messages
foreach($msg in $mergedMessages) {
    $archivePath = "$dataPath/archive"
    if(!(Test-Path $archivePath)) {
        New-Item -ItemType Directory -Path $archivePath
    }
    
    $msgFile = "$archivePath/MC$($msg.Id).json"
    $msg | ConvertTo-Json -Depth 100 | Set-Content $msgFile
}

Write-Host "Update complete. Total messages: $($mergedMessages.Count)"
