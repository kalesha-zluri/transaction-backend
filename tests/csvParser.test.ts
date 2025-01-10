import parseCSV from "../src/utils/csvParser";

describe("parseCSV", () => {
  it("should parse valid CSV data", async () => {
    const buffer = Buffer.from(
      "Date,Description,Amount,Currency\n01-01-2021,Test,100,USD"
    );
    const result = await parseCSV(buffer);
    expect(result).toEqual([
      {
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      },
    ]);
  });

  it("should handle errors during parsing", async () => {
    const buffer = Buffer.from("Invalid CSV data");
    await expect(parseCSV(buffer)).rejects.toThrow();
  });
});
