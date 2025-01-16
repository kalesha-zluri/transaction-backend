import parseCSV from "../../src/utils/csvParser";

describe("parseCSV", () => {
  it("should parse valid CSV data successfully", async () => {
    const csvData = Buffer.from(`date,description,amount,currency
01-01-2021,Test Transaction,100,USD`);

    const result = await parseCSV(csvData);

    expect(result.data).toHaveLength(1);
    expect(result.errors?.length || 0).toBe(0); // Safely checking errors
  });

  it("should return an error for missing required columns", async () => {
    const csvData = Buffer.from(`date,description,amount
01-01-2021,Test Transaction,100`);

    const result = await parseCSV(csvData);

    expect(result.data).toHaveLength(0);
    expect(result.errors?.length || 0).toBeGreaterThan(0); // Safely checking errors
    expect(result.errors?.[0].reason).toBe("Missing required columns");
  });

  it("should return an error for invalid data types", async () => {
    const csvData = Buffer.from(`date,description,amount,currency
01-01-2021,Test Transaction,not-a-number,USD`);

    const result = await parseCSV(csvData);

    expect(result.data).toHaveLength(0);
    expect(result.errors?.length || 0).toBeGreaterThan(0); // Safely checking errors
    expect(result.errors?.[0].reason).toBe(
      "Invalid data types. Please check date format (DD-MM-YYYY), amount (numeric)"
    );
  });

  it("should return an error for duplicate transactions", async () => {
    const csvData = Buffer.from(`date,description,amount,currency
01-01-2021,Test Transaction,100,USD
01-01-2021,Test Transaction,100,USD`);

    const result = await parseCSV(csvData);

    expect(result.data).toHaveLength(1);
    expect(result.errors?.length || 0).toBeGreaterThan(0); // Safely checking errors
    expect(result.errors?.[0].reason).toBe("Duplicate transaction");
  });

  it("should return an error for empty CSV content", async () => {
    const csvData = Buffer.from("");

    const result = await parseCSV(csvData);

    expect(result.data).toHaveLength(0);
    expect(result.errors?.length || 0).toBe(0); // Safely checking errors
    expect(result.error).toBe("CSV content is empty");
  });

  it("should return an error for no valid transactions", async () => {
    const csvData = Buffer.from(`date,description,amount,currency
,Test Transaction,,USD`);

    const result = await parseCSV(csvData);

    expect(result.data).toHaveLength(0);
    expect(result.errors?.length || 0).toBeGreaterThan(0); // Safely checking errors
    expect(result.error).toBe("No valid transactions found");
  });
});
