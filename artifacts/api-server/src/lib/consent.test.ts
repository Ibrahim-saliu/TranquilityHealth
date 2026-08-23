import { describe, it, expect } from "vitest";
import {
  consentTypesToInsert,
  REQUIRED_CONSENT_TYPES,
  CONSENT_TYPES,
} from "./consent";

describe("consentTypesToInsert", () => {
  it("returns every required consent when none are signed", () => {
    expect(consentTypesToInsert([])).toEqual(REQUIRED_CONSENT_TYPES);
  });

  it("returns nothing when all required consents are already signed", () => {
    expect(consentTypesToInsert(REQUIRED_CONSENT_TYPES)).toEqual([]);
  });

  it("returns only the missing consent when one is already signed", () => {
    expect(consentTypesToInsert([CONSENT_TYPES.hipaa])).toEqual([CONSENT_TYPES.telehealth]);
  });

  it("captures a version change: an empty current-version list re-requests all", () => {
    // The caller filters existing records to the *current* document version, so
    // after a version bump the patient's older signatures don't appear here and
    // every required consent is captured again for the new version.
    expect(consentTypesToInsert([])).toEqual([CONSENT_TYPES.hipaa, CONSENT_TYPES.telehealth]);
  });

  it("ignores unrelated consent types", () => {
    expect(consentTypesToInsert(["SOME_OTHER_CONSENT"])).toEqual(REQUIRED_CONSENT_TYPES);
  });
});
