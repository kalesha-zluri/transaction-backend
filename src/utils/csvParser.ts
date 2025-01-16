import { Readable } from "stream";
import csvParser from "csv-parser";
import { CSVRecord, ParserResult, CSVError } from "../types/csv.types";
import { validateSchema, validateDataTypes } from "./validations";

const parseCSV = async (buffer: Buffer): Promise<ParserResult> => {
  const validRecords: CSVRecord[] = [];
  const errors: CSVError[] = [];
  let rowIndex = 0;
  const seenTransactions = new Set();
  const csvString = buffer.toString();

  return new Promise((resolve) => {
    const readable = Readable.from(csvString);

    readable
      .pipe(csvParser())
      .on("data", (data: CSVRecord) => {
        rowIndex++;
        let isValid = true;
        const transformedData: CSVRecord = {};

        // Transform keys to lowercase
        for (const key in data) {
          transformedData[key.toLowerCase()] = data[key].toLowerCase();
        }

        // Validate schema
        if (!validateSchema(transformedData)) {
          errors.push({
            row: rowIndex,
            data: transformedData,
            reason: "Missing required columns",
          });
          isValid = false;
        }

        // Validate data types
        if (isValid && !validateDataTypes(transformedData)) {
          errors.push({
            row: rowIndex,
            data: transformedData,
            reason:
              "Invalid data types. Please check date format (DD-MM-YYYY), amount (numeric)",
          });
          isValid = false;
        }

        // Check for duplicates
        const transactionKey = `${transformedData.date}-${transformedData.description}`;
        if (isValid && seenTransactions.has(transactionKey)) {
          errors.push({
            row: rowIndex,
            data: transformedData,
            reason: "Duplicate transaction",
          });
          isValid = false;
        }

        if (isValid) {
          seenTransactions.add(transactionKey);
          validRecords.push(transformedData);
        }
      })
      .on("end", () => {
        if (validRecords.length === 0 && csvString.trim() === "") {
          resolve({ data: [], errors, error: "CSV content is empty" });
        } else if (validRecords.length === 0 && csvString.trim() !== "") {
          resolve({ data: [], errors, error: "No valid transactions found" });
        } else {
          resolve({ data: validRecords, errors });
        }
      })
      .on("error", (error) => {
        resolve({
          data: [],
          errors,
          error: `CSV parsing error: ${error.message}`,
        });
      });
  });
};

export default parseCSV;
