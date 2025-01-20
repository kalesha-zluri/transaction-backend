import { toLowerCase } from "../../src/utils/toLowerCase"; 
import { CSVRecord } from "../../src/types/csv.types";

describe("toLowerCase", () => {
  it("should transform keys and values to lowercase", () => {
    const input: CSVRecord = {
      Date: "10-01-2025",
      Description: "Purchased An Ice Cream",
      Amount: "200",
      Currency: "USD",
    };

    const expectedOutput: CSVRecord = {
      date: "10-01-2025",
      description: "purchased an ice cream",
      amount: "200",
      currency: "usd",
    };

    const result = toLowerCase(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should handle empty objects", () => {
    const input: CSVRecord = {};

    const expectedOutput: CSVRecord = {};

    const result = toLowerCase(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should handle mixed case keys and values", () => {
    const input: CSVRecord = {
      DaTe: "10-01-2025",
      DEScripTION: "PUrCHased an Ice CrEam",
      AmOUNt: "200",
      CurrENCY: "UsD",
    };

    const expectedOutput: CSVRecord = {
      date: "10-01-2025",
      description: "purchased an ice cream",
      amount: "200",
      currency: "usd",
    };

    const result = toLowerCase(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should not mutate the input object", () => {
    const input: CSVRecord = {
      Date: "10-01-2025",
      Description: "Purchased An Ice Cream",
      Amount: "200",
      Currency: "USD",
    };

    const inputCopy = { ...input };

    toLowerCase(input);

    expect(input).toEqual(inputCopy);
  });

  it("should handle special characters and numbers correctly", () => {
    const input: CSVRecord = {
      "D@te#": "10-01-2025",
      D$esCr1ption: "IcE-Cream@Shop",
      "123AmOUNT": "500",
      Cur$Rency: "EURO",
    };

    const expectedOutput: CSVRecord = {
      "d@te#": "10-01-2025",
      d$escr1ption: "ice-cream@shop",
      "123amount": "500",
      cur$rency: "euro",
    };

    const result = toLowerCase(input);

    expect(result).toEqual(expectedOutput);
  });
});
