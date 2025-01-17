import { CSVRecord } from "../types/csv.types";

export const toLowerCase = (data: CSVRecord): CSVRecord => {
  const transformedData: CSVRecord = {};

  for (const key in data) {
    transformedData[key.toLowerCase()] = data[key].toLowerCase();
  }

  return transformedData;
}