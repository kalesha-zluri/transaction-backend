import { Request, Response, NextFunction } from "express";
import { addTransaction } from "../../src/controllers/addTransaction.controller";
import { validateSchema, validateDataTypes } from "../../src/utils/validations";
import {
  checkDuplicateTransaction,
  createTransaction,
} from "../../src/services/databaseOperations.service";
import { CSVRecord } from "../../src/types/csv.types";

jest.mock("../../src/utils/validations");
jest.mock("../../src/services/databaseOperations.service");

describe("addTransaction controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("returns 400 if schema validation fails", async () => {
    (validateSchema as jest.Mock).mockReturnValue(false);
    (validateDataTypes as jest.Mock).mockReturnValue(true);

    await addTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Missing required fields: date, description, amount, currency",
    });
  });

  it("returns 400 if data type validation fails", async () => {
    (validateSchema as jest.Mock).mockReturnValue(true);
    (validateDataTypes as jest.Mock).mockReturnValue(false);

    await addTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error:
        "Invalid data types. Please check date format (DD-MM-YYYY), amount (numeric), and description",
    });
  });

  it("returns 400 if duplicate transaction found", async () => {
    (validateSchema as jest.Mock).mockReturnValue(true);
    (validateDataTypes as jest.Mock).mockReturnValue(true);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(true);

    await addTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Duplicate transaction found",
    });
  });

  it("creates transaction and returns 201 if no issues", async () => {
    (validateSchema as jest.Mock).mockReturnValue(true);
    (validateDataTypes as jest.Mock).mockReturnValue(true);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(false);
    (createTransaction as jest.Mock).mockResolvedValue({
      id: 1,
      date: "2020-01-01",
      description: "Created",
    });

    mockReq.body = {
      date: "2020-01-01",
      description: "Created",
      amount: "100",
      currency: "USD",
    } as CSVRecord;

    await addTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(createTransaction).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Transaction added successfully",
      data: {
        id: 1,
        date: "2020-01-01",
        description: "Created",
      },
    });
  });

  it("calls next(error) if an error is thrown", async () => {
    const error = new Error("Unexpected error");
    (validateSchema as jest.Mock).mockImplementation(() => {
      throw error;
    });

    await addTransaction(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
