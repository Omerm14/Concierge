import { describe, expect, it } from "vitest";
import { normalizePhone } from "../../../lib/guests/normalize";

describe("normalizePhone", () => {
  it.each([
    ["050-123-4567", "0501234567"],
    ["0501234567", "0501234567"],
    ["+972501234567", "0501234567"],
    ["972501234567", "0501234567"],
  ])("normalizes Israeli input %s to the local key %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each([
    ["+14155551234", "+14155551234"],
    ["+1 415 555 1234", "+14155551234"],
    ["+442071838750", "+442071838750"],
  ])("preserves international input %s as E.164 %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each([["", undefined], ["abc", undefined], ["123", undefined], ["+12", undefined]])(
    "rejects garbage input %s",
    (input, expected) => {
      expect(normalizePhone(input as string)).toBe(expected);
    }
  );

  it("dedupes an Israeli number's local and +972 forms to the same key", () => {
    expect(normalizePhone("0501234567")).toBe(normalizePhone("+972501234567"));
  });

  it("keeps distinct international numbers as distinct keys", () => {
    expect(normalizePhone("+14155551234")).not.toBe(
      normalizePhone("+442071838750")
    );
  });
});
