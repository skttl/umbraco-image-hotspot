using System.Text.Json;
using ImageHotspot.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Extensions;

namespace ImageHotspot;

public class ImageHotspotPropertyConverter : IPropertyValueConverter
{
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
                return JsonSerializer.Deserialize<ImageHotspotValue>(
                    sourceString,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );
            }
            catch (Exception)
            {
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
}
