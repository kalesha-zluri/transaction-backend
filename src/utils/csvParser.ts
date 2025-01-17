import { Readable } from "stream";
import csvParser from "csv-parser";
import { CSVRecord, ParserResult, CSVError } from "../types/csv.types";
import { validate_transaction_schema } from "./validateSchema";

const parseCSV = async (buffer: Buffer): Promise<ParserResult> => {
  const validRecords: CSVRecord[] = [];
  const errorRecord: CSVError[] = [];
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

        // Transform keys and data to lowercase
        for (const key in data) {
          transformedData[key.toLowerCase()] = data[key].toLowerCase();
        }
        const { valid, errors } = validate_transaction_schema(transformedData);
        if(!valid && errors){
          const errorString = errors.join(", ");
          errorRecord.push({
            row:rowIndex,
            data:transformedData,
            reason: errorString
          });
          isValid=false;
        }
        
        // Check for duplicates
        const transactionKey = `${transformedData.date}-${transformedData.description}`;
        if (isValid && seenTransactions.has(transactionKey)) {
          errorRecord.push({
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
          resolve({ data: [], errorRecord, error: "CSV content is empty" });
        } else if (validRecords.length === 0 && csvString.trim() !== "") {
          resolve({ data: [], errorRecord, error: "No valid transactions found" });
        } else {
          resolve({ data: validRecords, errorRecord });
        }
      })
      .on("error", (error) => {
        resolve({
          data: [],
          errorRecord,
          error: `CSV parsing error: ${error.message}`,
        });
      });
  });
};

export default parseCSV;
