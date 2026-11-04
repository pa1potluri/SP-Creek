param([int]$Port = 8811, [int]$CheckIntervalSeconds = 15, [switch]$Open)

$ErrorActionPreference = 'Stop'
$previewUrl = "http://localhost:$Port/"
$logFolder = Join-Path $env:TEMP 'SPCreekPreview'
New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
function Test-PreviewPort {
    $client = New-Object System.Net.Sockets.TcpClient
    try { return $client.ConnectAsync('127.0.0.1', $Port).Wait(1000) -and $client.Connected }
    catch { return $false }
    finally { $client.Dispose() }
}
$guard = New-Object System.Threading.Mutex($false, "Local\SPCreekPreview$Port")
$ownsGuard = $false
try {
    try { $ownsGuard = $guard.WaitOne(0) }
    catch [System.Threading.AbandonedMutexException] { $ownsGuard = $true }
    if (-not $ownsGuard) {
        if ($Open) { Start-Process $previewUrl }
        exit
    }
    $candidates = @(
        (Join-Path $env:LOCALAPPDATA 'Python\pythoncore-3.14-64\python.exe'),
        (Join-Path $PSScriptRoot '..\envs\hero\Scripts\python.exe')
    )
    $python = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (-not $python) { $python = (Get-Command python.exe).Source }
    $openPending = [bool]$Open
    while ($true) {
        try {
            if (-not (Test-PreviewPort)) {
                Start-Process -FilePath $python -ArgumentList @('-u', ('"{0}"' -f (Join-Path $PSScriptRoot 'serve_world.py')), "$Port") -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logFolder "server-$Port.out.log") -RedirectStandardError (Join-Path $logFolder "server-$Port.err.log") | Out-Null
            }
            if ($openPending -and (Test-PreviewPort)) {
                Start-Process $previewUrl
                $openPending = $false
            }
        } catch {
            Add-Content -LiteralPath (Join-Path $logFolder "watchdog-$Port.log") -Value "$(Get-Date -Format s) $($_.Exception.Message)"
        }
        Start-Sleep -Seconds ([Math]::Max(1, $CheckIntervalSeconds))
    }
} finally {
    if ($ownsGuard) { $guard.ReleaseMutex() }
    $guard.Dispose()
}
