# Image Hotspot Editor

A property editor for **Umbraco v15+** that lets content editors place a single hotspot on an image. The hotspot position is stored as percentage values, and ships with a strongly-typed C# value object that renders a ready-made CSS snippet.

This package provides the same functionality that was previously available via [Vokseverk.ImageHotspot](https://marketplace.umbraco.com/package/vokseverk.imagehotspot) in Umbraco 7–13.

## Installation

```
dotnet add package Umbraco.Community.ImageHotspot
```

> **Upgrading from Vokseverk.ImageHotspot?** Update your Data Type configurations to use the new property editor alias after installing.

## Backoffice setup

### 1. Create a Data Type

1. Go to **Settings → Data Types** and create a new Data Type.
2. Select **Image Hotspot** as the property editor.
3. Configure the settings:
   - **Image** — alias of the Media Picker property that holds the image (default: `image`). Resolved recursively, so it works inside Block List and Block Grid items.
   - **Width** — display width of the image in the editor (default: `400` px).
   - **Color** — hotspot indicator colour: `Red`, `Green`, `Blue`, or `Orange` (default: `Red`).

### 2. Add properties to a Document Type

Add a **Media Picker** property (single image) using the alias configured above, then add an **Image Hotspot** property using the Data Type you created. The editor will show the image and let editors click or drag to place the hotspot.

## Using the value in Razor

The included property value converter produces a strongly-typed `ImageHotspotValue`:

```csharp
public class ImageHotspotValue
{
    public decimal PercentX { get; set; }  // X as a percentage (0–100)
    public decimal PercentY { get; set; }  // Y as a percentage (0–100)
}
```

`ToString()` returns `left: X%; top: Y%;` — paste it directly into a `style` attribute.

### Razor example

```razor
@{
    var hotspot = Model.Hotspot; // property alias "hotspot"
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

## Source & contributing

Source code and issue tracker: [github.com/skttl/umbraco-image-hotspot](https://github.com/skttl/umbraco-image-hotspot)

Contributions are welcome — see the [Contributing Guidelines](https://github.com/skttl/umbraco-image-hotspot/blob/main/.github/CONTRIBUTING.md).
