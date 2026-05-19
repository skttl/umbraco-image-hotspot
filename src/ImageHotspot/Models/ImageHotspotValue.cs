using System.Globalization;

namespace ImageHotspot.Models;

public class ImageHotspotValue
{
    [Obsolete("Left is no longer used and will be removed in a future version")]
    public decimal Left { get; set; }
    [Obsolete("Top is no longer used and will be removed in a future version")]
    public decimal Top { get; set; }
    public decimal PercentX { get; set; }
    public decimal PercentY { get; set; }
    [Obsolete("Width is no longer used and will be removed in a future version")]
    public int Width { get; set; }
    [Obsolete("Height is no longer used and will be removed in a future version")]
    public int Height { get; set; }
    [Obsolete("Image is no longer used and will be removed in a future version")]
    public string? Image { get; set; }

    public override string ToString()
    {
        return "left: "
            + PercentX.ToString(CultureInfo.InvariantCulture)
            + "%; top: "
            + PercentY.ToString(CultureInfo.InvariantCulture)
            + "%;";
    }
}
