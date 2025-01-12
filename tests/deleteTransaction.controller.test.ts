import { Request, Response, NextFunction } from "express";
import { softDeleteTransaction } from "../src/services/databaseOperations.service";

jest.mock("../src/services/databaseOperations.service", () => ({
  softDeleteTransaction: jest.fn(),
}));

import { deleteTransaction } from "../src/controllers/deleteTransaction.controller";

describe("deleteTransaction controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { params: { id: "1" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a transaction and return success response", async () => {
    const mockTransaction = {
      id: 1,
      Date: "01-01-2021",
      Description: "Test",
      Amount: "100",
      Currency: "USD",
      isDeleted: true,
    };

    (softDeleteTransaction as jest.Mock).mockResolvedValueOnce(mockTransaction);

    await deleteTransaction(req as Request, res as Response, next);

    expect(softDeleteTransaction).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Transaction deleted successfully",
      data: mockTransaction,
    });
  });

  it("should return 404 if transaction is not found", async () => {
    (softDeleteTransaction as jest.Mock).mockResolvedValueOnce(null);

    await deleteTransaction(req as Request, res as Response, next);

    expect(softDeleteTransaction).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Transaction not found" });
  });

  it("should call next with an error if an exception occurs", async () => {
    const error = new Error("Database error");
    (softDeleteTransaction as jest.Mock).mockRejectedValueOnce(error);

    await deleteTransaction(req as Request, res as Response, next);

    expect(softDeleteTransaction).toHaveBeenCalledWith(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});
