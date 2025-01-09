import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { parse } from 'date-fns';

const parseCSV = async (buffer: Buffer): Promise<any[]> => {
  const results: any[] = [];
  let csvString = buffer.toString();
  // Remove BOM if it exists
  if (csvString.charCodeAt(0) === 0xfeff) {
    csvString = csvString.slice(1);
  }
  return new Promise((resolve, reject) => {
    Readable.from(csvString)
      .pipe(csvParser())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

export default parseCSV;
