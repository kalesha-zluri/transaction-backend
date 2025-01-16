import { Request, Response, NextFunction } from "express";
import { deleteTransaction } from "../../src/controllers/deleteTransaction.controller";
import { softDeleteTransaction } from "../../src/services/databaseOperations.service";

jest.mock("../../src/services/databaseOperations.service");

describe("deleteTransaction controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { params: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("returns 400 if id is missing", async () => {
    await deleteTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid or missing transaction ID",
    });
  });

  it("returns 400 if id is not a number", async () => {
    mockReq.params = { id: "abc" };

    await deleteTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Invalid or missing transaction ID",
    });
  });

  it("returns 400 if softDeleteTransaction returns an error object", async () => {
    mockReq.params = { id: "123" };
    (softDeleteTransaction as jest.Mock).mockResolvedValue({
      error: "Transaction not found",
    });

    await deleteTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(softDeleteTransaction).toHaveBeenCalledWith(123);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Transaction not found",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 200 if transaction is deleted successfully", async () => {
    mockReq.params = { id: "123" };
    (softDeleteTransaction as jest.Mock).mockResolvedValue({
      id: 123,
      deleted: true,
    });

    await deleteTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(softDeleteTransaction).toHaveBeenCalledWith(123);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Transaction deleted successfully",
      data: { id: 123, deleted: true },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("calls next if an error is thrown", async () => {
    mockReq.params = { id: "123" };
    const error = new Error("Unexpected error");
    (softDeleteTransaction as jest.Mock).mockRejectedValue(error);

    await deleteTransaction(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
