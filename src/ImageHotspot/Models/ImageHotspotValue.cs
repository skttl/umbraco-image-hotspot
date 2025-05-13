using System.Globalization;

namespace ImageHotspot.Models;

public class ImageHotspotValue
{
    public int Left { get; set; }
    public int Top { get; set; }
    public decimal PercentX { get; set; }
    public decimal PercentY { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string? Image { get; set; }

    public override string ToString()
    {
        return "left: " + PercentX.ToString(CultureInfo.InvariantCulture) + "%; top: " + PercentY.ToString(CultureInfo.InvariantCulture) + "%;";
    }
}
