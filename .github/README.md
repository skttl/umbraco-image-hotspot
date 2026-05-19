# Image Hotspot 

[![Downloads](https://img.shields.io/nuget/dt/Umbraco.Community.ImageHotspot?color=cc9900)](https://www.nuget.org/packages/Umbraco.Community.ImageHotspot/)
[![NuGet](https://img.shields.io/nuget/vpre/Umbraco.Community.ImageHotspot?color=0273B3)](https://www.nuget.org/packages/Umbraco.Community.ImageHotspot)
[![GitHub license](https://img.shields.io/github/license/skttl/umbraco-image-hotspot?color=8AB803)](../LICENSE)

An Umbraco property editor that allows an editor to place a hotspot on an image.

This property editor provides similar functionality to what was previously available with the [Vokseverk.ImageHotspot](https://marketplace.umbraco.com/package/vokseverk.imagehotspot) data type in Umbraco, versions 7-13.

It's a property editor that displays an image and lets the editor place a hotspot on it.

<img alt="Screenshot of Image Hotspot, a property editor for Umbraco" src="https://github.com/skttl/umbraco-image-hotspot/blob/develop/docs/screenshots/editor.png">

## Installation

Add the package to an existing Umbraco website (v15+) from nuget:

`dotnet add package Umbraco.Community.ImageHotspot`

> Note: If you are upgrading from v13 and below, using [Vokseverk.ImageHotspot](https://marketplace.umbraco.com/package/vokseverk.imagehotspot), you need to update your Data Type configurations to use this editor.

## Backoffice setup

### 1. Create a Data Type

1. Go to **Settings → Data Types** and create a new Data Type.
2. Select **Image Hotspot** as the property editor.
3. Configure the settings:
   - **Image** — the alias of the media picker property that holds the image (default: `image`). The editor looks this up recursively, so it works inside Block List and Block Grid elements.
   - **Width** — display width of the image in the editor in pixels (default: `400`).
   - **Color** — hotspot indicator colour: `Red`, `Green`, `Blue`, or `Orange` (default: `Red`).

<img alt="Screenshot of Image Hotspot configuration" src="https://github.com/skttl/umbraco-image-hotspot/blob/develop/docs/screenshots/configuration.png">

### 2. Add properties to a Document Type

Add a **Media Picker** property (single image) with the alias you configured above (e.g. `image`), then add an **Image Hotspot** property using the Data Type you just created.

When a content editor opens that document, they will see the referenced image and can click (or drag) to place the hotspot.

## Using the value in code

The included `ImageHotspotPropertyConverter` runs automatically and converts the stored JSON into a strongly-typed `ImageHotspotValue` object via ModelsBuilder.

### ImageHotspotValue properties

```csharp
public class ImageHotspotValue
{
    public decimal PercentX { get; set; }  // X as a percentage (0–100)
    public decimal PercentY { get; set; }  // Y as a percentage (0–100)
}
```

`ToString()` returns a ready-made CSS snippet (`left: X%; top: Y%;`) for use directly in a `style` attribute.

### Razor example

Access the value through your ModelsBuilder model and render the image with the hotspot marker overlaid:

```razor
@{
    var hotspot = Model.Hotspot; // ImageHotspotValue — property alias "hotspot"
    var image = Model.Image;     // IPublishedContent — property alias "image"
}

@if (hotspot != null && image != null)
{
    <div style="position:relative; display:inline-flex;">
        <img src="@image.Url()" alt="" />
        <span style="
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: red;
            transform: translate(-50%, -50%);
            @hotspot
        "></span>
    </div>
}
```

The `@hotspot` interpolation expands to `left: 55.75%; top: 74.878%;`.

### Accessing coordinates directly

If you need the values for another purpose (e.g. a focal-point crop API):

```csharp
var hotspot = Model.Value<ImageHotspotValue>("hotspot");
if (hotspot != null)
{
    // Use percentage coordinates (0–100 range)
    double x = (double)hotspot.PercentX; // e.g. 55.75
    double y = (double)hotspot.PercentY; // e.g. 74.88
}
```

### Raw JSON

The stored JSON (before conversion) looks like this:

```json
{
    "percentX": 55.75,
    "percentY": 74.878048780487804878
}
```

## Contributing

Contributions to this package are most welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md).

## Acknowledgments

- [Chriztian Steinmeier](https://github.com/greystate) for [Vokseverk.ImageHotspot](https://marketplace.umbraco.com/package/vokseverk.imagehotspot) which this editor is based on
- [Lotte Pitcher](https://github.com/LottePitcher) for the [opinionated package starter template for Umbraco](https://github.com/LottePitcher/opinionated-package-starter)
- [creative outlet](https://thenounproject.com/creator/creativeoutlet/) for the [icon](https://thenounproject.com/icon/cross-hair-1641709/)