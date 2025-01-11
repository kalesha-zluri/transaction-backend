import { addTransaction } from "../src/controllers/addTransaction.controller";
import { validateTransaction } from "../src/validators/transaction.validator";
import {
  checkDuplicateTransaction,
  createTransaction,
} from "../src/services/savetransactions.service";
import { Request, Response, NextFunction } from "express";

jest.mock("../src/validators/transaction.validator");
jest.mock("../src/services/savetransactions.service");

describe("addTransaction Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        transaction: {
          Date: "12-12-2024",
          Description: "Grocery shopping",
          Amount: "150.50",
          Currency: "USD",
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("should return a 400 error if validation fails", async () => {
    (validateTransaction as jest.Mock).mockReturnValue(
      "Missing required field:Date"
    );

    await addTransaction(req as Request, res as Response, next);

    expect(validateTransaction).toHaveBeenCalledWith(req.body.transaction);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required field:Date",
    });
  });

  it("should return a 400 error if a duplicate transaction is found", async () => {
    (validateTransaction as jest.Mock).mockReturnValue(null);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(true);

    await addTransaction(req as Request, res as Response, next);

    expect(validateTransaction).toHaveBeenCalledWith(req.body.transaction);
    expect(checkDuplicateTransaction).toHaveBeenCalledWith(
      req.body.transaction
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Duplicate transaction found",
    });
  });

  it("should save the transaction and return a 201 status", async () => {
    const newTransaction = { id: 1, ...req.body.transaction };

    (validateTransaction as jest.Mock).mockReturnValue(null);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(false);
    (createTransaction as jest.Mock).mockResolvedValue(newTransaction);

    await addTransaction(req as Request, res as Response, next);

    expect(validateTransaction).toHaveBeenCalledWith(req.body.transaction);
    expect(checkDuplicateTransaction).toHaveBeenCalledWith(
      req.body.transaction
    );
    expect(createTransaction).toHaveBeenCalledWith(req.body.transaction);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Transaction added successfully",
      data: newTransaction,
    });
  });

  it("should call next with an error if an exception occurs", async () => {
    const error = new Error("Database error");

    (validateTransaction as jest.Mock).mockReturnValue(null);
    (checkDuplicateTransaction as jest.Mock).mockRejectedValue(error);

    await addTransaction(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
