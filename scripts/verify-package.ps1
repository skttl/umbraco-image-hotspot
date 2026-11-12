param([Parameter(Mandatory)][string]$PackagePath, [string]$Version = '18.0.0')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$package = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $PackagePath))
try {
    $names = @($package.Entries.FullName)
    function Read-Entry([string]$Name) {
        $entry = $package.GetEntry($Name)
        if (-not $entry) { throw "Missing package entry: $Name" }
        $reader = [IO.StreamReader]::new($entry.Open())
        try { $reader.ReadToEnd() } finally { $reader.Dispose() }
    }
    $nuspecs = @($package.Entries | Where-Object { $_.FullName -match '^[^/]+\.nuspec$' })
    if ($nuspecs.Count -ne 1) { throw 'Expected one nuspec' }
    [xml]$spec = Read-Entry $nuspecs[0].FullName
    $metadata = $spec.package.metadata
    if ($metadata.id -ne 'Umbraco.Community.ImageHotspot' -or $metadata.version -ne $Version) { throw 'Wrong package ID/version' }
    $expected = @('Umbraco.Cms.Web.Website', 'Umbraco.Cms.Web.Common', 'Umbraco.Cms.Api.Common', 'Umbraco.Cms.Api.Management')
    $dependencies = @($metadata.dependencies.group.dependency)
    if ($dependencies.Count -ne $expected.Count) { throw 'Wrong Umbraco dependency count' }
    foreach ($dependency in $dependencies) {
        if ($dependency.id -notin $expected -or ($dependency.version -replace ' ', '') -ne '[18.0.0,19.0.0)') { throw 'Wrong Umbraco dependencies' }
    }
    foreach ($required in @('lib/net10.0/ImageHotspot.dll', 'README.md', 'logo.png', 'staticwebassets/App_Plugins/ImageHotspot/image-hotspot.js')) {
        if ($required -notin $names) { throw "Missing package entry: $required" }
    }
    if ($metadata.readme -ne 'README.md' -or $metadata.icon -ne 'logo.png') { throw 'Wrong README/icon metadata' }
    foreach ($name in $names) {
        if ($name -match '(?i)(^|/)(Client|node_modules|demo|tests|media|Logs)/|appsettings|\.env|\.(db|sqlite|pfx|key|ts)$') { throw "Unwanted content: $name" }
    }
    foreach ($entry in $package.Entries | Where-Object { $_.FullName -like 'staticwebassets/*.js' }) {
        $javascript = Read-Entry $entry.FullName
        foreach ($match in [regex]::Matches($javascript, '(?:from\s*|import\s*\()\s*["''](\./[^"'']+\.js)["'']')) {
            $chunk = ($entry.FullName -replace '[^/]+$', '') + $match.Groups[1].Value.Substring(2)
            if ($chunk -notin $names) { throw "Missing dynamic chunk: $chunk" }
        }
    }
    Write-Host "Verified $($metadata.id) $Version (DLL, dependencies, JavaScript, README, icon and excluded content)."
} finally { $package.Dispose() }
