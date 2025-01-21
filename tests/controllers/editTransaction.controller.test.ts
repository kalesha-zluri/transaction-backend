import { Request, Response } from "express";
import { editTransaction } from "../../src/controllers/editTransaction.controller";
import * as validateSchema from "../../src/utils/validateSchema";
import * as dbOperations from "../../src/services/databaseOperations.service";

jest.mock("../../src/utils/validateSchema");
jest.mock("../../src/services/databaseOperations.service");

describe("Edit Transaction Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      params: { id: "1" },
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
  });

  it("should successfully update a valid transaction", async () => {
    const mockUpdatedTransaction = {
      id: 1,
      ...mockRequest.body,
      updatedAt: new Date(),
    };

    (validateSchema.validate_transaction_schema as jest.Mock).mockReturnValue({
      valid: true,
    });
    (dbOperations.getTransactionById as jest.Mock).mockResolvedValue({
      id: 1,
      isDeleted: false,
    });
    (dbOperations.checkDuplicateTransaction as jest.Mock).mockResolvedValue(
      false
    );
    (dbOperations.updateTransaction as jest.Mock).mockResolvedValue(
      mockUpdatedTransaction
    );

    await editTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Transaction updated successfully",
      data: mockUpdatedTransaction,
    });
  });

  it("should return 400 for invalid transaction ID", async () => {
    mockRequest.params = { id: "invalid" };

    await editTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Invalid or missing transaction ID",
    });
  });

  it("should return 404 for non-existent transaction", async () => {
    (dbOperations.getTransactionById as jest.Mock).mockResolvedValue(null);

    await editTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Transaction not found",
    });
  });

  it("should return 400 for deleted transaction", async () => {
    (dbOperations.getTransactionById as jest.Mock).mockResolvedValue({
      id: 1,
      isDeleted: true,
    });

    await editTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Transaction already deleted",
    });
  });

  it("should return 400 for invalid schema", async () => {
    (dbOperations.getTransactionById as jest.Mock).mockResolvedValue({
      id: 1,
      isDeleted: false,
    });
    (validateSchema.validate_transaction_schema as jest.Mock).mockReturnValue({
      valid: false,
      errors: ["Invalid date format"],
    });

    await editTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Invalid date format",
    });
  });

  it("should return 400 for duplicate transaction", async () => {
    (dbOperations.getTransactionById as jest.Mock).mockResolvedValue({
      id: 1,
      isDeleted: false,
    });
    (validateSchema.validate_transaction_schema as jest.Mock).mockReturnValue({
      valid: true,
    });
    (dbOperations.checkDuplicateTransaction as jest.Mock).mockResolvedValue(
      true
    );

    await editTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Duplicate transaction found",
    });
  });

  it("should return 500 for server error", async () => {
    (dbOperations.getTransactionById as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await editTransaction(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Internal server error: Failed to update transaction",
    });
  });
});
