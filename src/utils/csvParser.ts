import { Readable } from "stream";
import csvParser from "csv-parser";

const parseCSV = async (
  buffer: Buffer
): Promise<{ data: any[]; error?: string }> => {
  const results: any[] = [];
  const csvString = buffer.toString();

  return new Promise((resolve) => {
    const readable = Readable.from(csvString);

    readable
      .pipe(csvParser())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        if(results.length==0 && csvString.trim() === "") {
          resolve({ data: [], error: "CSV content is empty" });
        }
        else if(results.length==0 && csvString.trim() !== "") {
          resolve({ data: [], error: "CSV parsing error: No data found" });
        }
        else {
          resolve({ data: results });
        }
      })
      .on("error", (error) => {
        // Return an error in the result
        resolve({ data: [], error: `CSV parsing error: ${error.message}` });
      });
  });
};

export default parseCSV;
