import JoiBase from "joi";
import JoiDate from "@joi/date";
import { CSVRecord } from "../types/csv.types";

const Joi = JoiBase.extend(JoiDate);

const transactionSchema = Joi.object({
  date: Joi.date().format("DD-MM-YYYY").required().messages({
    "date.format": "Invalid date",
    "any.required": "Date is required",
  }),
  description: Joi.string().min(1).required().messages({
    "string.empty": "Description cannot be empty.",
    "any.required": "Description is required",
  }),
  amount: Joi.number().required().messages({
    "number.base": "Amount must be a number.",
    "any.required": "Amount is required",
  }),
  currency: Joi.string().min(1).required().messages({
    "string.empty": "Currency cannot be empty.",
    "any.required": "Currency is required",
  }),
});

export const validate_transaction_schema = (
  transaction: CSVRecord
): { valid: boolean; errors?: string[] } => {
  const { error } = transactionSchema.validate(transaction, {
    abortEarly: false,
  });
  if (error) {
    return {
      valid: false,
      errors: error.details.map(
        (detail: JoiBase.ValidationErrorItem) => `${detail.message}`
      ),
    };
  }
  return { valid: true };
};
