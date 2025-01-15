import { CSVRecord } from "../types/csv.types";
export const validateSchema = (data: CSVRecord): boolean => {
  const requiredColumns = ["date", "description", "amount", "currency"];

  const dataKeys = Object.keys(data).map((key) => key.toLowerCase());

  return requiredColumns.every((column) =>
    dataKeys.includes(column.toLowerCase())
  );
};

export const validateDataTypes = (transaction: CSVRecord): boolean => {
  const validateDateFormat = (dateString: string): boolean => {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const [day, month, year] = dateString.split("-").map(Number);
    if (month < 1 || month > 12) {
      return false;
    }
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
  };

  if (!validateDateFormat(transaction.date)) {
    return false;
  }

  if (isNaN(parseFloat(transaction.amount))) {
    return false;
  }

  if (
    typeof transaction.description !== "string" ||
    transaction.description.length === 0
  ) {
    return false;
  }

  return true;
};
