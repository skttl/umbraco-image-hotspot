using System.Text.Json;
using System.Text.Json.Serialization;
using ImageHotspot.Models;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;

namespace ImageHotspot;

public class ImageHotspotPropertyConverter : IPropertyValueConverter
{
    private readonly ILogger<ImageHotspotPropertyConverter> _logger;
    private readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new FlexibleDecimalConverter(), new FlexibleIntConverter() },
    };

    public ImageHotspotPropertyConverter(ILogger<ImageHotspotPropertyConverter> logger)
    {
        _logger = logger;
    }

    public bool IsConverter(IPublishedPropertyType propertyType) =>
        propertyType.EditorUiAlias == "ImageHotspot.PropertyEditorUi";

    public Type GetPropertyValueType(IPublishedPropertyType propertyType)
    {
        return typeof(ImageHotspotValue);
    }

    public PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType)
    {
        return PropertyCacheLevel.Element;
    }

    public bool? IsValue(object? value, PropertyValueLevel level)
    {
        switch (level)
        {
            case PropertyValueLevel.Source:
                return value != null && value is ImageHotspotValue;
            default:
                throw new NotSupportedException($"Invalid level: {level}.");
        }
    }

    public object? ConvertSourceToIntermediate(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        object? source,
        bool preview
    )
    {
        if (source?.ToString() is var sourceString && sourceString.IsNullOrWhiteSpace() == false)
        {
            try
            {
                return JsonSerializer.Deserialize<ImageHotspotValue>(sourceString, _options);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Failed deserializing ImageHotSpotValue, {ex}", ex.Message);
                return null;
            }
        }

        return null;
    }

    public object? ConvertIntermediateToObject(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel,
        object? inter,
        bool preview
    )
    {
        return inter;
    }

    /// <summary>
    /// Used to deserialize the JSON string into a decimal, for backwards compatibility
    /// </summary>
    private class FlexibleDecimalConverter : JsonConverter<decimal>
    {
        public override decimal Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (
                reader.TokenType == JsonTokenType.String
                && decimal.TryParse(reader.GetString(), out var i)
            )
            {
                return i;
            }

            if (reader.TokenType == JsonTokenType.Number && reader.TryGetDecimal(out i))
            {
                return i;
            }

            return 0; // or throw
        }

        public override void Write(
            Utf8JsonWriter writer,
            decimal value,
            JsonSerializerOptions options
        )
        {
            writer.WriteNumberValue(value);
        }
    }

    /// <summary>
    /// Used to deserialize the JSON string into a int, for backwards compatibility
    /// </summary>
    private class FlexibleIntConverter : JsonConverter<int>
    {
        public override int Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (
                reader.TokenType == JsonTokenType.String
                && int.TryParse(reader.GetString(), out var i)
            )
            {
                return i;
            }

            if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out i))
            {
                return i;
            }

            return 0; // or throw
        }

        public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options)
        {
            writer.WriteNumberValue(value);
        }
    }
}
