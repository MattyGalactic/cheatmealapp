import assert from "node:assert/strict";
import { filterByCravings, getCravingsForResult } from "./cravings";

function run() {
  const spicyCheesy = getCravingsForResult(
    { itemName: "Spicy Chicken Quesadilla", calories: 510, proteinGrams: 27 },
    600,
  );
  assert.equal(spicyCheesy.includes("Spicy"), true);
  assert.equal(spicyCheesy.includes("Cheesy"), true);

  const highProteinLowCal = getCravingsForResult(
    { itemName: "12 ct Grilled Nuggets", calories: 200, proteinGrams: 38 },
    400,
  );
  assert.equal(highProteinLowCal.includes("High-Protein"), true);
  assert.equal(highProteinLowCal.includes("Low-Cal"), true);

  const filtered = filterByCravings(
    [
      { id: "1", cravings: ["Cheesy", "Comfort"] },
      { id: "2", cravings: ["Cheesy"] },
      { id: "3", cravings: ["Comfort"] },
    ],
    ["Cheesy", "Comfort"],
  );
  assert.deepEqual(filtered.map((x) => x.id), ["1"]);

  const anyFiltered = filterByCravings(
    [
      { id: "1", cravings: ["Cheesy", "Comfort"] },
      { id: "2", cravings: ["Cheesy"] },
      { id: "3", cravings: ["Comfort"] },
    ],
    ["Cheesy", "Comfort"],
    "any",
  );
  assert.deepEqual(anyFiltered.map((x) => x.id), ["1", "2", "3"]);

  console.log("cravings dev test passed");
}

run();
