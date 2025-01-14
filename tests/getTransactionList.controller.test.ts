import request from "supertest";
import express, { Application, Request, Response, NextFunction } from "express";
import { getTransactionList } from "../src/controllers/getTransactionList.controller";
import { getTransactions } from "../src/services/databaseOperations.service";

// Mock the getTransactions service
jest.mock("../src/services/databaseOperations.service");

const app: Application = express();
app.use(express.json());
app.get("/transactions", getTransactionList);

// Error handling middleware for testing
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: "Unexpected Error!" });
});

describe("getTransactionList Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of transactions with pagination", async () => {
    const mockTransactions = [
      {
        id: 1,
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      },
      {
        id: 2,
        Date: "02-01-2021",
        Description: "Test 2",
        Amount: "200",
        Currency: "USD",
      },
    ];
    const mockTotalCount = 2;

    (getTransactions as jest.Mock).mockResolvedValue({
      transactions: mockTransactions,
      totalCount: mockTotalCount,
    });

    const response = await request(app).get("/transactions?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body.transactions).toEqual(mockTransactions);
    expect(response.body.totalCount).toBe(mockTotalCount);
    expect(response.body.currentPage).toBe(1);
    expect(response.body.totalPages).toBe(1);
  });

  it("should handle invalid query parameters gracefully", async () => {
    const response = await request(app).get(
      "/transactions?page=invalid&limit=invalid"
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid query parameters");
  });

  it("should handle missing query parameters gracefully", async () => {
    const response = await request(app).get("/transactions");

    expect(response.status).toBe(200);
    expect(response.body.currentPage).toBe(1);
    expect(response.body.totalPages).toBe(1);
  });

  it("should handle negative query parameters gracefully", async () => {
    const response = await request(app).get("/transactions?page=-1&limit=-10");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid query parameters");
  });

  it("should handle zero query parameters gracefully", async () => {
    const response = await request(app).get("/transactions?page=0&limit=0");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid query parameters");
  });

  it("should handle errors gracefully", async () => {
    (getTransactions as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app).get("/transactions?page=1&limit=10");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Unexpected Error!" });
  });
});
