import { PrismaClient } from "@prisma/client";
import * as exchangeRateUtil from "../../src/utils/exchangeRate";

// Mock exchange rate utility first
jest.mock("../../src/utils/exchangeRate");

// Create mock Prisma client
const mockPrismaClient = {
  transaction: {
    createMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

// Mock PrismaClient
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

// Import services after mocks are set up
import {
  saveTransactions,
  createTransaction,
  checkDuplicateTransaction,
  softDeleteTransaction,
  getTransactions,
  updateTransaction,
  getTransactionKeys,
  getTransactionById,
} from "../../src/services/databaseOperations.service";

describe("Transaction Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveTransactions", () => {
    it("should successfully save multiple transactions", async () => {
      const mockTransactions = [
        {
          date: "01-02-2024",
          description: "Test Transaction 1",
          amount: "100",
          currency: "USD",
        },
        {
          date: "02-02-2024",
          description: "Test Transaction 2",
          amount: "200",
          currency: "EUR",
        },
      ];

      const mockExchangeRate = 75;
      (exchangeRateUtil.getExchangeRate as jest.Mock).mockResolvedValue(
        mockExchangeRate
      );
      mockPrismaClient.transaction.createMany.mockResolvedValue({ count: 2 });

      const result = await saveTransactions(mockTransactions);

      expect(result).toEqual({ count: 2 });
      expect(mockPrismaClient.transaction.createMany).toHaveBeenCalled();
      expect(exchangeRateUtil.getExchangeRate).toHaveBeenCalledTimes(2);
    });

    it("should handle errors when saving transactions", async () => {
      const mockTransactions = [
        {
          date: "01-02-2024",
          description: "Test Transaction",
          amount: "100",
          currency: "USD",
        },
      ];

      (exchangeRateUtil.getExchangeRate as jest.Mock).mockRejectedValue(
        new Error("Exchange rate error")
      );

      await expect(saveTransactions(mockTransactions)).rejects.toThrow();
    });
  });

  describe("createTransaction", () => {
    it("should successfully create a single transaction", async () => {
      const mockTransaction = {
        date: "01-02-2024",
        description: "Test Transaction",
        amount: "100",
        currency: "USD",
      };

      const mockExchangeRate = 75;
      (exchangeRateUtil.getExchangeRate as jest.Mock).mockResolvedValue(
        mockExchangeRate
      );

      const expectedResult = {
        ...mockTransaction,
        id: 1,
        dateTime: new Date(2024, 1, 1),
        amountInr: 7500,
        isDeleted: false,
      };

      mockPrismaClient.transaction.create.mockResolvedValue(expectedResult);

      const result = await createTransaction(mockTransaction);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaClient.transaction.create).toHaveBeenCalled();
      expect(exchangeRateUtil.getExchangeRate).toHaveBeenCalledTimes(1);
    });
  });

  describe("checkDuplicateTransaction", () => {
    it("should return true for duplicate transaction", async () => {
      const mockTransaction = {
        date: "01-02-2024",
        description: "Test Transaction",
      };

      mockPrismaClient.transaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await checkDuplicateTransaction(mockTransaction);

      expect(result).toBe(true);
      expect(mockPrismaClient.transaction.findFirst).toHaveBeenCalledWith({
        where: {
          date: mockTransaction.date,
          description: mockTransaction.description,
          isDeleted: false,
          NOT: undefined,
        },
      });
    });

    it("should skip for current transaction", async () => {
      const mockTransaction = {
        date: "01-02-2024",
        description: "Test Transaction",
      };
      const transactionId = 1;
      mockPrismaClient.transaction.findFirst.mockResolvedValue(null);

      const result = await checkDuplicateTransaction(mockTransaction,transactionId);

      expect(result).toBe(false);
      expect(mockPrismaClient.transaction.findFirst).toHaveBeenCalledWith({
        where: {
          date: mockTransaction.date,
          description: mockTransaction.description,
          isDeleted: false,
          NOT: {id:transactionId},
        },
      });
    });

    it("should return false for non-duplicate transaction", async () => {
      const mockTransaction = {
        date: "01-02-2024",
        description: "Test Transaction",
      };

      mockPrismaClient.transaction.findFirst.mockResolvedValue(null);

      const result = await checkDuplicateTransaction(mockTransaction);

      expect(result).toBe(false);
    });
  });

  describe("softDeleteTransaction", () => {
    it("should successfully soft delete a transaction", async () => {
      const mockTransaction = {
        id: 1,
        isDeleted: false,
      };

      mockPrismaClient.transaction.findUnique.mockResolvedValue(
        mockTransaction
      );
      mockPrismaClient.transaction.update.mockResolvedValue({
        ...mockTransaction,
        isDeleted: true,
      });

      const result = await softDeleteTransaction(1);

      if ('isDeleted' in result) {
        expect(result.isDeleted).toBe(true);
      } else {
        throw new Error("Transaction not found");
      }
      expect(mockPrismaClient.transaction.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDeleted: true },
      });
    });

    it("should handle non-existent transaction", async () => {
      mockPrismaClient.transaction.findUnique.mockResolvedValue(null);

      const result = await softDeleteTransaction(1);

      expect(result).toEqual({ error: "Transaction not found" });
    });

    it("should handle deleted transaction", async () => {
        const mockTransaction = {
          id: 1,
          isDeleted: true,
        };
      mockPrismaClient.transaction.findUnique.mockResolvedValue(
        mockTransaction
      );

      const result = await softDeleteTransaction(1);

      if (mockTransaction.isDeleted) {
        expect(mockTransaction.isDeleted).toEqual(true);
      } else {
        throw new Error("Transaction not found");
      }
    });
  });

  describe("getTransactions", () => {
    it("should return paginated transactions with total count", async () => {
      const mockTransactions = [
        { id: 1, description: "Test 1" },
        { id: 2, description: "Test 2" },
      ];

      mockPrismaClient.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaClient.transaction.count.mockResolvedValue(10);

      const result = await getTransactions(1, 2);

      expect(result).toEqual({
        transactions: mockTransactions,
        totalCount: 10,
      });
      expect(mockPrismaClient.transaction.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        orderBy: { dateTime: "desc" },
        skip: 0,
        take: 2,
      });
    });
  });

  describe("updateTransaction", () => {
    it("should successfully update a transaction", async () => {
      const mockTransaction = {
        id: 1,
        date: "01-02-2024",
        description: "Updated Transaction",
        amount: "150",
        currency: "USD",
      };

      const mockExchangeRate = 75;
      (exchangeRateUtil.getExchangeRate as jest.Mock).mockResolvedValue(
        mockExchangeRate
      );

      const expectedResult = {
        ...mockTransaction,
        dateTime: new Date(2024, 1, 1),
        amountInr: 11250,
      };

      mockPrismaClient.transaction.update.mockResolvedValue(expectedResult);

      const result = await updateTransaction(1, mockTransaction);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaClient.transaction.update).toHaveBeenCalled();
      expect(exchangeRateUtil.getExchangeRate).toHaveBeenCalledTimes(1);
    });
  });

  describe("getTransactionKeys", () => {
    it("should return a set of transaction keys", async () => {
      const mockKeys = ["01-02-2024-Test Transaction"];
      const mockRecords = [
        {
          date: "01-02-2024",
          description: "Test Transaction",
        },
      ];

      mockPrismaClient.transaction.findMany.mockResolvedValue(mockRecords);

      const result = await getTransactionKeys(mockKeys);

      expect(result).toBeInstanceOf(Set);
      expect(result.has("01-02-2024-Test Transaction")).toBe(true);
    });
  });

  describe("getTransactionById", () => {
    it("should return a transaction by id", async () => {
      const mockTransaction = {
        id: 1,
        description: "Test Transaction",
      };

      mockPrismaClient.transaction.findUnique.mockResolvedValue(
        mockTransaction
      );

      const result = await getTransactionById(1);

      expect(result).toEqual(mockTransaction);
      expect(mockPrismaClient.transaction.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null for non-existent transaction", async () => {
      mockPrismaClient.transaction.findUnique.mockResolvedValue(null);

      const result = await getTransactionById(999);

      expect(result).toBeNull();
    });
  });
});
