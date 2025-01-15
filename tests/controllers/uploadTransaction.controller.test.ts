import { Request, Response, NextFunction } from "express";
import { uploadTransactions } from "../../src/controllers/uploadTransactions.controller";
import { saveTransactions } from "../../src/services/databaseOperations.service";

jest.mock("../../src/services/databaseOperations.service");

describe("uploadTransactions controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {
        transactions: [{ date: "2020-01-01", description: "Mock transaction" }],
        errors: [{ row: "1", reason: "Sample error" }],
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("should save transactions and return a success response", async () => {
    (saveTransactions as jest.Mock).mockResolvedValue([{ id: 1 }]);
    await uploadTransactions(mockReq as Request, mockRes as Response, mockNext);

    expect(saveTransactions).toHaveBeenCalledWith(mockReq.body.transactions);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "File uploaded and transactions saved successfully",
      result: [{ id: 1 }],
      errorMessage: "These transactions are having validation errors",
      errors: [{ row: "1", reason: "Sample error" }],
    });
  });

  it("should call next with error if saveTransactions throws", async () => {
    const error = new Error("Database error");
    (saveTransactions as jest.Mock).mockRejectedValue(error);

    await uploadTransactions(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
