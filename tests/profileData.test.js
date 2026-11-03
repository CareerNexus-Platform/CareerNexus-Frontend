import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProfileLinks } from "../src/services/profileData.js";
test("profile links support current arrays and legacy platform maps", () => {
  assert.equal(parseProfileLinks('[{"platform":"GitHub","url":"https://github.com/example"}]')[0].platform, "GitHub");
  assert.equal(parseProfileLinks('{"GitHub":"https://github.com/example"}')[0].platform, "GitHub");
});
test("a malformed or executable profile link cannot crash a directory or become a clickable URL", () => {
  assert.deepEqual(parseProfileLinks("{broken"), []);
  assert.deepEqual(parseProfileLinks(null), []);
  assert.deepEqual(parseProfileLinks('[{"platform":"Portfolio","url":"javascript:alert(1)"}]'), []);
});
