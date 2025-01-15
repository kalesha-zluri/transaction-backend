import { Request, Response, NextFunction } from "express";
import { getTransactionList } from "../../src/controllers/getTransactionList.controller";
import { getTransactions } from "../../src/services/databaseOperations.service";

jest.mock("../../src/services/databaseOperations.service");

describe("getTransactionList controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("returns 400 if query parameters are invalid", async () => {
    mockReq.query = { page: "-1", limit: "10" };

    await getTransactionList(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid query parameters",
    });
  });

  it("returns 200 with transactions and pagination info", async () => {
    mockReq.query = { page: "1", limit: "10" };
    (getTransactions as jest.Mock).mockResolvedValue({
      transactions: [{ id: 1, description: "Test transaction" }],
      totalCount: 1,
    });

    await getTransactionList(mockReq as Request, mockRes as Response, mockNext);

    expect(getTransactions).toHaveBeenCalledWith(1, 10);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      transactions: [{ id: 1, description: "Test transaction" }],
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
    });
  });

  it("uses default values for page and limit if not provided", async () => {
    (getTransactions as jest.Mock).mockResolvedValue({
      transactions: [{ id: 1, description: "Test transaction" }],
      totalCount: 1,
    });

    await getTransactionList(mockReq as Request, mockRes as Response, mockNext);

    expect(getTransactions).toHaveBeenCalledWith(1, 10);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      transactions: [{ id: 1, description: "Test transaction" }],
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
    });
  });

  it("calls next if an error is thrown", async () => {
    mockReq.query = { page: "1", limit: "10" };
    const error = new Error("Unexpected error");
    (getTransactions as jest.Mock).mockRejectedValue(error);

    await getTransactionList(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
