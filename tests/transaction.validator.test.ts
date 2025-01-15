import { validateTransaction } from "../src/middlewares/transactionValidator";

describe("validateTransaction", () => {
  it("should return null for valid transactions", () => {
    const validTransaction = {
      Date: "12-12-2024",
      Description: "Grocery shopping",
      Amount: "150.50",
      Currency: "USD",
    };
    expect(validateTransaction(validTransaction)).toBeNull();
  });

  it("should return an error for missing required fields", () => {
    const transactionMissingField = {
      Description: "Grocery shopping",
      Amount: "150.50",
      Currency: "USD",
    };
    expect(validateTransaction(transactionMissingField)).toBe(
      "Missing required field:Date"
    );
  });

  it("should return an error for invalid date format", () => {
    const transactionInvalidDate = {
      Date: "2024-12-12",
      Description: "Grocery shopping",
      Amount: "150.50",
      Currency: "USD",
    };
    expect(validateTransaction(transactionInvalidDate)).toBe(
      "Invalid date format. Expected format: dd-mm-yyyy"
    );
  });

  it("should return an error for invalid amount format", () => {
    const transactionInvalidAmount = {
      Date: "12-12-2024",
      Description: "Grocery shopping",
      Amount: "abc",
      Currency: "USD",
    };
    expect(validateTransaction(transactionInvalidAmount)).toBe(
      "Invalid amount format"
    );
  });

  it("should return an error for missing multiple fields", () => {
    const transactionMissingMultipleFields = {
      Date: "",
      Amount: "",
      Currency: "USD",
    };
    expect(validateTransaction(transactionMissingMultipleFields)).toBe(
      "Missing required field:Date"
    );
  });
});
