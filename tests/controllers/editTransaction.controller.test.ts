import { Request, Response, NextFunction } from "express";
import { editTransaction } from "../../src/controllers/editTransaction.controller";
import {
  updateTransaction,
  checkDuplicateTransaction,
  getTransactionById,
} from "../../src/services/databaseOperations.service";
import { validateSchema, validateDataTypes } from "../../src/utils/validations";
import { CSVRecord } from "../../src/types/csv.types";

jest.mock("../../src/services/databaseOperations.service");
jest.mock("../../src/utils/validations");

describe("editTransaction controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { params: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("returns 404 if transaction is not found", async () => {
    mockReq.params = { id: "123" };
    (getTransactionById as jest.Mock).mockResolvedValue(null);

    await editTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Transaction not found",
    });
  });

  it("returns 400 if transaction is already deleted", async () => {
    mockReq.params = { id: "123" };
    (getTransactionById as jest.Mock).mockResolvedValue({ isDeleted: true });

    await editTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Transaction already deleted",
    });
  });

  it("returns 400 if schema validation fails", async () => {
    mockReq.params = { id: "123" };
    (getTransactionById as jest.Mock).mockResolvedValue({ isDeleted: false });
    (validateSchema as jest.Mock).mockReturnValue(false);

    await editTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing required fields: date, description, amount, currency",
    });
  });

  it("returns 400 if data type validation fails", async () => {
    mockReq.params = { id: "123" };
    (getTransactionById as jest.Mock).mockResolvedValue({ isDeleted: false });
    (validateSchema as jest.Mock).mockReturnValue(true);
    (validateDataTypes as jest.Mock).mockReturnValue(false);

    await editTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error:
        "Invalid data types. Please check date format (DD-MM-YYYY), amount (numeric), and description",
    });
  });

  it("returns 400 if duplicate transaction is found", async () => {
    mockReq.params = { id: "123" };
    (getTransactionById as jest.Mock).mockResolvedValue({ isDeleted: false });
    (validateSchema as jest.Mock).mockReturnValue(true);
    (validateDataTypes as jest.Mock).mockReturnValue(true);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(true);

    await editTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Duplicate transaction found",
    });
  });

  it("updates transaction and returns 200 if no issues", async () => {
    mockReq.params = { id: "123" };
    mockReq.body = {
      date: "2020-01-01",
      description: "Updated",
      amount: "100",
      currency: "USD",
    } as CSVRecord;
    (getTransactionById as jest.Mock).mockResolvedValue({ isDeleted: false });
    (validateSchema as jest.Mock).mockReturnValue(true);
    (validateDataTypes as jest.Mock).mockReturnValue(true);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(false);
    (updateTransaction as jest.Mock).mockResolvedValue({
      id: 123,
      date: "2020-01-01",
      description: "Updated",
    });

    await editTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(updateTransaction).toHaveBeenCalledWith(123, mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Transaction updated successfully",
      data: {
        id: 123,
        date: "2020-01-01",
        description: "Updated",
      },
    });
  });

  it("calls next if an error is thrown", async () => {
    mockReq.params = { id: "123" };
    const error = new Error("Unexpected error");
    (getTransactionById as jest.Mock).mockRejectedValue(error);

    await editTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
