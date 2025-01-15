import { validateSchema, validateDataTypes } from "../../src/utils/validations";

describe("validateSchema", () => {
  it("should return true for valid schema", () => {
    const validData = {
      date: "2021-01-01",
      description: "Transaction description",
      amount: "100",
      currency: "USD",
    };
    expect(validateSchema(validData)).toBe(true);
  });

  it("should return false for missing required columns", () => {
    const invalidData = {
      date: "2021-01-01",
      description: "Transaction description",
      amount: "100",
    };
    expect(validateSchema(invalidData)).toBe(false);
  });

  it("should return false for extra columns without affecting validation", () => {
    const validDataWithExtraColumn = {
      date: "2021-01-01",
      description: "Transaction description",
      amount: "100",
      currency: "USD",
      extra: "Extra column",
    };
    expect(validateSchema(validDataWithExtraColumn)).toBe(true);
  });
});

describe("validateDataTypes", () => {
  it("should return true for valid data types", () => {
    const validData = {
      date: "01-01-2021",
      description: "Transaction description",
      amount: "100",
    };
    expect(validateDataTypes(validData)).toBe(true);
  });

  it("should return false for invalid date format", () => {
    const invalidDate = {
      date: "2021-01-01",
      description: "Transaction description",
      amount: "100",
    };
    expect(validateDataTypes(invalidDate)).toBe(false);
  });

  it("should return false for invalid amount type", () => {
    const invalidAmount = {
      date: "01-01-2021",
      description: "Transaction description",
      amount: "not a number",
    };
    expect(validateDataTypes(invalidAmount)).toBe(false);
  });

  it("should return false for invalid description type", () => {
    const invalidDescription = {
      date: "01-01-2021",
      description: "",
      amount: "100",
    };
    expect(validateDataTypes(invalidDescription)).toBe(false);
  });

  it("should return false for invalid month", () => {
    const invalidMonth = {
      date: "01-13-2021",
      description: "Transaction description",
      amount: "100",
    };
    expect(validateDataTypes(invalidMonth)).toBe(false);
  });

  it("should return false for invalid day in month", () => {
    const invalidDay = {
      date: "32-01-2021",
      description: "Transaction description",
      amount: "100",
    };
    expect(validateDataTypes(invalidDay)).toBe(false);
  });
});
