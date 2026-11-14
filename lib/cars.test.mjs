import test from "node:test";
import assert from "node:assert/strict";
import { estValue } from "./cars.js";

const between = (v, lo, hi) => assert.ok(v >= lo && v <= hi, `${Math.round(v)} not in ${lo} to ${hi}`);

test("example prices land near real used prices", () => {
  between(estValue("Honda", "SUV", "Small", "G", 5, 60000, 20), 22000, 32000);   // 2021 Pilot
  between(estValue("Honda", "Car", "Compact", "G", 7, 84000, 29), 12000, 19000);  // 2019 Civic
  between(estValue("Ford", "Truck", "Standard", "G", 3, 36000, 19), 32000, 45000); // 2023 F-150
  assert.ok(estValue("Kia", "Car", "Compact", "G", 3, 36000, 30) > estValue("Kia", "Car", "Compact", "G", 9, 108000, 30));
});
