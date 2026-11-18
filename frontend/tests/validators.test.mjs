import assert from "node:assert/strict";
import { test } from "node:test";
import * as validators from "../src/lib/validators.ts";

test("email validation accepts normalized emails and rejects missing address parts", () => {
  assert.equal(validators.normalizeEmail(" A@Example.com "), "a@example.com");
  assert.equal(validators.isValidEmail(" A@Example.com "), true);
  for (const invalid of ["", "a", "a@", "@example.com", "a@example", "a b@example.com"]) {
    assert.equal(validators.isValidEmail(invalid), false);
  }
});

test("both auth flows require at least eight password characters", () => {
  assert.equal(validators.isValidPassword("1234567"), false);
  assert.equal(validators.isValidPassword("12345678"), true);
  assert.equal(validators.isValidPassword(" pass word "), true);
});
