import assert from "node:assert/strict";
import { test } from "node:test";
import * as pricing from "../src/lib/product-price.ts";

test("displayed product totals use API size and topping prices for every drink", () => {
  const product = {
    id: "00000000-0000-4000-8000-000000000001", name: "Espresso", description: "Rich & bold", imageUrl: "/coffee.jpg", basePrice: 30000, stock: 10, isAvailable: true,
    sizes: [{ code: "S", priceDelta: 0 }, { code: "M", priceDelta: 7000 }],
    toppings: [{ id: "vanilla", name: "Vanilla", price: 6000 }, { id: "shot", name: "Shot", price: 11000 }],
  };
  assert.equal(pricing.calculateProductTotal(product, "S", [], 1), 30000);
  assert.equal(pricing.calculateProductTotal(product, "M", ["vanilla", "shot"], 2), 108000);
  assert.equal(pricing.calculateProductTotal(product, "M", ["vanilla"], 3), 129000);
});
