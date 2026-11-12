param(
    [Parameter(Mandatory)][string]$PackagePath,
    [string]$Version = '19.0.0-rc1'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$package = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $PackagePath))
try {
    $names = @($package.Entries.FullName)
    $nuspecs = @($package.Entries | Where-Object { $_.FullName -match '^[^/]+\.nuspec$' })
    if ($nuspecs.Count -ne 1) { throw 'Expected one nuspec' }
    function Read-Entry([string]$Name) {
        $entry = $package.GetEntry($Name)
        if (-not $entry) { throw "Missing package entry: $Name" }
        $reader = [IO.StreamReader]::new($entry.Open())
        try { $reader.ReadToEnd() } finally { $reader.Dispose() }
    }
    [xml]$spec = Read-Entry $nuspecs[0].FullName
    $metadata = $spec.package.metadata
    if ($metadata.id -ne 'Umbraco.Community.ImageHotspot' -or $metadata.version -ne $Version) { throw 'Wrong package ID/version' }
    $dependencies = @($metadata.dependencies.group.dependency)
    if ($dependencies.Count -ne 1 -or $dependencies[0].id -ne 'Umbraco.Cms.Core' -or ($dependencies[0].version -replace ' ', '') -ne '[19.0.0-rc1,20.0.0)') { throw 'Wrong Umbraco dependencies' }
    foreach ($required in @('lib/net11.0/ImageHotspot.dll', 'README.md', 'icon.png', 'staticwebassets/umbraco-package.json', 'staticwebassets/entrypoint.js')) {
        if ($required -notin $names) { throw "Missing package entry: $required" }
    }
    if ($metadata.readme -ne 'README.md' -or $metadata.icon -ne 'icon.png') { throw 'Wrong README/icon metadata' }
    foreach ($name in $names) {
        if ($name -match '(?i)(^|/)(Client|node_modules|demo|tests|media|Logs)/|appsettings|\.env|\.(db|sqlite|pfx|key|ts|map)$') { throw "Unwanted content: $name" }
    }
    $manifest = Read-Entry 'staticwebassets/umbraco-package.json' | ConvertFrom-Json
    if ($manifest.version -ne $Version -or $manifest.extensions.Count -ne 1 -or $manifest.extensions[0].js -ne '/App_Plugins/ImageHotspot/entrypoint.js') { throw 'Wrong manifest version/entrypoint' }
    foreach ($entry in $package.Entries | Where-Object { $_.FullName -like 'staticwebassets/*.js' }) {
        $javascript = Read-Entry $entry.FullName
        foreach ($match in [regex]::Matches($javascript, '(?:from\s*|import\s*\()\s*["''](\./[^"'']+\.js)["'']')) {
            $chunk = 'staticwebassets/' + $match.Groups[1].Value.Substring(2)
            if ($chunk -notin $names) { throw "Missing dynamic chunk: $chunk" }
        }
    }
    Write-Host "Verified $($metadata.id) $Version (DLL, dependencies, manifest, JavaScript, README, icon and excluded content)."
} finally { $package.Dispose() }
