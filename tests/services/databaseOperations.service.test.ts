import { PrismaClient } from "@prisma/client";
jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    transaction: {
      createMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

import {
  saveTransactions,
  createTransaction,
  checkDuplicateTransaction,
  softDeleteTransaction,
  getTransactions,
  updateTransaction,
  getAllTransactionKeys,
  getTransactionById,
} from "../../src/services/databaseOperations.service"
describe("Database operations service", () => {
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
          date: "2021-01-01",
          description: "Test",
          amount: 100,
          currency: "USD",
        },
      ];
      (prisma.transaction.createMany as jest.Mock).mockResolvedValueOnce({
        count: 1,
      });
      const result = await saveTransactions(transactions);
      expect(prisma.transaction.createMany).toHaveBeenCalledWith({
        data: transactions,
      });
      expect(result).toEqual({ count: 1 });
    });

    it("should throw an error if saving transactions fails", async () => {
      const transactions = [
        {
          date: "2021-01-01",
          description: "Test",
          amount: 100,
          currency: "USD",
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
        date: "2021-01-01",
        description: "Test",
        amount: 100,
        currency: "USD",
      };
      (prisma.transaction.create as jest.Mock).mockResolvedValueOnce(
        transaction
      );
      const result = await createTransaction(transaction);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: transaction,
      });
      expect(result).toEqual(transaction);
    });

    it("should throw an error if transaction creation fails", async () => {
      const transaction = {
        date: "2021-01-01",
        description: "Test",
        amount: 100,
        currency: "USD",
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
    it("should return true if a duplicate transaction exists", async () => {
      const transaction = { date: "2021-01-01", description: "Test" };
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValueOnce(
        transaction
      );
      const result = await checkDuplicateTransaction(transaction);
      expect(result).toBe(true);
    });

    it("should return false if no duplicate transaction exists", async () => {
      const transaction = { date: "2021-01-01", description: "Test" };
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValueOnce(null);
      const result = await checkDuplicateTransaction(transaction);
      expect(result).toBe(false);
    });

    it("should throw an error if duplicate check fails", async () => {
      const transaction = { date: "2021-01-01", description: "Test" };
      (prisma.transaction.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );
      await expect(checkDuplicateTransaction(transaction)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("softDeleteTransaction", () => {
    it("should soft delete a transaction", async () => {
      const transaction = { id: 1, isDeleted: false };
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValueOnce(
        transaction
      );
      (prisma.transaction.update as jest.Mock).mockResolvedValueOnce({
        ...transaction,
        isDeleted: true,
      });
      const result = await softDeleteTransaction(1);
      expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDeleted: true },
      });
      expect(result).toEqual({ ...transaction, isDeleted: true });
    });

    it("should return an error if the transaction does not exist", async () => {
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const result = await softDeleteTransaction(1);
      expect(result).toEqual({ error: "Transaction not found" });
    });

    it("should return an error if the transaction is already deleted", async () => {
      const transaction = { id: 1, isDeleted: true };
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValueOnce(
        transaction
      );
      const result = await softDeleteTransaction(1);
      expect(result).toEqual({ error: "Transaction already deleted" });
    });
  });

  describe("getTransactions", () => {
    it("should fetch transactions with pagination", async () => {
      const transactions = [{ id: 1, date: "2021-01-01", description: "Test" }];
      (prisma.transaction.findMany as jest.Mock).mockResolvedValueOnce(
        transactions
      );
      (prisma.transaction.count as jest.Mock).mockResolvedValueOnce(1);
      const result = await getTransactions(1, 10);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        orderBy: { date: "desc" },
        skip: 0,
        take: 10,
      });
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
      expect(result).toEqual({ transactions, totalCount: 1 });
    });
  });

  describe("updateTransaction", () => {
    it("should update a transaction", async () => {
      const transaction = { id: 1, description: "Updated" };
      (prisma.transaction.update as jest.Mock).mockResolvedValueOnce(
        transaction
      );
      const result = await updateTransaction(1, { description: "Updated" });
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { description: "Updated" },
      });
      expect(result).toEqual(transaction);
    });
  });

  describe("getAllTransactionKeys", () => {
    it("should fetch all transaction keys", async () => {
      const transactions = [
        { date: "2021-01-01", description: "Test" },
        { date: "2021-01-02", description: "Another Test" },
      ];
      (prisma.transaction.findMany as jest.Mock).mockResolvedValueOnce(
        transactions
      );
      const result = await getAllTransactionKeys();
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        select: { date: true, description: true },
      });
      expect(result).toEqual(
        new Set(["2021-01-01-Test", "2021-01-02-Another Test"])
      );
    });
  });

  describe("getTransactionById", () => {
    it("should fetch a transaction by ID", async () => {
      const transaction = { id: 1, date: "2021-01-01", description: "Test" };
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValueOnce(
        transaction
      );
      const result = await getTransactionById(1);
      expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(transaction);
    });
  });
});
