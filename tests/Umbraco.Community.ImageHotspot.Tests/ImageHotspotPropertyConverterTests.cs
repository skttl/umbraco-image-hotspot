using ImageHotspot.Models;
using Microsoft.Extensions.Logging.Abstractions;

namespace ImageHotspot.Tests;

public class ImageHotspotPropertyConverterTests
{
    private readonly ImageHotspotPropertyConverter _converter =
        new(NullLogger<ImageHotspotPropertyConverter>.Instance);

    private ImageHotspotValue? Convert(string? json) =>
        _converter.ConvertSourceToIntermediate(null!, null!, json, false) as ImageHotspotValue;

    [Fact]
    public void ConvertSourceToIntermediate_NullSource_ReturnsNull()
    {
        var result = Convert(null);
        Assert.Null(result);
    }

    [Fact]
    public void ConvertSourceToIntermediate_EmptyString_ReturnsNull()
    {
        var result = Convert("");
        Assert.Null(result);
    }

    [Fact]
    public void ConvertSourceToIntermediate_WhitespaceString_ReturnsNull()
    {
        var result = Convert("   ");
        Assert.Null(result);
    }

    [Fact]
    public void ConvertSourceToIntermediate_InvalidJson_ReturnsNull()
    {
        var result = Convert("not-json");
        Assert.Null(result);
    }

    [Fact]
    public void ConvertSourceToIntermediate_ValidJson_DeserializesPercentX()
    {
        var result = Convert("""{"percentX":55.75,"percentY":74.878}""");
        Assert.NotNull(result);
        Assert.Equal(55.75m, result.PercentX);
        Assert.Equal(74.878m, result.PercentY);
    }

    [Fact]
    public void ConvertSourceToIntermediate_CaseInsensitive_Deserializes()
    {
        var result = Convert("""{"PercentX":10,"PercentY":20}""");
        Assert.NotNull(result);
        Assert.Equal(10m, result.PercentX);
        Assert.Equal(20m, result.PercentY);
    }

    [Fact]
    public void ConvertSourceToIntermediate_StringDecimalValues_Deserializes()
    {
        var result = Convert("""{"percentX":"55.75","percentY":"74.878"}""");
        Assert.NotNull(result);
        Assert.Equal(55.75m, result.PercentX);
        Assert.Equal(74.878m, result.PercentY);
    }

    [Fact]
    public void ConvertSourceToIntermediate_LegacyFormat_DeserializesPercents()
    {
        var json = """
            {
              "image": "/media/1492/photo.jpg",
              "left": 223,
              "top": 307,
              "percentX": 55.75,
              "percentY": 74.878,
              "width": 400,
              "height": 410
            }
            """;
        var result = Convert(json);
        Assert.NotNull(result);
        Assert.Equal(55.75m, result.PercentX);
        Assert.Equal(74.878m, result.PercentY);
    }

    [Fact]
    public void ConvertSourceToIntermediate_StringIntValues_Deserializes()
    {
        var json = """{"percentX":10.0,"percentY":20.0,"width":"400","height":"410"}""";
        var result = Convert(json);
        Assert.NotNull(result);
#pragma warning disable CS0618
        Assert.Equal(400, result.Width);
        Assert.Equal(410, result.Height);
#pragma warning restore CS0618
    }

    [Theory]
    [InlineData("""{"percentX":0,"percentY":0}""", "0", "0")]
    [InlineData("""{"percentX":100,"percentY":100}""", "100", "100")]
    [InlineData("""{"percentX":33.333,"percentY":66.667}""", "33.333", "66.667")]
    public void ConvertSourceToIntermediate_VariousValues(string json, string x, string y)
    {
        var result = Convert(json);
        Assert.NotNull(result);
        Assert.Equal(decimal.Parse(x, System.Globalization.CultureInfo.InvariantCulture), result.PercentX);
        Assert.Equal(decimal.Parse(y, System.Globalization.CultureInfo.InvariantCulture), result.PercentY);
    }

    [Fact]
    public void GetPropertyValueType_ReturnsImageHotspotValueType()
    {
        var type = _converter.GetPropertyValueType(null!);
        Assert.Equal(typeof(ImageHotspotValue), type);
    }

    [Fact]
    public void IsConverter_ReturnsFalseForNullPropertyType()
    {
        Assert.Throws<NullReferenceException>(() => _converter.IsConverter(null!));
    }
}
