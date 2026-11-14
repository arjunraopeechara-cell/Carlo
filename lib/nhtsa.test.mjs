import test from "node:test";
import assert from "node:assert/strict";
import { pickVariant, tidyRecall } from "./nhtsa.js";

test("picks the variant matching the car's drive, else the first", () => {
  const list = [{ VehicleDescription: "2021 Honda PILOT SUV AWD", VehicleId: 1 }, { VehicleDescription: "2021 Honda PILOT SUV FWD", VehicleId: 2 }];
  assert.equal(pickVariant(list, "FWD").VehicleId, 2);
  assert.equal(pickVariant(list, "4WD").VehicleId, 1);
  assert.equal(pickVariant(list, "").VehicleId, 1);
  assert.equal(pickVariant([], "FWD"), null);
});
test("tidies a recall", () => {
  const r = tidyRecall({ NHTSACampaignNumber: "20V440000", Component: "ELECTRICAL SYSTEM:SOFTWARE", ReportReceivedDate: "28/07/2020", parkIt: false, parkOutSide: true });
  assert.deepEqual([r.part, r.date, r.urgent, r.sort], ["Electrical system: software", "Jul 2020", true, 20200728]);
  assert.equal(tidyRecall({}).part, "Recall");
});
