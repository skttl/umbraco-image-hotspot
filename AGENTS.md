# AGENTS.md — umbraco-image-hotspot

## Project overview

**Umbraco.Community.ImageHotspot** is a community Umbraco package (v15+) that provides a property editor allowing content editors to place a single hotspot on an image. It replaces the legacy `Vokseverk.ImageHotspot` package (Umbraco 7–13).

- NuGet package ID: `Umbraco.Community.ImageHotspot`
- Targets: `net10.0`
- GitHub: https://github.com/skttl/umbraco-image-hotspot

---

## Repository layout

```
src/
  ImageHotspot/                    # NuGet package project (Razor SDK)
    Client/                        # TypeScript/Vite/Lit backoffice extension
      src/
        bundle.manifests.ts        # Entry point – collates all manifests
        editors/
          manifest.ts              # Property editor UI manifest
          imagehotspot.element.ts  # Main Lit element (<image-hotspot>)
        localization/              # Localisation manifests + JSON files
        types/
          imagehotspotvalue.ts     # TypeScript type for the value
      vite.config.ts
      package.json
      tsconfig.json
    Models/
      ImageHotspotValue.cs         # C# model returned by the property converter
    wwwroot/App_Plugins/ImageHotspot/  # Vite build output (do not edit manually)
    ImageHotspot.csproj
    ImageHotspot.sln
    ImageHotspotComposer.cs
  ImageHotspot.TestSite/           # Local Umbraco test site for manual testing
    appsettings.json               # Unattended install credentials (see below)
.github/
  README.md                        # Public-facing documentation
  CONTRIBUTING.md
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | C# / ASP.NET Core / Umbraco CMS (v15+, net10.0) |
| Frontend | TypeScript, Lit, Vite, `@umbraco-cms/backoffice` (v17+) |
| Build | `dotnet build` triggers `npm i` + `npm run build` automatically via MSBuild targets |

---

## Development setup

### Prerequisites

- .NET 10 SDK
- Node.js (LTS) + npm

### Running the test site

```pwsh
# From repo root
dotnet run --project src/ImageHotspot.TestSite/ImageHotspot.TestSite.csproj
```

The test site uses an **unattended install**:
- URL: configured in `launchSettings.json` (typically `https://localhost:44391`)
- Login: `admin@example.com` / `1234567890`

### Building the client only (watch mode)

```pwsh
cd src/ImageHotspot/Client
npm install
npm run dev      # Vite watch build → ../wwwroot/App_Plugins/ImageHotspot/
```

### Type-checking the client

```pwsh
cd src/ImageHotspot/Client
npm run check    # tsc --noEmit
```

---

## Key source files

| File | Purpose |
|---|---|
| `src/ImageHotspot/Client/src/editors/imagehotspot.element.ts` | The custom element `<image-hotspot>`. Handles image resolution (recursive alias lookup across dataset contexts and document workspace context), hotspot click/drag interaction, theme application, and debug output when no image is found. |
| `src/ImageHotspot/Client/src/editors/manifest.ts` | Registers the `propertyEditorUi` manifest with settings: `imageSrc` (alias), `width` (px), `theme` (Red/Green/Blue/Orange). |
| `src/ImageHotspot/Client/src/localization/manifests.ts` | Registers localisation files. |
| `src/ImageHotspot/Models/ImageHotspotValue.cs` | C# value object. `ToString()` returns a CSS `left: X%; top: Y%;` string for use in style attributes. |

---

## Stored value format (JSON)

```json
{
  "image": "/media/1492/photo.jpg",
  "left": 223,
  "top": 307,
  "percentX": 55.75,
  "percentY": 74.878,
  "width": 400,
  "height": 410
}
```

The value stores both absolute pixel coordinates (`left`, `top`) and percentage coordinates (`percentX`, `percentY`), plus the image path and dimensions at save time.

---

## Property editor configuration

| Setting alias | Default | Description |
|---|---|---|
| `imageSrc` | `"image"` | Alias of the media picker property (resolved recursively up the document tree) |
| `width` | `400` | Display width of the image in pixels |
| `theme` | `"Red"` | Hotspot colour — `Red`, `Green`, `Blue`, or `Orange` |

---

## Image resolution logic

The element tries to find the media picker value in this order:

1. `UMB_PROPERTY_DATASET_CONTEXT` (current dataset — e.g. Block editor item)
2. Parent `UMB_PROPERTY_DATASET_CONTEXT` (with `passContextAliasMatches`)
3. `UMB_DOCUMENT_WORKSPACE_CONTEXT` — direct property value on the open document
4. Recursive walk up the document tree via `UmbDocumentItemRepository` / `UmbDocumentDetailRepository`

---

## Coding conventions

- TypeScript frontend uses `@umbraco-cms/backoffice` imports exclusively; no runtime Umbraco globals.
- Private class members use the `#` prefix (`#loadImage`, `#onClick`, etc.).
- The `_UNOBSERVED` symbol is used as a sentinel to distinguish "no observed value yet" from `null`.
- Vite `rollupOptions.external` excludes all `@umbraco/*` packages (they are provided at runtime by the backoffice).
- Localisation keys are prefixed `imageHotspot_`.

---

## Build artefacts

- Vite writes the compiled JS to `src/ImageHotspot/wwwroot/App_Plugins/ImageHotspot/`.
- The `.csproj` MSBuild targets (`RestoreClient`, `BuildClient`) run `npm i` and `npm run build` before packaging, keyed on `package.json` / `package-lock.json` changes.
- NuGet output: `Umbraco.Community.ImageHotspot`.

---

## Contributing

See `.github/CONTRIBUTING.md`. Use the test site (`ImageHotspot.TestSite`) for manual verification. The test site is pre-configured for unattended install so it is ready to use after the first `dotnet run`.
