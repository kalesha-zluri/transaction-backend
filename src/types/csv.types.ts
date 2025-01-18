export interface CSVRecord {
  [key: string]: string;
}

export interface CSVError {
  row: number;
  transaction_data: CSVRecord;
  reason: string;
}

export interface ParserResult {
  data: CSVRecord[];
  errorRecord?: CSVError[];
  error?: string;
}
