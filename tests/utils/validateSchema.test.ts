import { validate_transaction_schema } from "../../src/utils/validateSchema"; 
import { CSVRecord } from "../../src//types/csv.types";

describe("validate_transaction_schema", () => {
  it("should validate a correct transaction successfully", () => {
    const transaction: CSVRecord = {
      date: "10-01-2025",
      description: "Purchased an ice cream",
      amount: "200",
      currency: "USD",
    };

    const result = validate_transaction_schema(transaction);

    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("should return an error for missing required fields", () => {
    const transaction: CSVRecord = {
      date: "",
      description: "",
      amount: "",
      currency: "",
    };

    const result = validate_transaction_schema(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid date");
    expect(result.errors).toContain("Description cannot be empty.");
    expect(result.errors).toContain("Amount must be a number.");
    expect(result.errors).toContain("Currency cannot be empty.");
  });

  it("should return an error for invalid date format", () => {
    const transaction: CSVRecord = {
      date: "2025-01-10", // Incorrect format
      description: "Purchased an ice cream",
      amount: "200",
      currency: "USD",
    };

    const result = validate_transaction_schema(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid date");
  });

  it("should return an error for non-numeric amount", () => {
    const transaction: CSVRecord = {
      date: "10-01-2025",
      description: "Purchased an ice cream",
      amount: "two hundred", // Invalid type
      currency: "USD",
    };

    const result = validate_transaction_schema(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Amount must be a number.");
  });

  it("should return an error for empty description or currency", () => {
    const transaction: CSVRecord = {
      date: "10-01-2025",
      description: "",
      amount: "200",
      currency: "",
    };

    const result = validate_transaction_schema(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Description cannot be empty.");
    expect(result.errors).toContain("Currency cannot be empty.");
  });

  it("should handle multiple validation errors", () => {
    const transaction: CSVRecord = {
      date: "2025/01/10", // Invalid format
      description: "",
      amount: "", // Missing
      currency: "",
    };

    const result = validate_transaction_schema(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Invalid date");
    expect(result.errors).toContain("Description cannot be empty.");
    expect(result.errors).toContain("Amount must be a number.");
    expect(result.errors).toContain("Currency cannot be empty.");
  });
});
