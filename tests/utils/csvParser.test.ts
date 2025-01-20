import parseCSV from "../../src/utils/csvParser";
import { validate_transaction_schema } from "../../src/utils/validateSchema";

jest.mock("../../src/utils/validateSchema");

describe("parseCSV", () => {
  const mockValidateSchema = validate_transaction_schema as jest.Mock;

  beforeEach(() => {
    mockValidateSchema.mockReset();
  });

  it("should parse valid CSV data correctly", async () => {
    const csvBuffer = Buffer.from(
      "date,description,amount,currency\n2025-01-01,Test Transaction,100,USD\n2025-01-02,Another Transaction,200,EUR"
    );

    mockValidateSchema.mockImplementation(() => ({ valid: true }));

    const result = await parseCSV(csvBuffer);

    expect(result.data).toEqual([
      {
        date: "2025-01-01",
        description: "test transaction",
        amount: "100",
        currency: "usd",
      },
      {
        date: "2025-01-02",
        description: "another transaction",
        amount: "200",
        currency: "eur",
      },
    ]);
    expect(result.errorRecord).toHaveLength(0);
  });

  it("should return an error for empty CSV content", async () => {
    const csvBuffer = Buffer.from("");

    const result = await parseCSV(csvBuffer);

    expect(result.error).toBe("CSV content is empty");
    expect(result.data).toHaveLength(0);
    expect(result.errorRecord).toHaveLength(0);
  });

  it("should return errors for invalid transactions", async () => {
    const csvBuffer = Buffer.from(
      "date,description,amount,currency\ninvalid-date,Test,invalid-amount,USD"
    );

    mockValidateSchema.mockImplementation(() => ({
      valid: false,
      errors: ["Invalid date", "Amount must be a number"],
    }));

    const result = await parseCSV(csvBuffer);

    expect(result.data).toHaveLength(0);
    expect(result.errorRecord).toEqual([
      {
        row: 1,
        transaction_data: {
          date: "invalid-date",
          description: "test",
          amount: "invalid-amount",
          currency: "usd",
        },
        reason: "Invalid date, Amount must be a number",
      },
    ]);
  });

  it("should detect and report duplicate transactions", async () => {
    const csvBuffer = Buffer.from(
      "date,description,amount,currency\n2025-01-01,Test Transaction,100,USD\n2025-01-01,Test Transaction,100,USD"
    );

    mockValidateSchema.mockImplementation(() => ({ valid: true }));

    const result = await parseCSV(csvBuffer);

    expect(result.data).toHaveLength(1); // Only one record saved
    expect(result.errorRecord).toEqual([
      {
        row: 2,
        transaction_data: {
          date: "2025-01-01",
          description: "test transaction",
          amount: "100",
          currency: "usd",
        },
        reason: "Duplicate transaction",
      },
    ]);
  });
});
