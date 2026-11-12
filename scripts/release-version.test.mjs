import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseVersion } from './release-version.mjs';

test('accepts stable and SemVer prerelease tags for the project major', () => {
  for (const version of ['18.0.0', '18.0.0-rc1', '18.0.0-beta.2', '18.0.0-0']) {
    assert.equal(releaseVersion(`v${version}`, '18.0.0-rc1'), version);
  }
});

test('rejects malformed tags, leading zeroes and wrong majors', () => {
  for (const tag of ['18.0.0', 'vv18.0.0', 'v19.0', 'v18.0.0-', 'v18.0.0-01', 'v018.0.0', 'v18.0.0-beta..2', 'v18.0.0+build', 'v17.0.0', 'v19.0.0']) {
    assert.throws(() => releaseVersion(tag, '18.0.0-rc1'), { name: 'Error' });
  }
});
