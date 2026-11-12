import { readFileSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function releaseVersion(tag, projectVersion) {
  const identifier = '(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)';
  const pattern = new RegExp(`^v(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(?:-${identifier}(?:\\.${identifier})*)?$`);
  const match = pattern.exec(tag);
  if (!match || match[1] !== projectVersion.split('.')[0]) {
    throw new Error('Tag must be v-prefixed SemVer and match the project major.');
  }
  return tag.slice(1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const project = readFileSync('src/Umbraco.Community.ImageHotspot/Umbraco.Community.ImageHotspot.csproj', 'utf8');
  const projectVersion = project.match(/<Version>([^<]+)<\/Version>/)[1];
  const version = releaseVersion(process.argv[2], projectVersion);
  const major = Number(version.split('.')[0]);
  const interval = project.match(/Include="Umbraco.Cms.Core" Version="([^"]+)"/)[1];
  if (!interval.startsWith(`[${major}.`) || !interval.endsWith(`,${major + 1}.0.0)`)) {
    throw new Error('Umbraco dependency interval does not match the project version.');
  }
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  const branch = major === 19 ? 'main' : `v${major}/main`;
  git('fetch', 'origin', `+refs/heads/${branch}:refs/remotes/origin/${branch}`);
  if (git('rev-parse', `${process.argv[2]}^{commit}`) !== git('rev-parse', 'HEAD')) {
    throw new Error('Checkout does not match the release tag.');
  }
  git('merge-base', '--is-ancestor', 'HEAD', `origin/${branch}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
  console.log(version);
}
