import { describe, it, expect } from "vitest";
import { decideBaseline, BASELINE_TABLES } from "./migrator";

describe("decideBaseline", () => {
  it("treats an empty database as fresh (migrator builds from baseline)", () => {
    expect(decideBaseline([])).toEqual({ action: "fresh" });
  });

  it("treats a database with all baseline tables as already-baselined", () => {
    expect(decideBaseline([...BASELINE_TABLES])).toEqual({ action: "baseline" });
  });

  it("ignores unrelated tables when all baseline tables are present", () => {
    expect(decideBaseline([...BASELINE_TABLES, "some_other_table"])).toEqual({ action: "baseline" });
  });

  it("flags a partially initialized database instead of guessing", () => {
    const decision = decideBaseline(["users"]);
    expect(decision.action).toBe("partial");
    if (decision.action === "partial") {
      expect(decision.present).toEqual(["users"]);
      expect(decision.missing).toContain("consent_records");
      expect(decision.present.length + decision.missing.length).toBe(BASELINE_TABLES.length);
    }
  });

  it("still flags partial when only one table is missing", () => {
    const present = BASELINE_TABLES.filter((t) => t !== "consent_records");
    const decision = decideBaseline(present);
    expect(decision.action).toBe("partial");
    if (decision.action === "partial") {
      expect(decision.missing).toEqual(["consent_records"]);
    }
  });
});
