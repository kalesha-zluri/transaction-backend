import { Request, Response, NextFunction } from "express";
import { uploadTransactions } from "../src/controllers/uploadTransactions.controller";
import { saveTransactions } from "../src/services/savetransactions.service";

jest.mock("../src/services/saveTransactions.service");

describe("uploadTransactions", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        transactions: [
          {
            Date: "01-01-2021",
            Description: "Test",
            Amount: "100",
            Currency: "USD",
          },
        ],
      },
    } as Partial<Request>;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
    next = jest.fn();
  });

  it("should upload and save transactions", async () => {
    await uploadTransactions(req as Request, res as Response, next);
    expect(saveTransactions).toHaveBeenCalledWith(req.body.transactions);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "File uploaded and transactions saved successfully",
    });
  });

  it("should handle errors during upload", async () => {
    (saveTransactions as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );
    await uploadTransactions(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(new Error("Database error"));
  });
});
