import { describe, expect, it } from "vitest";

import { getQuoteState } from "@/lib/quote-state";

const future = "2999-01-01T00:00:00.000Z";
const past = "2000-01-01T00:00:00.000Z";

describe("getQuoteState", () => {
  it("marks a current unsigned quote as pending", () => {
    expect(getQuoteState({ isActive: true, acceptedAt: null, validUntil: future, lockedAt: null })).toBe("pending");
  });

  it("marks an accepted current quote as signed", () => {
    expect(getQuoteState({ isActive: true, acceptedAt: past, validUntil: future, lockedAt: null })).toBe("signed");
  });

  it("marks an expired current quote as expired", () => {
    expect(getQuoteState({ isActive: true, acceptedAt: null, validUntil: past, lockedAt: null })).toBe("expired");
  });

  it("marks a locked current quote as locked before considering expiry", () => {
    expect(getQuoteState({ isActive: true, acceptedAt: null, validUntil: past, lockedAt: past })).toBe("locked");
  });

  it.each([
    ["signed", past, future, null],
    ["locked", null, future, past],
    ["expired", null, past, null],
  ])("marks an inactive %s quote as superseded", (_state, acceptedAt, validUntil, lockedAt) => {
    expect(getQuoteState({ isActive: false, acceptedAt, validUntil, lockedAt })).toBe("superseded");
  });
});
