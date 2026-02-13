$SERVER = "https://cinematographic-interligamentous-jordynn.ngrok-free.dev"
$HEADERS = @{"ngrok-skip-browser-warning" = "true"}

Clear-Host

Write-Host "========================================"
Write-Host "     CHAT CLIENT - Connected!          "
Write-Host "========================================"
Write-Host ""

$USER = Read-Host "Enter your username"

if ([string]::IsNullOrEmpty($USER)) {
    Write-Host "Username cannot be empty!"
    exit 1
}

Write-Host ""
Write-Host "Welcome, $USER!"
Write-Host "Commands:"
Write-Host "  - Type a message and press Enter to send"
Write-Host "  - Type 'refresh' or 'r' to reload messages"
Write-Host "  - Type 'quit' or 'q' to exit"
Write-Host ""

function Refresh-Chats {
    Clear-Host
    Write-Host "========================================"
    Write-Host "     CHAT MESSAGES                     "
    Write-Host "========================================"
    Write-Host ""
    try {
        $response = Invoke-WebRequest -Uri "$SERVER/chats" -Headers $HEADERS -UseBasicParsing
        Write-Host $response.Content
    } catch {
        Write-Host "Error fetching messages: $_"
    }
    Write-Host ""
    Write-Host "========================================"
}

Refresh-Chats

while ($true) {
    $input = Read-Host "$USER>"

    if ($input -eq "q" -or $input -eq "quit") {
        Write-Host "Goodbye!"
        break
    }
    elseif ($input -eq "r" -or $input -eq "refresh") {
        Refresh-Chats
    }
    elseif (-not [string]::IsNullOrEmpty($input)) {
        $msgEncoded = [uri]::EscapeDataString($input)
        try {
            Invoke-WebRequest -Uri "$SERVER/post?user=$USER&message=$msgEncoded" -Headers $HEADERS -UseBasicParsing | Out-Null
        } catch {
            Write-Host "Error sending message: $_"
        }
        Start-Sleep -Milliseconds 500
        Refresh-Chats
    }
}
