import { PrismaClient } from "@prisma/client";
import {
  saveTransactions,
  createTransaction,
  checkDuplicateTransaction,
  softDeleteTransaction,
  getTransactions,
  updateTransaction,
} from "../src/services/databaseOperations.service";

jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    transaction: {
      createMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe("Database Operations Service", () => {
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
          date: "01-01-2021",
          description: "Test",
          amount: "100",
          currency: "USD",
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
          date: "01-01-2021",
          description: "Test",
          amount: "100",
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
        date: "01-01-2021",
        description: "Test",
        amount: "100",
        currency: "USD",
      };
      await createTransaction(transaction);
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: transaction,
      });
    });

    it("should handle errors during transaction creation", async () => {
      const transaction = {
        date: "01-01-2021",
        description: "Test",
        amount: "100",
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
    it("should return true if a duplicate transaction is found", async () => {
      const transaction = {
        date: "01-01-2021",
        description: "Test",
        amount: "100",
        currency: "USD",
      };
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValueOnce(
        transaction
      );
      const result = await checkDuplicateTransaction(transaction);
      expect(result).toBe(true);
    });

    it("should return false if no duplicate transaction is found", async () => {
      const transaction = {
        date: "01-01-2021",
        description: "Test",
        amount: "100",
        currency: "USD",
      };
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValueOnce(null);
      const result = await checkDuplicateTransaction(transaction);
      expect(result).toBe(false);
    });

    it("should handle errors during duplicate check", async () => {
      const transaction = {
        date: "01-01-2021",
        description: "Test",
        amount: "100",
        currency: "USD",
      };
      (prisma.transaction.findFirst as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );
      await expect(checkDuplicateTransaction(transaction)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("softDeleteTransaction", () => {
    it("should mark a transaction as deleted in the database", async () => {
      const transactionId = 1;
      const mockTransaction = {
        id: transactionId,
        date: "01-01-2021",
        description: "Test",
        amount: "100",
        currency: "USD",
        isDeleted: true,
      };
      (prisma.transaction.update as jest.Mock).mockResolvedValueOnce(
        mockTransaction
      );

      const result = await softDeleteTransaction(transactionId);
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: transactionId },
        data: { isDeleted: true },
      });
      expect(result).toEqual(mockTransaction);
    });

    it("should handle errors during soft delete", async () => {
      const transactionId = 1;
      (prisma.transaction.update as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );
      await expect(softDeleteTransaction(transactionId)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getTransactions service", () => {
    let prisma: PrismaClient;

    beforeEach(() => {
      prisma = new PrismaClient();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should fetch transactions with pagination", async () => {
      const mockTransactions = [
        {
          id: 1,
          date: "01-01-2021",
          description: "Test 1",
          amount: "100",
          currency: "USD",
          isDeleted: false,
        },
        {
          id: 2,
          Date: "01-02-2021",
          Description: "Test 2",
          Amount: "200",
          Currency: "USD",
          isDeleted: false,
        },
      ];
      const mockTotalCount = 2;

      (prisma.transaction.findMany as jest.Mock).mockResolvedValueOnce(
        mockTransactions
      );
      (prisma.transaction.count as jest.Mock).mockResolvedValueOnce(
        mockTotalCount
      );

      const page = 1;
      const limit = 10;

      const result = await getTransactions(page, limit);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        orderBy: { Date: "desc" },
        skip: 0,
        take: limit,
      });
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
      expect(result).toEqual({
        transactions: mockTransactions,
        totalCount: mockTotalCount,
      });
    });

    it("should handle errors during fetching transactions", async () => {
      (prisma.transaction.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      const page = 1;
      const limit = 10;

      await expect(getTransactions(page, limit)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getTransactions service", () => {
    let prisma: PrismaClient;

    beforeEach(() => {
      prisma = new PrismaClient();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should fetch transactions with pagination", async () => {
      const mockTransactions = [
        {
          id: 1,
          Date: "01-01-2021",
          Description: "Test 1",
          Amount: "100",
          Currency: "USD",
          isDeleted: false,
        },
        {
          id: 2,
          Date: "01-02-2021",
          Description: "Test 2",
          Amount: "200",
          Currency: "USD",
          isDeleted: false,
        },
      ];
      const mockTotalCount = 2;

      (prisma.transaction.findMany as jest.Mock).mockResolvedValueOnce(
        mockTransactions
      );
      (prisma.transaction.count as jest.Mock).mockResolvedValueOnce(
        mockTotalCount
      );

      const page = 1;
      const limit = 10;

      const result = await getTransactions(page, limit);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        orderBy: { Date: "desc" },
        skip: 0,
        take: limit,
      });
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
      expect(result).toEqual({
        transactions: mockTransactions,
        totalCount: mockTotalCount,
      });
    });

    it("should handle errors during fetching transactions", async () => {
      (prisma.transaction.findMany as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      const page = 1;
      const limit = 10;

      await expect(getTransactions(page, limit)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("updateTransaction service", () => {
    let prisma: PrismaClient;

    beforeEach(() => {
      prisma = new PrismaClient();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should update a transaction and return the updated transaction", async () => {
      const mockTransaction = {
        id: 1,
        Date: "01-01-2021",
        Description: "Updated Description",
        Amount: "150",
        Currency: "USD",
        isDeleted: false,
      };

      (prisma.transaction.update as jest.Mock).mockResolvedValueOnce(
        mockTransaction
      );

      const id = 1;
      const transactionData = {
        Description: "Updated Description",
        Amount: "150",
      };

      const result = await updateTransaction(id, transactionData);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id },
        data: transactionData,
      });
      expect(result).toEqual(mockTransaction);
    });

    it("should handle errors during transaction update", async () => {
      (prisma.transaction.update as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      const id = 1;
      const transactionData = {
        Description: "Updated Description",
        Amount: "150",
      };

      await expect(updateTransaction(id, transactionData)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
