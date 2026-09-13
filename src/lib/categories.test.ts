import test from "node:test"
import assert from "node:assert/strict"

import { categoryMatches, normalizeCategoryValue, splitCategoryValues } from "./categories"

test("normalizeCategoryValue strips spaces and case differences", () => {
  assert.equal(normalizeCategoryValue("  Mode / Éditorial  "), "mode / editorial")
  assert.equal(normalizeCategoryValue("Branding / Content"), "branding / content")
})

test("splitCategoryValues handles multi-category strings safely", () => {
  assert.deepEqual(splitCategoryValues("Mode / Éditorial, Sport, Portraits"), [
    "mode / editorial",
    "sport",
    "portraits",
  ])
})

test("categoryMatches must not use partial substring checks", () => {
  assert.equal(categoryMatches("Sports", { slug: "sport", name: "Sport" }), false)
  assert.equal(categoryMatches("Automobile", { slug: "sport", name: "Sport" }), false)
  assert.equal(categoryMatches("Mode / Éditorial, Sport", { slug: "sport", name: "Sport" }), true)
  assert.equal(categoryMatches("Branding / Content", { slug: "branding", name: "Branding / Content" }), true)
})
