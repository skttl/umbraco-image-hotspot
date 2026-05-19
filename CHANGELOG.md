# Changelog

All notable changes to Umbraco.Community.ImageHotspot are documented in this file.

## [17.0.3] - 2026-05-19

### Changed

- Updated documentation to reflect simplified `ImageHotspotValue` model
- Added package readme (`docs/README_nuget.md`) referenced from the `.csproj`

### Fixed

- Fixed null handling when observing workspace property value (`_UNOBSERVED` sentinel now correctly propagated)
- Fixed stored position hint displaying rounded integer percentages instead of decimal values
- Removed premature early-exit guard that blocked image loading before contexts were resolved
- Deprecated unused `ImageHotspotValue` properties (`Left`, `Top`, `Width`, `Height`, `Image`) with `[Obsolete]` attribute

## [17.0.2] - 2026-05-19

### Changed

- GitHub Actions release workflows now build the client before packaging

## [17.0.1] - 2026-05-19

### Changed

- Removed `contributes` entry from `umbraco-marketplace.json`

## [17.0.0] - 2026-05-18

### Added

- Localization support with 29 language files (ar, bs, cs-cz, cy-gb, da-dk, de-ch, de-de, en, en-us, es-es, fr-ch, fr-fr, he-il, hr-hr, it-ch, it-it, ja-jp, ko-kr, nb-no, nl-nl, pl-pl, pt-br, ro-ro, ru-ru, sv-se, tr-tr, uk-ua, zh-cn, zh-tw)
- Localization manifests registered in the bundle entry point
- Image resolution via `UMB_PROPERTY_DATASET_CONTEXT` (supports block editor items and nested contexts)
- Recursive parent dataset context lookup with `passContextAliasMatches`
- Debug info output when no image is found
- `_UNOBSERVED` sentinel to distinguish "not yet observed" from `null`
- `dev` and `check` npm scripts for watch mode and type-checking

### Changed

- Upgraded target framework from `net9.0` to `net10.0`
- Upgraded `@umbraco-cms/backoffice` dependency to `^17.0.0`
- Upgraded `vite` to `^6.3.5` and `typescript` to `^5.8.3`
- Upgraded test site from Umbraco CMS 15.2.2 to 17.0.0 and uSync 15.1.3 to 17.3.2
- Rewrote image resolution logic with generation-based cancellation (`#loadGeneration`)
- Simplified tsconfig to target ES2022 with Bundler module resolution
- Refactored build scripts to use `vite build --config vite.config.js` directly (removed `tsc` pre-step)
- Updated marketplace title from "Image Hotspot Editor (v15+)" to "Image Hotspot Editor"
- Updated package title from "ImageHotspot for Umbraco v15+" to "Umbraco Image Hotspot"

### Removed

- Removed unused dependencies: `chalk`, `cross-env`, `node-fetch`
- Removed legacy chunked build output (`imagehotspot.element-vfS-1zos.js`)

## [0.3.0] - 2025-08-08

### Fixed

- Added flexible int converter for backwards compatibility when deserializing values

## [0.2.0] - 2025-08-08

### Fixed

- Improved backwards compatibility with `Vokseverk.ImageHotspot` when deserializing JSON values

## [0.1.0] - 2025-08-08

### Fixed

- Fixed value converter
- Fixed getting of image URL
- Solution cleanup

### Changed

- Updated test site

## [0.1.0-alpha001] - 2025-05-13

### Added

- Initial release of the Umbraco 15+ Image Hotspot property editor
- Property editor UI with click-to-place hotspot on images
- Configurable image source alias, display width, and theme colour
- Recursive image resolution up the document tree
- C# value model with percentage and pixel coordinates
- NuGet packaging with embedded backoffice extension
- GitHub Actions release workflows
