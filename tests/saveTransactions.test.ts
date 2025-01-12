import { PrismaClient } from "@prisma/client";
import {
  saveTransactions,
  createTransaction,
  checkDuplicateTransaction,
} from "../src/services/databaseOperations.service";

jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    transaction: {
      createMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe("saveTransactions service", () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("saveTransactions", () => {
    it("should save transactions to the database", async () => {
      const transactions = [
        {
          Date: "01-01-2021",
          Description: "Test",
          Amount: "100",
          Currency: "USD",
        },
      ];
      await saveTransactions(transactions);
      expect(prisma.transaction.createMany).toHaveBeenCalledWith({
        data: transactions,
      });
    });

    it("should handle errors during saving", async () => {
      const transactions = [
        {
          Date: "01-01-2021",
          Description: "Test",
          Amount: "100",
          Currency: "USD",
        },
      ];
      (prisma.transaction.createMany as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );
      await expect(saveTransactions(transactions)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("createTransaction", () => {
    it("should create a transaction in the database", async () => {
      const transaction = {
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      };
      await createTransaction(transaction);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: transaction,
      });
    });

    it("should handle errors during transaction creation", async () => {
      const transaction = {
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      };
      (prisma.transaction.create as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );
      await expect(createTransaction(transaction)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("checkDuplicateTransaction", () => {
    it("should return true if a duplicate transaction is found", async () => {
      const transaction = {
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      };
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValueOnce(
        transaction
      );
      const result = await checkDuplicateTransaction(transaction);
      expect(result).toBe(true);
    });

    it("should return false if no duplicate transaction is found", async () => {
      const transaction = {
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      };
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValueOnce(null);
      const result = await checkDuplicateTransaction(transaction);
      expect(result).toBe(false);
    });

    it("should handle errors during duplicate check", async () => {
      const transaction = {
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      };
      (prisma.transaction.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );
      await expect(checkDuplicateTransaction(transaction)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
