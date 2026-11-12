import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseVersion } from './release-version.mjs';

test('accepts stable and SemVer prerelease tags for the project major', () => {
  for (const version of ['19.0.0', '19.0.0-rc1', '19.0.0-beta.2', '19.0.0-0']) {
    assert.equal(releaseVersion(`v${version}`, '19.0.0-rc1'), version);
  }
});

test('rejects malformed tags, leading zeroes and wrong majors', () => {
  for (const tag of ['19.0.0', 'vv19.0.0', 'v19.0', 'v19.0.0-', 'v19.0.0-01', 'v019.0.0', 'v19.0.0-beta..2', 'v19.0.0+build', 'v18.0.0', 'v20.0.0']) {
    assert.throws(() => releaseVersion(tag, '19.0.0-rc1'), { name: 'Error' });
  }
});
