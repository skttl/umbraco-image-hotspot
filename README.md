# Umbraco Image Hotspot

A property editor for placing a single hotspot on an image, with percentage coordinates and a strongly typed C# value for Razor templates.

[Installation, configuration and usage](docs/nuget-readme.md) · [NuGet](https://www.nuget.org/packages/Umbraco.Community.ImageHotspot) · [Issues](https://github.com/skttl/umbraco-image-hotspot/issues)

## Compatibility and branches

| Branch | Package major | Umbraco | .NET |
| --- | --- | --- | --- |
| `main` | 19 (currently `19.0.0-rc1`) | `19.0.0-rc1` to below 20 | 11 |
| `v18/main` | 18 | 18 | 10 |
| `v17/main` | 17 | 17 | 10 |

Each major builds independently. The v19 dependency floor deliberately includes the release candidate, which is the version used for verification. Recheck against the final CMS before releasing a stable package. See [Umbraco's v19 upgrade notes](https://docs.umbraco.com/umbraco-cms/19.latest/get-started/upgrading-and-migrating/version-specific).

## Repository

```text
Umbraco.Community.ImageHotspot.slnx
src/Umbraco.Community.ImageHotspot/           # Razor package and Client/
tests/Umbraco.Community.ImageHotspot.Tests/   # C# unit tests
demo/Umbraco.Community.ImageHotspot.TestSite/ # Official-template SQLite demo
docs/nuget-readme.md                         # User guide packed as README.md
scripts/                                    # Package, release and E2E checks
```

The C# assembly and namespaces remain `ImageHotspot`; existing editor aliases and stored hotspot JSON are preserved. The former custom manifest reader/composer is replaced by a standard static package manifest. Extensions should not depend on those registration classes.

## Prerequisites

- .NET SDK 11.0.100 or a compatible patch, as pinned by `global.json`.
- Node.js 24 LTS (at least 24.13) and npm 11 or later.
- PowerShell 7 for verification scripts.

A project-local SDK in `.dotnet/` takes priority over the system installation. Install it with Microsoft's [dotnet-install script](https://learn.microsoft.com/dotnet/core/tools/dotnet-install-script) using `-Version 11.0.100 -InstallDir .dotnet -NoPath` on Windows, or `--version 11.0.100 --install-dir .dotnet` on Linux/macOS.

## Build and run

```sh
npm --prefix src/Umbraco.Community.ImageHotspot/Client ci
dotnet build Umbraco.Community.ImageHotspot.slnx -c Release
dotnet run --project demo/Umbraco.Community.ImageHotspot.TestSite --no-launch-profile --urls http://localhost:5219
```

Complete Umbraco's local installer on first startup. Keep passwords in user secrets or environment variables, never in tracked configuration. The demo references the package project and uses SQLite. Local databases, media, logs, test credentials and generated assets are ignored.

The demo was generated with **Umbraco.Templates 19.0.0-rc1**, without a starter kit:

```sh
dotnet new install Umbraco.Templates@19.0.0-rc1
dotnet new umbraco -n Umbraco.Community.ImageHotspot.TestSite -o demo/Umbraco.Community.ImageHotspot.TestSite --package-management PerProject --development-database-type SQLite --no-restore --no-update-check
```

The generated startup and runtime settings are retained; the demo adds `IsPackable=false` and a project reference. Do not import the old v17 uSync fixtures into v19: CMS migrations now split several property editors, and old exports can restore obsolete aliases.

## Tests and packaging

```sh
dotnet test tests/Umbraco.Community.ImageHotspot.Tests/Umbraco.Community.ImageHotspot.Tests.csproj -c Release
npm --prefix src/Umbraco.Community.ImageHotspot/Client run check
node --test scripts/release-version.test.mjs
npm --prefix src/Umbraco.Community.ImageHotspot/Client exec -- playwright install chromium
```

With the Release solution built and port 5219 free, run `pwsh -File scripts/test-e2e.ps1`. It starts the demo against a fresh local SQLite database with generated credentials, provisions fixtures through the Management API, runs Playwright and stops its own server. For an already running test site, set `UMBRACO_URL`, `UMBRACO_USER_LOGIN` and `UMBRACO_USER_PASSWORD`, then run `npm --prefix src/Umbraco.Community.ImageHotspot/Client run test:e2e`.

```sh
dotnet pack src/Umbraco.Community.ImageHotspot/Umbraco.Community.ImageHotspot.csproj -c Release -o artifacts
pwsh -File scripts/verify-package.ps1 -PackagePath artifacts/Umbraco.Community.ImageHotspot.19.0.0-rc1.nupkg
```

Only the package is packed. Vite writes to its `wwwroot/`; the Razor static asset base is `App_Plugins/ImageHotspot`. Generated output is rebuilt before packaging. Consumers need neither Node.js nor client sources.

When packaging changes, also install the nupkg in a separate clean template-generated site using Umbraco 19.0.0-rc1, without a project reference, and verify startup, editor registration and `/App_Plugins/ImageHotspot/` assets.

The current v19 E2E suite covers single/multiple media pickers, saved and new child documents, click/drag, persistence and missing images. Block List, Block Grid and Library Element contexts have not been independently verified against this RC. Shared Library content has no unique containing document from which to inherit an image; configure the image on its own dataset.

## Releases

CI builds the solution, runs server, type and E2E checks, packs and inspects the nupkg. Publishing accepts tags such as `v19.0.0-rc1`, `v19.0.0-beta.2` and `v19.0.0`. The whole tag is validated, its major must match the package and CMS dependency, and its commit must be an ancestor of the expected remote version branch. Never reuse a published version.

Before the first publication, configure:

1. GitHub environment **release**, with a `NUGET_USER` secret containing the NuGet account's profile name (not email).
2. A [NuGet trusted publishing policy](https://www.nuget.org/account/trustedpublishing) for owner **skttl**, repository **umbraco-image-hotspot**, workflow **publish.yml**, environment **release** and this package ID.

`NuGet/login@v1` exchanges GitHub OIDC for a short-lived key. The workflow has `contents: read` and `id-token: write`; no permanent NuGet API key is required. External environment/policy configuration must be completed separately; editing this repository does not configure it. See [Microsoft's trusted publishing guide](https://learn.microsoft.com/nuget/nuget-org/trusted-publishing).
