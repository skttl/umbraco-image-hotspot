using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Infrastructure.Manifest;

namespace ImageHotspot;

public class ImageHotspotComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder) => builder.Services.AddSingleton<IPackageManifestReader, ImageHotspotManifestReader>();
}
