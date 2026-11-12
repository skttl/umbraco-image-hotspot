$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
Push-Location $repo
$server = $null
try {
    $state = Join-Path $repo ".cache/e2e/$([guid]::NewGuid().ToString('N'))"
    New-Item -ItemType Directory -Force $state | Out-Null
    $env:UMBRACO_URL = 'https://localhost:5218'
    $env:UMBRACO_USER_LOGIN = 'admin@example.com'
    $env:UMBRACO_USER_PASSWORD = [guid]::NewGuid().ToString('N') + '!Aa2'
    $env:Umbraco__CMS__Unattended__InstallUnattended = 'true'
    $env:Umbraco__CMS__Unattended__UpgradeUnattended = 'true'
    $env:Umbraco__CMS__Unattended__UnattendedUserName = 'Demo Administrator'
    $env:Umbraco__CMS__Unattended__UnattendedUserEmail = $env:UMBRACO_USER_LOGIN
    $env:Umbraco__CMS__Unattended__UnattendedUserPassword = $env:UMBRACO_USER_PASSWORD
    $env:Umbraco__CMS__Imaging__HMACSecretKey = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
    $env:ConnectionStrings__umbracoDbDSN = "Data Source=$state/Umbraco.sqlite.db;Foreign Keys=True;Pooling=True"
    $env:ConnectionStrings__umbracoDbDSN_ProviderName = 'Microsoft.Data.Sqlite'
    $env:ASPNETCORE_ENVIRONMENT = 'Development'
    $env:Umbraco__CMS__ModelsBuilder__ModelsMode = 'Nothing'
    $env:uSync__Settings__ImportAtStartup = 'None'
    $env:uSync__Settings__ExportAtStartup = 'None'
    $env:Serilog__MinimumLevel__Default = 'Warning'
    $start = [Diagnostics.ProcessStartInfo]::new('dotnet')
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    foreach ($argument in @('run', '--project', 'src/ImageHotspot.TestSite', '-c', 'Release', '--no-build', '--no-launch-profile', '--urls', $env:UMBRACO_URL)) {
        $start.ArgumentList.Add($argument)
    }
    $server = [Diagnostics.Process]::Start($start)
    $ready = $false
    for ($attempt = 0; $attempt -lt 90; $attempt++) {
        if ($server.HasExited) { throw 'Demo process exited before startup' }
        try {
            Invoke-WebRequest "$env:UMBRACO_URL/umbraco/" -TimeoutSec 2 -SkipCertificateCheck | Out-Null
            $ready = $true
            break
        } catch { Start-Sleep -Seconds 1 }
    }
    if (-not $ready) { throw 'Demo did not become ready within 90 attempts' }
    & npm --prefix src/ImageHotspot/Client run test:e2e
    if ($LASTEXITCODE -ne 0) { throw 'Playwright tests failed' }
} finally {
    if ($server -and -not $server.HasExited) { $server.Kill($true); $server.WaitForExit() }
    if ($server) { $server.Dispose() }
    Pop-Location
}
