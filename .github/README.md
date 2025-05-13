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

## Configuration

The property editor looks for the **Image** by looking up the alias recursively, so it's possible to use it on a doctype that's used by **Block List** or **Block Grid**.

<img alt="Screenshot of Image Hotspot configuration" src="https://github.com/skttl/umbraco-image-hotspot/blob/develop/docs/screenshots/configuration.png">

## Property Data

The raw JSON data looks like this:

```json
{
	"image": "/media/1492/what-a-nice-picture.jpg",
	"left": 223,
	"top": 307,
	"percentX": 55.75,
	"percentY": 74.878048780487804878,
	"width": 400,
	"height": 410
}
```

The hotspot coordinate is saved both as exact pixel values and as percentage
values, along with the image's path, width & height.

The included **PropertyConverter** enables ModelsBuilder to do its magic and provide you with
an `ImageHotspotValue` object instead of the JSON data:

```csharp
public class ImageHotspotValue {
    public int Left { get; set; }
    public int Top { get; set; }
    public decimal PercentX { get; set; }
    public decimal PercentY { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string? Image { get; set; }
}
```

The `.ToString()` method has been crafted to be used inside a style attribute, to give you the
hotspot's position in one go - something like `left: 10.3%; top: 24.3333%`, e.g.:

```razor
var marker = Model.Hotspot;

<div style="position:relative; display:inline-flex;">
	<img src="@(marker.Image)" width="@(marker.Width)" height="@(marker.Height)">
	<span
		style="
			position:absolute;
			background:#f80c;
			transform:translate(-50%,-50%);
			border-radius:5px;
			width:10px;
			height:10px;
			@(marker)
		"></span>
</div>
```

## Contributing

Contributions to this package are most welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md).

## Acknowledgments

- [Chriztian Steinmeier](https://github.com/greystate) for [Vokseverk.ImageHotspot](https://marketplace.umbraco.com/package/vokseverk.imagehotspot) which this editor is based on
- [Lotte Pitcher](https://github.com/LottePitcher) for the [opinionated package starter template for Umbraco](https://github.com/LottePitcher/opinionated-package-starter)
- [creative outlet](https://thenounproject.com/creator/creativeoutlet/) for the [icon](https://thenounproject.com/icon/cross-hair-1641709/)