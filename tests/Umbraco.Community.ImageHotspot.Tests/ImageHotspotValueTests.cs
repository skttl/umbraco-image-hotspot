using ImageHotspot.Models;

namespace ImageHotspot.Tests;

public class ImageHotspotValueTests
{
    [Fact]
    public void ToString_ReturnsCssLeftTop()
    {
        var value = new ImageHotspotValue { PercentX = 55.75m, PercentY = 74.878m };
        Assert.Equal("left: 55.75%; top: 74.878%;", value.ToString());
    }

    [Fact]
    public void ToString_WithZeroValues_ReturnsCssZero()
    {
        var value = new ImageHotspotValue { PercentX = 0m, PercentY = 0m };
        Assert.Equal("left: 0%; top: 0%;", value.ToString());
    }

    [Fact]
    public void ToString_WithIntegerValues_NoDecimalPoint()
    {
        var value = new ImageHotspotValue { PercentX = 50m, PercentY = 50m };
        Assert.Equal("left: 50%; top: 50%;", value.ToString());
    }

    [Fact]
    public void ToString_UsesInvariantCulture()
    {
        var value = new ImageHotspotValue { PercentX = 12.5m, PercentY = 33.333m };
        var result = value.ToString();
        Assert.Contains("12.5", result);
        Assert.Contains("33.333", result);
        Assert.DoesNotContain(",", result);
    }

    [Fact]
    public void DefaultValue_HasZeroPercent()
    {
        var value = new ImageHotspotValue();
        Assert.Equal(0m, value.PercentX);
        Assert.Equal(0m, value.PercentY);
    }
}
