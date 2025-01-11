import parseCSV from "../src/utils/csvParser";

const validCSVBuffer = Buffer.from(
  `name,age,city\nJohn,30,New York\nAlice,25,Los Angeles`
);
const emptyCSVBuffer = Buffer.from("");

describe("parseCSV", () => {
  test("should parse a valid CSV buffer correctly", async () => {
    const expectedOutput = {
      data: [
        { name: "John", age: "30", city: "New York" },
        { name: "Alice", age: "25", city: "Los Angeles" },
      ],
    };
    const result = await parseCSV(validCSVBuffer);
    expect(result).toEqual(expectedOutput);
  });

  test("should return an error for an empty CSV buffer", async () => {
    const result = await parseCSV(emptyCSVBuffer);
    expect(result).toEqual({
      data: [],
      error: "CSV content is empty",
    });
  });

  test("should handle special characters in CSV content", async () => {
    const specialCharsBuffer = Buffer.from(
      `name,description\nJohn,"He said, ""Hello!"""`
    );
    const expectedOutput = {
      data: [{ name: "John", description: 'He said, "Hello!"' }],
    };
    const result = await parseCSV(specialCharsBuffer);
    expect(result).toEqual(expectedOutput);
  });

  test("should return an error for invalid CSV format", async () => {
    const invalidBuffer = Buffer.from(`{ invalid: "json" }`);
    const result = await parseCSV(invalidBuffer);
    expect(result).toEqual({
      data: [],
      error: expect.stringContaining("CSV parsing error: No data found"),
    });
  });
});
