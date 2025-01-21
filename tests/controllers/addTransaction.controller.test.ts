import { Request, Response } from "express";
import { addTransaction } from "../../src/controllers/addTransaction.controller";
import * as validateSchema from "../../src/utils/validateSchema";
import * as dbOperations from "../../src/services/databaseOperations.service";

jest.mock("../../src/utils/validateSchema");
jest.mock("../../src/services/databaseOperations.service");

describe("Add Transaction Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {
        date: "01-01-2024",
        description: "Test Transaction",
        amount: "100",
        currency: "USD",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it("should successfully add a valid transaction", async () => {
    const mockNewTransaction = {
      id: 1,
      ...mockRequest.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (validateSchema.validate_transaction_schema as jest.Mock).mockReturnValue({
      valid: true,
    });
    (dbOperations.checkDuplicateTransaction as jest.Mock).mockResolvedValue(
      false
    );
    (dbOperations.createTransaction as jest.Mock).mockResolvedValue(
      mockNewTransaction
    );

    await addTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Transaction added successfully",
      data: mockNewTransaction,
    });
  });

  it("should return 400 for invalid schema", async () => {
    (validateSchema.validate_transaction_schema as jest.Mock).mockReturnValue({
      valid: false,
      errors: ["Invalid date", "Amount is required"],
    });

    await addTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Invalid date, Amount is required",
    });
  });

  it("should return 400 for duplicate transaction", async () => {
    (validateSchema.validate_transaction_schema as jest.Mock).mockReturnValue({
      valid: true,
    });
    (dbOperations.checkDuplicateTransaction as jest.Mock).mockResolvedValue(
      true
    );

    await addTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Duplicate transaction found",
    });
  });

  it("should return 500 for server error", async () => {
    (validateSchema.validate_transaction_schema as jest.Mock).mockReturnValue({
      valid: true,
    });
    (dbOperations.checkDuplicateTransaction as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await addTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Internal server error: Failed to add transaction",
    });
  });
});
