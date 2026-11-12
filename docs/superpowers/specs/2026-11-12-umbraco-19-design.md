# Umbraco 19 RC og repository-standard

Status: Godkendt af brugeren 2026-11-12. Implementering og verificering registreres i ../plans/2026-11-12-umbraco-19.md.

## Mål og udgangspunkt

Bevar den nuværende main som v18-sporet, og forbered main til Umbraco 19 RC efter `umbraco-package-repository`-standarden. Ingen NuGet-udgivelse eller tags oprettes.

Repo: `C:/Workspaces/Umbraco/Packages/umbraco-image-hotspot`.
Checkoutet står på `v17/main` og var rent ved undersøgelsens start.
Lokal og remote main peger begge på `5c24ac835654f31800962d3103498075392f3d6f`.
Der findes endnu ingen `v18/main` lokalt eller på origin.
Main har flydende Umbraco .NET-referencer, men klient og demo refererer stadig til v17. Den er derfor ikke et verificeret v18-build.

## Valgt tilgang

Brug selvstændige versionsbrancher, som brugeren og standarden foreskriver. Et multi-major build med betinget kode giver ekstra kompleksitet og opfylder ikke den ønskede branchestruktur. En ren versionsopdatering opfylder ikke ønsket om repository-standarden.

1. Kontrollér branchernes aktuelle remote-tips igen før ændringer. Bevar main-historikken i `v18/main` fra den verificerede main-tip. Slet eller omdøb ikke den eksisterende main-ref væk.
2. Gør v18-sporet reproducerbart med afgrænsede v18-afhængigheder, matchende klient/demo og .NET 10. Bevar den eksisterende struktur på denne branch; repository-omlægningen gælder v19 på main. Verificér v18 før remote-branchen publiceres.
3. Udarbejd v19-ændringer på en `codex/`-branch fra main i det eksisterende checkout. Commit aldrig direkte på main. Integration til main sker ved almindelig fast-forward eller merge efter verificering og gældende autorisation; ingen force push.
4. Lad v17-brancherne og historikken være urørte. Lav ingen releases.

Brugeren har bestilt versionsbranchens oprettelse. Dette er ikke tilladelse til at kassere lokale filer, omskrive historik eller udgive pakker.

## Versioner og kompatibilitet

- NuGet ID bevares: `Umbraco.Community.ImageHotspot`.
- Første v19-pakkeversion: `19.0.0-rc1`.
- CMS/demo/template og backoffice-klient: verificeret publiceret `19.0.0-rc1`.
- Target framework: `net11.0`. Installér .NET 11 SDK lokalt, uden at ændre maskinens systeminstallation, og pin den valgte version i `global.json`. Maskinen har aktuelt kun SDK op til 10.0.401. Microsofts release-metadata angiver aktuelt SDK 11.0.100; verificér tilgængeligheden ved installation.
- Umbraco dependency-interval: `[19.0.0-rc1,20.0.0)`. RC er det deklarerede og testede minimum; dokumentér dette, og påstå ikke stabil kompatibilitetsverifikation før den er udført.
- Reducér serverreferencer til de mindste pakker, der faktisk leverer converter- og manifest-API'erne. Beslut det præcise sæt med build-verifikation.
- Ingen egne Management API'er eller appsettings-schema tilføjes.

## Struktur på main

```text
Umbraco.Community.ImageHotspot.slnx
README.md
LICENSE
icon.png
NuGet.Config
global.json
umbraco-marketplace.json
umbraco-marketplace-readme.md
src/Umbraco.Community.ImageHotspot/
  Umbraco.Community.ImageHotspot.csproj
  Models/ImageHotspotValue.cs
  <eksisterende serverkode>
  Client/
    public/umbraco-package.json
    src/entrypoint.ts
    src/editors/
    src/localization/
    src/types/
    tests/
    <eksisterende build- og testkonfiguration>
  wwwroot/                       # genereret, ignoreret
tests/Umbraco.Community.ImageHotspot.Tests/
demo/Umbraco.Community.ImageHotspot.TestSite/
docs/nuget-readme.md
docs/screenshots/
.github/workflows/ci.yml
.github/workflows/publish.yml
scripts/verify-package.py
```

Solution inkluderer package, tests og demo. Kun package er packable. Flyt logo og bruger-README til standardens placeringer; opdatér alle referencer. Fjern de gamle, redundante solutions når den nye dækker dem.

Bevar eksisterende offentlige C#-namespaces (`ImageHotspot` og `ImageHotspot.Models`), typenavne, custom element, editor-aliaser, konfigurationsaliaser og JSON-format. Projektnavne og mapper normaliseres uden at kræve ændringer i brugernes Razor-kode. Kontrollér assembly-afhængigheder før eventuelt ændret assemblynavn; bevar om nødvendigt eksisterende assemblynavn.

## Klient og statiske assets

Sæt `StaticWebAssetBasePath` til `App_Plugins/ImageHotspot`; Vite bygger direkte til `../wwwroot`. Manifest kopieres fra `Client/public/` og peger på `/App_Plugins/ImageHotspot/entrypoint.js`. Eksternalisér `@umbraco-cms/`-moduler. Kontrollér dynamiske chunks og lokaliseringsfiler i både demoen og en installeret NuGet-pakke.

Brug én manifestregistrering. Den nuværende serverbaserede manifestreader/composer må kun erstattes med den statiske manifestmodel, når registreringen er verificeret, og eventuelle eksterne API-konsekvenser er afklaret. Undgå dobbeltregistrering.

Brug `npm ci`, ret eksisterende scripts der peger på `vite.config.js` selv om filen er `.ts`, og udeluk rå `Client/**`-filer samt node_modules fra NuGet-indholdet. Genereret output ignoreres og genbygges før build/pack; en installeret pakke kræver ikke Node.

## RC-ændringer der skal håndteres

Kilde: https://umbraco.com/blog/umbraco-19-release-candidate/
Supplér med de officielle v18/v19 upgrade notes før kodeændringer:

- https://docs.umbraco.com/umbraco-cms/19.latest/get-started/upgrading-and-migrating/version-specific
- https://docs.umbraco.com/umbraco-cms/18.latest/get-started/upgrading-and-migrating/version-specific

1. .NET 11 er påkrævet. Runtime async er Umbracos compile-valg og kræver ikke, at pakken selv aktiverer det.
2. Media picker splittes i faste enkelt-/flerresultatmodeller. Verificér klientens lagrede media picker-format og dens `imageValue[0].mediaKey` mod begge relevante editorer. Undgå at forveksle servermodellens ændring med klientens JSON-format. Test det observerbare image lookup.
3. Backoffice bruger cookies; gennemgå E2E-login, acceptance helpers og repository-kald. Pakken bruger Umbraco-repositories frem for egen tokenhåndtering. Bekræft at ingen fjernede token-API'er anvendes.
4. Library Elements i Block List/Grid, Single Block og RTE giver nye kontekster. Kontrollér image lookup i relevante lokale og delte blokke. Lookup på et delt element må ikke påstå at kende en entydig dokumentforælder. Bevar den nuværende warning, hvor en billedkilde ikke findes, og dokumentér eventuelle begrænsninger.
5. Gamle uSync-eksporter kan gendanne forkerte editor-aliaser efter migration. Genbrug dem ikke blindt. Opret testfixtures via v19-API'er eller kompatible, nygenererede artefakter. Tilføj ikke uSync alene for at kopiere den gamle opsætning.
6. Søgning/Examine, custom OpenAPI, imaging-secret-migration og eksisterende databaseopgradering kræver ingen nye funktioner i denne pakke. Verificér brugte imaging-API'er og converter-/manifest-API'er mod RC. Opgradér ingen eksisterende lokal database.

Umbraco-skillserveren understøtter endnu ikke v19. Brug officielle RC-kilder og faktisk kompilering/runtime som evidens.

## Demo og tests

Generér en ny SQLite-demo med officiel `Umbraco.Templates::19.0.0-rc1`. Inspicér template-help først og brug de understøttede parametre. Bevar de genererede startup/projektindstillinger, tilføj project reference og kun de fixtures, der demonstrerer hotspot-editoren. Dokumentér den præcise template-version og kommando i root README.

Bevar eksisterende demo og lokale data, indtil den nye fungerer; flyt ikke og slet ikke databaser, media eller lokale credentials som led i omlægningen. Læs ikke beskyttede konfigurationsfiler. Nye lokale passwords hører i user secrets eller ignoreret udviklingskonfiguration. Undgå at kopiere gamle hardkodede loginoplysninger til ny tracked konfiguration. Eksisterende fixtures med person-/mediedata skal ikke spredes til nye artefakter.

Bevar servertests og tilpas project references. For nødvendige adfærdsændringer: ét fejlagtigt regressionstest først og minimal rettelse bagefter. E2E-fixtures skal oprettes reproducerbart, så en ren demo kan køre testene uden et manuelt oprettet dokument ved navn Test.

Verificér:

- C# unit tests og TypeScript typecheck efter ændringer, som AGENTS kræver.
- Klientbuild, solution-build inklusive demo og pack i Release.
- E2E for editorrendering, image lookup, eksisterende position, klik/drag, save/reload og manglende billede; relevante kontekster og media picker-typer prioriteres efter faktisk RC-påvirkning.
- Nupkg: ID/version/TFM/Umbraco-interval, DLL, README, ikon, manifest, JS/chunks; ingen demo, credentials, databaser, node_modules eller rå klientkilder.
- Installér den byggede nupkg i en separat, ren template-genereret v19 RC-site uden project reference. Verificér startup, editorregistrering og alle relevante asset-URL'er. Dette er nødvendigt for at påstå verificeret NuGet-installation.
- Kør v18-build/tests særskilt før v18-sporet publiceres.

Hvis en check ikke kan køres, registrér den som udestående og påstå ikke, at arbejdet er komplet.

## CI, publishing og dokumentation

Erstat de to gamle release-workflows på v19-sporet med read-only CI og tagbaseret publishing. CI kører på PRs og relevante version branches; understøt branchernes faktiske SDK'er/filplaceringer uden at påtvinge v17 den nye struktur. v18 har sit selvstændige workflow.

Publishing accepterer hele SemVer-tags med præfikset v, inklusive rc1 og beta.2. Validér hele tagget, major/version/dependency-interval og tag-commit som ancestor af den forventede remote-versionbranch. Hent fuld nødvendig historik og refs. Genbrug samme pakkeinspektion i CI og publishing.

Publicér med NuGet trusted publishing/OIDC, `release` environment, `contents: read`, `id-token: write` og `NUGET_USER`. Dokumentér GitHub environment og NuGet trust policy. Den eksterne trust policy må ikke påstås konfigureret uden verifikation; opret ingen release for at teste den. Kontrollér aktuelle officielle action-versioner før workflow-implementering.

Root README dækker layout, forudsætninger, template-generation, startup, build, test, brancher og releases samt tydelige links til installation og brug. `docs/nuget-readme.md` er pakkens brugerdokumentation og pakkes som README.md. Opdatér Marketplace-intro, metadata og links. Tilføj ingen schema, API-klientgenerator eller starter kit.

## Godkendelsespunkt

Omlægningen berører projektstier, build/pack, statiske asset-stier, demo/fixtures og release-workflows. Den bestilte v19-opgradering og repository-standard er det samlede scope. Før implementering skal denne konkrete plan godkendes som krævet af brainstorming-skillen. Derefter udarbejdes implementeringstrin og arbejdet udføres.
