using System.Diagnostics;
using System.Reflection;
using Umbraco.Cms.Core.Manifest;
using Umbraco.Cms.Infrastructure.Manifest;

namespace ImageHotspot;

public class ImageHotspotManifestReader : IPackageManifestReader
{
    public Task<IEnumerable<PackageManifest>> ReadPackageManifestsAsync()
    {
        var versionInfo = FileVersionInfo.GetVersionInfo(Assembly.GetExecutingAssembly().Location);
        var version = $"{versionInfo.FileMajorPart}.{versionInfo.FileMinorPart}.{versionInfo.FileBuildPart}";

        var manifest = (IEnumerable<PackageManifest>)new List<PackageManifest>() {
            new PackageManifest()
            {
                AllowTelemetry = true,
                Version = version,
                Name = versionInfo.ProductName ?? versionInfo.FileName,
                Extensions = new object[]
                {
                    new
                    {
                        Name = "Image Hotspot Bundle",
                        Alias = "ImageHotspot.Bundle",
                        Type = "bundle",
                        Js = "/App_Plugins/ImageHotspot/image-hotspot.js"
                    }
                }

            }
        };

        return Task.FromResult(manifest);
    }
}
