import request from "supertest";
import express, { Application, Request, Response, NextFunction } from "express";
import { editTransaction } from "../src/controllers/editTransaction.controller";
import {
  updateTransaction,
  checkDuplicateTransaction,
} from "../src/services/databaseOperations.service";
import { validateTransaction } from "../src/middlewares/transactionValidator";

// Mock the services and validator
jest.mock("../src/services/databaseOperations.service");
jest.mock("../src/validators/transaction.validator");

const app: Application = express();
app.use(express.json());
app.put("/transactions/:id", editTransaction);

// Error handling middleware for testing
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: "Unexpected Error!" });
});

describe("editTransaction Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: { id: "1" },
      body: {
        transaction: {
          Date: "01-01-2021",
          Description: "Test",
          Amount: "100",
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

  it("should update a transaction successfully", async () => {
    const mockTransaction = {
      id: 1,
      Date: "01-01-2021",
      Description: "Test",
      Amount: "100",
      Currency: "USD",
    };

    (validateTransaction as jest.Mock).mockReturnValue(null);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(false);
    (updateTransaction as jest.Mock).mockResolvedValue(mockTransaction);

    const response = await request(app)
      .put("/transactions/1")
      .send({ transaction: mockTransaction });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Transaction updated successfully");
    expect(response.body.data).toEqual(mockTransaction);
  });

  it("should return validation error", async () => {
    (validateTransaction as jest.Mock).mockReturnValue("Validation error");

    const response = await request(app)
      .put("/transactions/1")
      .send({ transaction: {} });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation error");
  });

  it("should return duplicate transaction error", async () => {
    (validateTransaction as jest.Mock).mockReturnValue(null);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .put("/transactions/1")
      .send({ transaction: {} });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Duplicate transaction found");
  });

  it("should handle errors gracefully", async () => {
    (validateTransaction as jest.Mock).mockReturnValue(null);
    (checkDuplicateTransaction as jest.Mock).mockResolvedValue(false);
    (updateTransaction as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .put("/transactions/1")
      .send({ transaction: {} });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Unexpected Error!" });
  });
});
