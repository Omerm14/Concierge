import { describe, expect, it } from "vitest";
import { detectLanguage } from "../../../lib/i18n/detect-language";

describe("detectLanguage", () => {
  it("AC1: a Hebrew-script name is detected as he with confidence > 0.5", () => {
    const result = detectLanguage({ name: "דוד לוי" });
    expect(result.language).toBe("he");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("AC1: a Cyrillic-script name is detected as ru with confidence > 0.5", () => {
    const result = detectLanguage({ name: "Дмитрий" });
    expect(result.language).toBe("ru");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("AC1: an Arabic-script name is detected as ar with confidence > 0.5", () => {
    const result = detectLanguage({ name: "محمد أحمد" });
    expect(result.language).toBe("ar");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("AC1: a Latin-script name is detected as en with confidence > 0.5", () => {
    const result = detectLanguage({ name: "John Smith" });
    expect(result.language).toBe("en");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("AC2: no signal at all falls back to he at low confidence without throwing", () => {
    expect(() => detectLanguage({})).not.toThrow();
    const result = detectLanguage({});
    expect(result.language).toBe("he");
    expect(result.confidence).toBeLessThan(0.5);
  });

  it("AC2: mixed/equal-weight scripts fall back to he at low confidence", () => {
    // "דוד" (3 Hebrew letters) and "Ben" (3 Latin letters) tie — no clear majority.
    const result = detectLanguage({ name: "דודBen" });
    expect(result.language).toBe("he");
    expect(result.confidence).toBeLessThan(0.5);
  });

  it("AC3: a non-Israeli phone nudges an otherwise-ambiguous Latin name toward en", () => {
    const ambiguous = detectLanguage({ name: "A" });
    expect(ambiguous.language).toBe("he"); // no usable tiebreaker yet

    const withForeignPhone = detectLanguage({ name: "A", phone: "+1-555-0100" });
    expect(withForeignPhone.language).toBe("en");
    expect(withForeignPhone.confidence).toBeGreaterThan(0);
  });

  it("an Israeli phone does not nudge an ambiguous Latin name toward en", () => {
    const result = detectLanguage({ name: "A", phone: "050-1234567" });
    expect(result.language).toBe("he");
  });

  it("AC4: language is always one of the four enum values and confidence is within [0,1]", () => {
    const inputs = [
      {},
      { name: "John Smith" },
      { name: "דוד לוי" },
      { name: "Дмитрий" },
      { name: "محمد أحمد" },
      { name: "A", phone: "+44 20 7946 0958" },
      { text: "hello world" },
    ];
    for (const input of inputs) {
      const result = detectLanguage(input);
      expect(["he", "en", "ru", "ar"]).toContain(result.language);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("AC5: pure and deterministic — same input produces the same output", () => {
    const input = { name: "John Smith", phone: "+1-555-0100", text: "hi there" };
    expect(detectLanguage(input)).toEqual(detectLanguage(input));
  });

  it("uses the text field as a signal alongside or instead of name", () => {
    const result = detectLanguage({ text: "שלום עולם" });
    expect(result.language).toBe("he");
    expect(result.confidence).toBeGreaterThan(0.5);
  });
});
