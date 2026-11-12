# Contributing Guidelines

Contributions to this package are most welcome! 

The solution includes a local test site under `src/ImageHotspot.TestSite`.
This branch targets Umbraco 18 and .NET 10; use Node 24 LTS and npm 11 for the client.

For Playwright, start a disposable test site on `https://localhost:5218`, set
`UMBRACO_USER_LOGIN` and `UMBRACO_USER_PASSWORD` for its local admin, and run
`npm --prefix src/ImageHotspot/Client run test:e2e`. Set `UMBRACO_URL` to use another URL.
Setup creates its own media, data types and documents through the Management API;
it does not need old uSync content. Fixtures use dedicated E2E identifiers and remain
in the test site between runs. Never point these tests at a production site.
Keep credentials in environment variables or user secrets, not tracked files.
