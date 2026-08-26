import { describe, it, expect } from "vitest";
import { xlmToStroops, formatXlm, shortenAddress, formatTimestamp, STROOPS_PER_XLM } from "@/lib/stellar";

describe("Stellar Helpers", () => {
  describe("xlmToStroops", () => {
    it("converts whole XLM amounts to stroops", () => {
      expect(xlmToStroops("1")).toBe(BigInt(10_000_000));
      expect(xlmToStroops("50")).toBe(BigInt(500_000_000));
    });

    it("converts decimal XLM amounts to stroops correctly", () => {
      expect(xlmToStroops("0.5")).toBe(BigInt(5_000_000));
      expect(xlmToStroops("1.234567")).toBe(BigInt(12_345_670));
      expect(xlmToStroops("0.0000001")).toBe(BigInt(1));
    });

    it("throws on empty or invalid inputs", () => {
      expect(() => xlmToStroops("")).toThrow("Amount is required");
      expect(() => xlmToStroops("abc")).toThrow("Invalid XLM amount");
      expect(() => xlmToStroops("1.2.3")).toThrow("Invalid XLM amount");
    });

    it("throws on more than 7 decimal places", () => {
      expect(() => xlmToStroops("1.12345678")).toThrow("XLM supports at most 7 decimal places");
    });

    it("throws on zero or negative amounts", () => {
      expect(() => xlmToStroops("0")).toThrow("Amount must be greater than 0");
    });
  });

  describe("formatXlm", () => {
    it("formats stroop amounts to readable XLM", () => {
      expect(formatXlm(BigInt(10_000_000))).toBe("1 XLM");
      expect(formatXlm(BigInt(15_000_000))).toBe("1.5 XLM");
      expect(formatXlm(BigInt(100))).toBe("0.00001 XLM");
      expect(formatXlm(BigInt(0))).toBe("0 XLM");
    });
  });

  describe("shortenAddress", () => {
    it("shortens public G-addresses", () => {
      const address = "CBFKEXJOQ3ZDJZC66PZYSELB36EHFRBPPGUE6ZW22B2AEDYECVJUH2QZ";
      expect(shortenAddress(address)).toBe("CBFK...H2QZ");
    });

    it("returns short strings unchanged", () => {
      expect(shortenAddress("short")).toBe("short");
    });
  });

  describe("formatTimestamp", () => {
    it("returns dash for invalid or zero timestamps", () => {
      expect(formatTimestamp(BigInt(0))).toBe("—");
      expect(formatTimestamp(BigInt(-1))).toBe("—");
    });

    it("formats valid epoch seconds", () => {
      const formatted = formatTimestamp(BigInt(1700000000));
      expect(formatted).not.toBe("—");
    });
  });
});
